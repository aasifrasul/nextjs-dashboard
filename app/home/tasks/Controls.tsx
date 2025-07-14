import { Task, User, TaskFilters } from '@/app/lib/store/features/tasks/types';

interface Props {
	users: User[];
	selectedTasks: string[];
	searchTerm: string;
	filters: TaskFilters;
	handleFilterChange: (filters: TaskFilters) => void;
	handleSearchChange: (text: string) => void;
	openCreateModal: () => void;
	handleBatchProcess: () => void;
	batchProcessing: boolean;
	clearSelection: () => void;
}

export function Controls({
	users,
	selectedTasks,
	searchTerm,
	filters,
	handleFilterChange,
	handleSearchChange,
	openCreateModal,
	handleBatchProcess,
	batchProcessing,
	clearSelection,
}: Props) {
	return (
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
							handleFilterChange({
								...filters,
								status: e.target.value as Task['status'],
							})
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
							handleFilterChange({
								...filters,
								priority: e.target.value as Task['priority'],
							})
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
						{users.map((user: User) => (
							<option key={user.id} value={user.id}>
								{user.name}
							</option>
						))}
					</select>
				</div>

				<div className="flex gap-2">
					<button
						onClick={openCreateModal}
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
	);
}
