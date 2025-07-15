export interface User {
	id: string;
	title: string;
	createdAt: string;
	updatedAt: string;
	tags?: string[];
	estimatedHours?: number;
	actualHours?: number;
	subtasks?: string[];
}

export interface UserFilters {
	tags?: string[];
	createdAfter?: string;
	createdBefore?: string;
}

export interface CreateUserData {
	title: string;
	description?: string;
	tags?: string[];
	estimatedHours?: number;
	parentUserId?: string;
}

export interface UpdateUserData {
	title?: string;
	description?: string;
	assigneeId?: string;
	dueDate?: string;
	tags?: string[];
	estimatedHours?: number;
	actualHours?: number;
}

// User types
export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role: 'admin' | 'manager' | 'member';
	createdAt: string;
	updatedAt: string;
}

export interface CreateUserData {
	name: string;
	email: string;
	role?: User['role'];
	avatar?: string;
}

export interface UpdateUserData {
	name?: string;
	email?: string;
	role?: User['role'];
	avatar?: string;
}

// Notification types
export interface Notification {
	id: string;
	title: string;
	message: string;
	read: boolean;
	createdAt: string;
	taskId?: string;
	userId?: string;
}

// API Response types
export interface ApiResponse<T> {
	data: T;
	message?: string;
	status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// WebSocket message types
export interface WebSocketMessage {
	payload: any;
	timestamp: string;
}
