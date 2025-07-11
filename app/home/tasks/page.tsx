'use client';

import { useState } from 'react';
import {
	useAppSelector,
	useAppDispatch,
	useTaskSelection,
	useToast,
} from '@/app/lib/store/hooks';
import {
	useGetTasksQuery,
	useCreateTaskMutation,
	useUpdateTaskMutation,
	useDeleteTaskMutation,
	useGetTaskStatsQuery,
} from '@/app/lib/store/features/tasks/tasksApi';
import { useGetUsersQuery } from '@/app/lib/store/features/users/usersApi';
import {
	setFilters,
	setSearchTerm,
	setSorting,
	processTaskBatch,
	selectFilteredTasks,
} from '@/app/lib/store/features/tasks/tasksSlice';
import { Task, TaskFilters } from '@/app/lib/store/features/tasks/types';
import { StoreProvider } from '@/app/lib/store/provider';

function TaskDashboard() {
	const dispatch = useAppDispatch();
	const { showToast } = useToast();
	const { selectedTasks, selectTask, deselectTask, selectAllTasks, clearSelection } =
		useTaskSelection();

	// RTK Query hooks
	const {
		data: tasks = [],
		isLoading: tasksLoading,
		error: tasksError,
	} = useGetTasksQuery({});
	const { data: users = [], isLoading: usersLoading } = useGetUsersQuery();
	const { data: stats, isLoading: statsLoading } = useGetTaskStatsQuery();

	// Mutations
	const [createTask] = useCreateTaskMutation();
	const [updateTask] = useUpdateTaskMutation();
	const [deleteTask] = useDeleteTaskMutation();

	// Local state
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [newTask, setNewTask] = useState({
		title: '',
		description: '',
		priority: 'medium' as const,
		assigneeId: '',
	});

	// Selectors
	const filteredTasks = useAppSelector(selectFilteredTasks);
	const searchTerm = useAppSelector((state) => state.tasks.searchTerm);
	const filters = useAppSelector((state) => state.tasks.filters);
	const batchProcessing = useAppSelector((state) => state.tasks.batchProcessing);

	// Handlers
	const handleCreateTask = async () => {
		if (!newTask.title.trim()) {
			showToast('Please enter a task title', 'error');
			return;
		}

		try {
			await createTask(newTask).unwrap();
			setNewTask({ title: '', description: '', priority: 'medium', assigneeId: '' });
			setIsCreateModalOpen(false);
			showToast('Task created successfully!', 'success');
		} catch (error) {
			showToast('Failed to create task', 'error');
		}
	};

	const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
		try {
			await updateTask({ id: taskId, updates }).unwrap();
			showToast('Task updated successfully!', 'success');
			setEditingTask(null);
		} catch (error) {
			showToast('Failed to update task', 'error');
		}
	};

	const handleDeleteTask = async (taskId: string) => {
		try {
			await deleteTask(taskId).unwrap();
			showToast('Task deleted successfully!', 'success');
		} catch (error) {
			showToast('Failed to delete task', 'error');
		}
	};

	const handleBatchProcess = async () => {
		if (selectedTasks.length === 0) {
			showToast('Please select tasks to process', 'warning');
			return;
		}

		try {
			await dispatch(processTaskBatch(selectedTasks)).unwrap();
			showToast(`Processed ${selectedTasks.length} tasks`, 'success');
		} catch (error) {
			showToast('Batch processing failed', 'error');
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

	const toasts: any[] = [];

	return (
		<div className="max-w-7xl mx-auto p-6 relative">
			{/* Toast notifications */}
			<div className="fixed top-4 right-4 z-50 space-y-2">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className={`px-4 py-3 rounded-md shadow-lg text-white ${
							toast.type === 'success'
								? 'bg-green-500'
								: toast.type === 'error'
									? 'bg-red-500'
									: toast.type === 'warning'
										? 'bg-yellow-500'
										: 'bg-blue-500'
						}`}
					>
						{toast.message}
					</div>
				))}
			</div>

			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Task Management Dashboard
				</h1>
				<p className="text-gray-600">Manage your tasks with Redux Toolkit</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
					<p className="text-3xl font-bold text-blue-600">{stats?.total}</p>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg font-semibold text-gray-700">Completed</h3>
					<p className="text-3xl font-bold text-green-600">{stats?.completed}</p>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
					<p className="text-3xl font-bold text-yellow-600">{stats?.inProgress}</p>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg font-semibold text-gray-700">Pending</h3>
					<p className="text-3xl font-bold text-red-600">{stats?.pending}</p>
				</div>
			</div>

			{/* Controls */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-8">
				<div className="flex flex-wrap gap-4 items-center justify-between">
					<div className="flex gap-4 items-center">
						<input
							type="text"
							placeholder="Search tasks..."
							value={searchTerm}
							onChange={(e) => handleSearchChange(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>

						<select
							value={filters.status || ''}
							onChange={(e) =>
								handleFilterChange({ ...filters, status: e.target.value })
							}
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">All Status</option>
							<option value="todo">Todo</option>
							<option value="in_progress">In Progress</option>
							<option value="completed">Completed</option>
						</select>

						<select
							value={filters.priority || ''}
							onChange={(e) =>
								handleFilterChange({ ...filters, priority: e.target.value })
							}
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">All Priority</option>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>

						<select
							value={filters.assigneeId || ''}
							onChange={(e) =>
								handleFilterChange({ ...filters, assigneeId: e.target.value })
							}
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">All Assignees</option>
							{users.map((user) => (
								<option key={user.id} value={user.id}>
									{user.name}
								</option>
							))}
						</select>
					</div>

					<div className="flex gap-2">
						<button
							onClick={() => setIsCreateModalOpen(true)}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							Create Task
						</button>

						{selectedTasks.length > 0 && (
							<div className="flex gap-2">
								<button
									onClick={handleBatchProcess}
									disabled={batchProcessing}
									className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
								>
									{batchProcessing
										? 'Processing...'
										: `Process ${selectedTasks.length}`}
								</button>
								<button
									onClick={() => clearSelection()}
									className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
								>
									Clear Selection
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Tasks Table */}
			<div className="bg-white rounded-lg shadow-md overflow-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								<input
									type="checkbox"
									checked={
										selectedTasks.length === filteredTasks.length &&
										filteredTasks.length > 0
									}
									onChange={(e) =>
										e.target.checked ? selectAllTasks() : clearSelection()
									}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Title
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Priority
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Assignee
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{filteredTasks.map((task) => (
							<tr key={task.id} className="hover:bg-gray-50">
								<td className="px-6 py-4 whitespace-nowrap">
									<input
										type="checkbox"
										checked={selectedTasks.includes(task.id)}
										onChange={(e) =>
											e.target.checked
												? selectTask(task.id)
												: deselectTask(task.id)
										}
										className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900">
										{task.title}
									</div>
									<div className="text-sm text-gray-500">
										{task.description}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
											task.status === 'completed'
												? 'bg-green-100 text-green-800'
												: task.status === 'in_progress'
													? 'bg-yellow-100 text-yellow-800'
													: 'bg-gray-100 text-gray-800'
										}`}
									>
										{task.status.replace('_', ' ')}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
											task.priority === 'high'
												? 'bg-red-100 text-red-800'
												: task.priority === 'medium'
													? 'bg-yellow-100 text-yellow-800'
													: 'bg-green-100 text-green-800'
										}`}
									>
										{task.priority}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900">
										{users.find((u) => u.id === task.assigneeId)?.name ||
											'Unassigned'}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button
										onClick={() => setEditingTask(task)}
										className="text-blue-600 hover:text-blue-900 mr-3"
									>
										Edit
									</button>
									<button
										onClick={() => handleDeleteTask(task.id)}
										className="text-red-600 hover:text-red-900"
									>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{filteredTasks.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-500">
							No tasks found. Create your first task!
						</p>
					</div>
				)}
			</div>

			{/* Create Task Modal */}
			{isCreateModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
						<h2 className="text-xl font-bold mb-4">Create New Task</h2>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Title
								</label>
								<input
									type="text"
									value={newTask.title}
									onChange={(e) =>
										setNewTask({ ...newTask, title: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Enter task title"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Description
								</label>
								<textarea
									value={newTask.description}
									onChange={(e) =>
										setNewTask({ ...newTask, description: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={3}
									placeholder="Enter task description"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Priority
								</label>
								<select
									value={newTask.priority}
									onChange={(e) =>
										setNewTask({ ...newTask, priority: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="low">Low</option>
									<option value="medium">Medium</option>
									<option value="high">High</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Assignee
								</label>
								<select
									value={newTask.assigneeId}
									onChange={(e) =>
										setNewTask({ ...newTask, assigneeId: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Select assignee</option>
									{users.map((user) => (
										<option key={user.id} value={user.id}>
											{user.name}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="flex justify-end space-x-3 mt-6">
							<button
								onClick={() => setIsCreateModalOpen(false)}
								className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleCreateTask}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								Create Task
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Task Modal */}
			{editingTask && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
						<h2 className="text-xl font-bold mb-4">Edit Task</h2>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Title
								</label>
								<input
									type="text"
									value={editingTask.title}
									onChange={(e) =>
										setEditingTask({
											...editingTask,
											title: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Description
								</label>
								<textarea
									value={editingTask.description}
									onChange={(e) =>
										setEditingTask({
											...editingTask,
											description: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={3}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Status
								</label>
								<select
									value={editingTask.status}
									onChange={(e) =>
										setEditingTask({
											...editingTask,
											status: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="todo">Todo</option>
									<option value="in_progress">In Progress</option>
									<option value="completed">Completed</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Priority
								</label>
								<select
									value={editingTask.priority}
									onChange={(e) =>
										setEditingTask({
											...editingTask,
											priority: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="low">Low</option>
									<option value="medium">Medium</option>
									<option value="high">High</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Assignee
								</label>
								<select
									value={editingTask.assigneeId}
									onChange={(e) =>
										setEditingTask({
											...editingTask,
											assigneeId: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Select assignee</option>
									{users.map((user) => (
										<option key={user.id} value={user.id}>
											{user.name}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="flex justify-end space-x-3 mt-6">
							<button
								onClick={() => setEditingTask(null)}
								className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={() => handleUpdateTask(editingTask.id, editingTask)}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								Update Task
							</button>
						</div>
					</div>
				</div>
			)}
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
