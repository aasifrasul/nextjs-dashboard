'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Role } from '@/app/lib/permissions';

interface User {
	id: string;
	email: string;
	name: string;
	role: Role;
	lastLogin: Date;
	isActive: boolean;
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<boolean>;
	logout: () => void;
	isLoading: boolean;
	refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Auto-refresh token every 14 minutes
	useEffect(() => {
		const interval = setInterval(
			async () => {
				if (user) {
					await refreshToken();
				}
			},
			14 * 60 * 1000,
		); // 14 minutes

		return () => clearInterval(interval);
	}, [user]);

	// Check auth status on mount
	useEffect(() => {
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async () => {
		try {
			const response = await fetch('/api/auth/me');
			if (response.ok) {
				const userData = await response.json();
				setUser(userData);
			}
		} catch (error) {
			console.error('Auth check failed:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (email: string, password: string): Promise<boolean> => {
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			if (response.ok) {
				const userData = await response.json();
				setUser(userData);
				return true;
			}
			return false;
		} catch (error) {
			console.error('Login failed:', error);
			return false;
		}
	};

	const logout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
		} catch (error) {
			console.error('Logout failed:', error);
		} finally {
			setUser(null);
		}
	};

	const refreshToken = async (): Promise<boolean> => {
		try {
			const response = await fetch('/api/auth/refresh', {
				method: 'POST',
			});
			return response.ok;
		} catch (error) {
			console.error('Token refresh failed:', error);
			return false;
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				logout,
				isLoading,
				refreshToken,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
