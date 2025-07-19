'use client';

import { useState } from 'react';
import {
	useAppSelector,
	useAppDispatch,
	useTaskSelection,
	useNotifications,
} from '@/app/lib/store/hooks';
import {
	useGetTasksQuery,
	useCreateTaskMutation,
	useUpdateTaskMutation,
	useDeleteTaskMutation,
	useGetTaskStatsQuery,
} from '@/app/lib/store/features/tasks/tasksApi';
import {
	setFilters,
	setSearchTerm,
	setSorting,
	processTaskBatch,
	selectFilteredTasks,
} from '@/app/lib/store/features/tasks/tasksSlice';
import { openModal, closeModal, selectActiveModal } from '@/app/lib/store/features/ui/uiSlice';
import { useUsers } from '@/app/lib/store/features/users/hooks';
import { Task, TaskFilters } from '@/app/lib/store/features/tasks/types';
import { StoreProvider } from '@/app/stores/provider';
import { Badge } from '@/app/ui/Badge';

import { TaskModal } from './TaskModal';
import { TasksTable } from './TasksTable';
import { StatsCard } from './StatsCard';
import { Controls } from './Controls';

import { TaskFormData } from './types';
import { Notifications } from './Notifications';

function TaskDashboard() {
	const dispatch = useAppDispatch();
	const { selectedTasks, selectTask, deselectTask, selectAllTasks, clearSelection } =
		useTaskSelection();
	const { addNotification } = useNotifications();
	const { unreadCount } = useNotifications();
	const [showNotifications, setShowNotifications] = useState(false);

	// RTK Query hooks
	const {
		data: tasks = [],
		isLoading: tasksLoading,
		error: tasksError,
	} = useGetTasksQuery({});
	const { users } = useUsers();
	const { data: stats, isLoading: statsLoading } = useGetTaskStatsQuery();

	// Mutations
	const [createTask] = useCreateTaskMutation();
	const [updateTask] = useUpdateTaskMutation();
	const [deleteTask] = useDeleteTaskMutation();

	// UI state from uiSlice
	const activeModal = useAppSelector(selectActiveModal);

	// Local state - only for task editing data
	const [editingTask, setEditingTask] = useState<Task | null>(null);

	// Selectors
	const filteredTasks = useAppSelector(selectFilteredTasks);
	const searchTerm = useAppSelector((state) => state.tasks.searchTerm);
	const filters = useAppSelector((state) => state.tasks.filters);
	const batchProcessing = useAppSelector((state) => state.tasks.batchProcessing);

	// Computed values
	const isModalOpen = activeModal === 'task-modal';

	// Handlers
	const handleCreateTask = async (data: TaskFormData) => {
		if (!data.title.trim()) {
			addNotification(
				{
					message: 'Please enter a task title',
					type: 'error',
					createdAt: new Date().toISOString(),
					read: false,
				},
				true,
				4000,
			); // Auto-dismiss after 4 seconds
			return;
		}

		try {
			await createTask(data).unwrap();
			dispatch(closeModal());
			addNotification(
				{
					message: 'Task created successfully!',
					type: 'success',
					createdAt: new Date().toISOString(),
					read: false,
				},
				true,
				3000,
			); // Auto-dismiss after 3 seconds
		} catch (error) {
			addNotification(
				{
					message: 'Failed to create task',
					type: 'error',
					createdAt: new Date().toISOString(),
					read: false,
				},
				true,
				5000,
			); // Keep errors longer
		}
	};

	const handleUpdateTask = async (data: TaskFormData) => {
		if (!editingTask?.id) return;

		try {
			await updateTask({ updates: data, id: editingTask.id }).unwrap();
			addNotification(
				{
					message: 'Task updated successfully!',
					type: 'success',
					createdAt: new Date().toISOString(),
					read: false,
				},
				true,
				3000,
			);
			setEditingTask(null);
			dispatch(closeModal());
		} catch (error) {
			addNotification(
				{
					message: 'Failed to update task',
					type: 'error',
					createdAt: new Date().toISOString(),
					read: false,
				},
				true,
				5000,
			);
		}
	};

	const handleDeleteTask = async (taskId: string) => {
		try {
			await deleteTask(taskId).unwrap();
			addNotification(
				{
					message: 'Task deleted successfully!',
					type: 'success',
					createdAt: new Date().toISOString(),
					read: false,
				},
				true,
				3000,
			);
		} catch (error) {
			addNotification(
				{
					message: 'Failed to delete task',
					type: 'error',
					createdAt: new Date().toISOString(),
					read: false,
				},
				true,
				5000,
			);
		}
	};

	const handleBatchProcess = async () => {
		if (selectedTasks.length === 0) {
			addNotification(
				{
					message: 'Please select tasks to process',
					type: 'warning',
					createdAt: new Date().toISOString(),
					read: false,
				},
				true,
				3000,
			);
			return;
		}

		try {
			await dispatch(processTaskBatch(selectedTasks)).unwrap();
			addNotification(
				{
					message: `Processed ${selectedTasks.length} tasks`,
					type: 'success',
					createdAt: new Date().toISOString(),
					read: false,
				},
				true,
				4000,
			);
		} catch (error) {
			addNotification(
				{
					message: 'Batch processing failed',
					type: 'error',
					createdAt: new Date().toISOString(),
					read: false,
				},
				true,
				5000,
			);
		}
	};

	const handleFilterChange = (newFilters: TaskFilters) => {
		dispatch(setFilters(newFilters));
	};

	const handleSearchChange = (term: string) => {
		dispatch(setSearchTerm(term));
	};

	const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
		dispatch(setSorting({ sortBy: sortBy as any, sortOrder }));
	};

	const openCreateModal = () => {
		setEditingTask(null);
		dispatch(openModal('task-modal'));
	};

	const openEditModal = (task: Task) => {
		setEditingTask(task);
		dispatch(openModal('task-modal'));
	};

	const closeTaskModal = () => {
		dispatch(closeModal());
		setEditingTask(null);
	};

	const handleModalSubmit = (data: TaskFormData) => {
		if (editingTask) {
			handleUpdateTask(data);
		} else {
			handleCreateTask(data);
		}
	};

	if (tasksLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (tasksError) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-red-600">Error loading tasks. Please try again.</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto p-6 relative">
			<Notifications maxVisible={3} position="top-right" />
			<div className="mb-8 flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Task Management Dashboard
					</h1>
					<p className="text-gray-600">Manage your tasks with Redux Toolkit</p>
				</div>

				{/* Notifications Badge */}
				<Badge
					count={unreadCount}
					onClick={() => setShowNotifications(!showNotifications)}
					color="red"
				>
					<button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 17h5l-5 5v-5zM21 12c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10z"
							/>
						</svg>
					</button>
				</Badge>
			</div>
			{stats && <StatsCard stats={stats} />}
			<Controls
				users={users}
				selectedTasks={selectedTasks}
				searchTerm={searchTerm}
				filters={filters}
				handleFilterChange={handleFilterChange}
				handleSearchChange={handleSearchChange}
				openCreateModal={openCreateModal}
				handleBatchProcess={handleBatchProcess}
				batchProcessing={batchProcessing}
				clearSelection={clearSelection}
			/>
			<TasksTable
				selectedTasks={selectedTasks}
				filteredTasks={filteredTasks}
				selectAllTasks={selectAllTasks}
				clearSelection={clearSelection}
				selectTask={selectTask}
				deselectTask={deselectTask}
				openEditModal={openEditModal}
				handleDeleteTask={handleDeleteTask}
				users={users}
			/>
			<TaskModal
				isOpen={isModalOpen}
				onClose={closeTaskModal}
				onSubmit={handleModalSubmit}
				editingTask={editingTask}
				isEdit={!!editingTask}
				users={users}
			/>
		</div>
	);
}

export default function page() {
	return (
		<StoreProvider>
			<TaskDashboard />
		</StoreProvider>
	);
}
