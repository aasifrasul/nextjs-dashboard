interface Props {
	stats: { total: number; completed: number; pending: number; inProgress: number };
}

export function StatsCard({ stats }: Props) {
	return (
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
	);
}
