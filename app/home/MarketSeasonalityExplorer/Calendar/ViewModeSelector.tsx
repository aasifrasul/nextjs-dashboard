import { ViewMode } from '../types';

interface ViewModeSelectorProps {
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
	viewMode,
	onViewModeChange,
}) => (
	<div className="flex gap-1 bg-gray-700/30 rounded-lg p-1 mb-4">
		{(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
			<button
				key={mode}
				onClick={() => onViewModeChange(mode)}
				className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
					viewMode === mode
						? 'bg-purple-600 text-white shadow-md'
						: 'text-gray-400 hover:text-gray-200 hover:bg-gray-600/50'
				}`}
			>
				{mode.charAt(0).toUpperCase() + mode.slice(1)}
			</button>
		))}
	</div>
);
