'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Permission, hasPermission } from '@/app/lib/permissions';
import { ReactNode } from 'react';

interface PermissionGuardProps {
	permission: Permission;
	children: ReactNode;
	fallback?: ReactNode;
}

export function PermissionGuard({
	permission,
	children,
	fallback = null,
}: PermissionGuardProps) {
	const { user } = useAuth();

	if (!user || !hasPermission(user.role, permission)) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}

// Usage example
export function DashboardControls() {
	return (
		<div>
			<PermissionGuard permission={Permission.EDIT_USERS}>
				<button>Edit Users</button>
			</PermissionGuard>

			<PermissionGuard
				permission={Permission.EXPORT_DATA}
				fallback={<span>Export not available</span>}
			>
				<button>Export Data</button>
			</PermissionGuard>
		</div>
	);
}
