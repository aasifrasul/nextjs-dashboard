import { Task, User } from '@/app/lib/store/features/tasks/types';

interface Props {
	users: User[];
	selectedTasks: string[];
	filteredTasks: Task[];
	selectAllTasks: () => void;
	clearSelection: () => void;
	selectTask: (taskId: string) => void;
	deselectTask: (taskId: string) => void;
	openEditModal: (task: Task) => void;
	handleDeleteTask: (taskId: string) => void;
}

export function TasksTable({
	users,
	selectedTasks,
	filteredTasks,
	selectAllTasks,
	clearSelection,
	selectTask,
	deselectTask,
	openEditModal,
	handleDeleteTask,
}: Props) {
	return (
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
					{filteredTasks.map((task: Task) => {
						const {
							assigneeId,
							id = '',
							title,
							status,
							priority,
							description,
						} = task;
						return (
							<tr key={id} className="hover:bg-gray-50">
								<td className="px-6 py-4 whitespace-nowrap">
									<input
										type="checkbox"
										checked={selectedTasks.includes(id)}
										onChange={(e) =>
											e.target.checked
												? selectTask(id)
												: deselectTask(id)
										}
										className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900">
										{title}
									</div>
									<div className="text-sm text-gray-500">{description}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
											status === 'completed'
												? 'bg-green-100 text-green-800'
												: status === 'in_progress'
													? 'bg-yellow-100 text-yellow-800'
													: 'bg-gray-100 text-gray-800'
										}`}
									>
										{status.replace('_', ' ')}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
											priority === 'high'
												? 'bg-red-100 text-red-800'
												: priority === 'medium'
													? 'bg-yellow-100 text-yellow-800'
													: 'bg-green-100 text-green-800'
										}`}
									>
										{priority}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900">
										{users.find((u: User) => u.id === assigneeId)?.name ||
											'Unassigned'}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button
										onClick={() => openEditModal(task)}
										className="text-blue-600 hover:text-blue-900 mr-3"
									>
										Edit
									</button>
									<button
										onClick={() => handleDeleteTask(id)}
										className="text-red-600 hover:text-red-900"
									>
										Delete
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			{filteredTasks.length === 0 && (
				<div className="text-center py-12">
					<p className="text-gray-500">No tasks found. Create your first task!</p>
				</div>
			)}
		</div>
	);
}
