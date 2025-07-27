import { DollarSign } from 'lucide-react';

interface DashboardHeaderProps {
	selectedDate: Date | null;
	tabs: Array<{ id: string; label: string; icon: React.ComponentType<any> }>;
	activeTab: string;
	onTabClick: (tabId: string) => void;
}

export const Header: React.FC<DashboardHeaderProps> = ({
	selectedDate,
	tabs,
	activeTab,
	onTabClick,
}) => {
	return (
		<div className="p-6 border-b border-gray-700">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
					<DollarSign className="w-5 h-5 text-green-400" />
					Market Analysis
				</h3>
				<div className="text-sm text-gray-400">
					{selectedDate?.toLocaleDateString()}
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-1 bg-gray-700/30 rounded-lg p-1">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					return (
						<button
							key={tab.id}
							onClick={() => onTabClick(tab.id)}
							className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
								activeTab === tab.id
									? 'bg-purple-600 text-white shadow-md'
									: 'text-gray-400 hover:text-gray-200 hover:bg-gray-600/50'
							}`}
						>
							<Icon className="w-4 h-4" />
							{tab.label}
						</button>
					);
				})}
			</div>
		</div>
	);
};
