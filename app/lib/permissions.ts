export enum Permission {
	VIEW_DASHBOARD = 'view_dashboard',
	EDIT_USERS = 'edit_users',
	DELETE_USERS = 'delete_users',
	VIEW_ANALYTICS = 'view_analytics',
	EXPORT_DATA = 'export_data',
	MANAGE_SETTINGS = 'manage_settings',
}

export enum Role {
	ADMIN = 'admin',
	MANAGER = 'manager',
	USER = 'user',
	VIEWER = 'viewer',
}

export const rolePermissions: Record<Role, Permission[]> = {
	[Role.ADMIN]: [
		Permission.VIEW_DASHBOARD,
		Permission.EDIT_USERS,
		Permission.DELETE_USERS,
		Permission.VIEW_ANALYTICS,
		Permission.EXPORT_DATA,
		Permission.MANAGE_SETTINGS,
	],
	[Role.MANAGER]: [
		Permission.VIEW_DASHBOARD,
		Permission.EDIT_USERS,
		Permission.VIEW_ANALYTICS,
		Permission.EXPORT_DATA,
	],
	[Role.USER]: [Permission.VIEW_DASHBOARD, Permission.VIEW_ANALYTICS],
	[Role.VIEWER]: [Permission.VIEW_DASHBOARD],
};

export function hasPermission(userRole: Role, permission: Permission): boolean {
	return rolePermissions[userRole]?.includes(permission) || false;
}
