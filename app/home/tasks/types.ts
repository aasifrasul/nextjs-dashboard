import { Task } from '@/app/lib/store/features/tasks/types';

export interface TaskFormData {
	title: string;
	description: string;
	priority: Task['priority'];
	status?: Task['status'];
	assigneeId: string;
}

export interface TaskModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: TaskFormData) => void;
	editingTask: Task | null;
	isEdit?: boolean;
	users: Array<{ id: string; name: string }>;
}

export interface Toast {
	show: boolean;
	message: string;
	type: string;
	id: string;
}
