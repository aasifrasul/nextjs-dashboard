import { ObjectId } from 'mongodb';

export interface Task {
	id?: string;
	_id?: ObjectId;
	title: string;
	description?: string;
	status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
	priority: 'low' | 'medium' | 'high';
	assigneeId?: string;
	createdAt: string;
	updatedAt: string;
	dueDate?: string;
	tags?: string[];
	estimatedHours?: number;
	actualHours?: number;
	parentTaskId?: string;
	subtasks?: string[];
}

// MongoDB document interface (for internal database operations)
export interface TaskDocument extends Omit<Task, 'id'> {
	_id: ObjectId;
}

export interface TaskFilters {
	status?: Task['status'];
	priority?: Task['priority'];
	assigneeId?: string;
	tags?: string[];
	dueDateFrom?: string;
	dueDateTo?: string;
	createdAfter?: string;
	createdBefore?: string;
}

export interface CreateTaskData {
	title: string;
	description?: string;
	status?: Task['status'];
	priority?: Task['priority'];
	assigneeId?: string;
	dueDate?: string;
	tags?: string[];
	estimatedHours?: number;
	parentTaskId?: string;
}

export interface UpdateTaskData {
	title?: string;
	description?: string;
	status?: Task['status'];
	priority?: Task['priority'];
	assigneeId?: string;
	dueDate?: string;
	tags?: string[];
	estimatedHours?: number;
	actualHours?: number;
}

// User types
export interface User {
	id?: string;
	_id?: ObjectId;
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
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
	createdAt: string;
	read: boolean;
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
	type: 'task_updated' | 'task_created' | 'task_deleted' | 'user_online' | 'user_offline';
	payload: any;
	timestamp: string;
}
