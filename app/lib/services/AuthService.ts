import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import { auth } from '@/auth';
import { getUserById } from '@/app/lib/database';
import { UserRole, Permission } from '@/app/lib/definitions';

interface TokenPayload {
	userId: string;
	email: string;
	role: string;
}

// Role-based permissions mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
	[UserRole.ADMIN]: [
		Permission.VIEW_DASHBOARD,
		Permission.EDIT_USERS,
		Permission.DELETE_USERS,
		Permission.VIEW_ANALYTICS,
		Permission.EXPORT_DATA,
		Permission.MANAGE_SETTINGS,
		Permission.VIEW_AUDIT_LOGS,
	],
	[UserRole.MANAGER]: [
		Permission.VIEW_DASHBOARD,
		Permission.EDIT_USERS,
		Permission.VIEW_ANALYTICS,
		Permission.EXPORT_DATA,
		Permission.VIEW_AUDIT_LOGS,
	],
	[UserRole.ANALYST]: [
		Permission.VIEW_DASHBOARD,
		Permission.VIEW_ANALYTICS,
		Permission.EXPORT_DATA,
	],
	[UserRole.USER]: [Permission.VIEW_DASHBOARD],
};

export class AuthService {
	private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET!;
	private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
	private static readonly ACCESS_TOKEN_EXPIRY = '15m';
	private static readonly REFRESH_TOKEN_EXPIRY = '7d';

	static generateTokens(payload: TokenPayload) {
		const accessToken = jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
			expiresIn: this.ACCESS_TOKEN_EXPIRY,
		});

		const refreshToken = jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
			expiresIn: this.REFRESH_TOKEN_EXPIRY,
		});

		return { accessToken, refreshToken };
	}

	static verifyAccessToken(token: string): TokenPayload | null {
		try {
			return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
		} catch {
			return null;
		}
	}

	static verifyRefreshToken(token: string): TokenPayload | null {
		try {
			return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as TokenPayload;
		} catch {
			return null;
		}
	}

	static async setAuthCookies(tokens: { accessToken: string; refreshToken: string }) {
		const cookieStore = await cookies();

		cookieStore.set('accessToken', tokens.accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 15 * 60, // 15 minutes
			path: '/',
		});

		cookieStore.set('refreshToken', tokens.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60, // 7 days
			path: '/',
		});
	}

	static async clearAuthCookies() {
		const cookieStore = await cookies();
		cookieStore.delete('accessToken');
		cookieStore.delete('refreshToken');
	}
	/**
	 * Check if user has a specific permission
	 */
	static hasPermission(userRole: UserRole, permission: Permission): boolean {
		return rolePermissions[userRole]?.includes(permission) || false;
	}

	/**
	 * Check if user has any of the specified permissions
	 */
	static hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
		return permissions.some((permission) => this.hasPermission(userRole, permission));
	}

	/**
	 * Check if user has all specified permissions
	 */
	static hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
		return permissions.every((permission) => this.hasPermission(userRole, permission));
	}

	/**
	 * Get current authenticated user
	 */
	static async getCurrentUser() {
		const session = await auth();
		return session?.user || null;
	}

	/**
	 * Get fresh user data from database
	 */
	static async refreshUserData(userId: string) {
		return await getUserById(userId);
	}

	/**
	 * Check if current user has permission
	 */
	static async currentUserHasPermission(permission: Permission): Promise<boolean> {
		const user = await this.getCurrentUser();
		if (!user) return false;
		return this.hasPermission(user.role, permission);
	}

	/**
	 * Require permission or throw error
	 */
	static async requirePermission(permission: Permission): Promise<void> {
		const hasPermission = await this.currentUserHasPermission(permission);
		if (!hasPermission) {
			throw new Error(`Access denied: Missing permission ${permission}`);
		}
	}

	/**
	 * Get user permissions based on role
	 */
	static getUserPermissions(role: UserRole): Permission[] {
		return rolePermissions[role] || [];
	}
}

// Server action helper for permission checking
export async function withPermission<T>(
	permission: Permission,
	action: () => Promise<T>,
): Promise<T> {
	await AuthService.requirePermission(permission);
	return action();
}

// Higher-order function for API routes
export function requireAuth(handler: Function) {
	return async (request: Request, ...args: any[]) => {
		const session = await auth();
		if (!session?.user) {
			return Response.json({ error: 'Unauthorized' }, { status: 401 });
		}
		return handler(request, ...args);
	};
}

export function requirePermission(permission: Permission) {
	return function (handler: Function) {
		return async (request: Request, ...args: any[]) => {
			const session = await auth();
			if (!session?.user) {
				return Response.json({ error: 'Unauthorized' }, { status: 401 });
			}

			if (!AuthService.hasPermission(session.user.role, permission)) {
				return Response.json({ error: 'Forbidden' }, { status: 403 });
			}

			return handler(request, ...args);
		};
	};
}
