import { Calendar, BarChart3, Activity } from 'lucide-react';

export const SimpleDashboard = () => {
	return (
		<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 flex flex-col items-center justify-center min-h-[400px] text-center">
			<Calendar className="w-16 h-16 text-gray-400 mb-4" />
			<h3 className="text-xl font-semibold text-gray-300 mb-2">No Date Selected</h3>
			<p className="text-gray-400 mb-4">
				Click on a date in the calendar to view detailed market data and analytics.
			</p>
			<div className="grid grid-cols-2 gap-4 text-sm">
				<div className="bg-gray-700/30 p-3 rounded-lg">
					<Activity className="w-8 h-8 text-blue-400 mb-2" />
					<div className="font-medium">Live Data</div>
					<div className="text-gray-400">Real-time updates</div>
				</div>
				<div className="bg-gray-700/30 p-3 rounded-lg">
					<BarChart3 className="w-8 h-8 text-purple-400 mb-2" />
					<div className="font-medium">Analytics</div>
					<div className="text-gray-400">Technical indicators</div>
				</div>
			</div>
		</div>
	);
};
