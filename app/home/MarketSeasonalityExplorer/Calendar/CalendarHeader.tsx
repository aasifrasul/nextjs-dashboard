import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
	currentDate: Date;
	isTransitioning: boolean;
	onPrevMonth: () => void;
	onNextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
	currentDate,
	isTransitioning,
	onPrevMonth,
	onNextMonth,
}) => (
	<div className="flex justify-between items-center mb-6">
		<button
			onClick={onPrevMonth}
			className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all duration-200 text-gray-200 hover:scale-105"
			aria-label="Previous month"
		>
			<ChevronLeft className="w-5 h-5" />
		</button>

		<h2
			className={`text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent transition-opacity duration-150 ${
				isTransitioning ? 'opacity-50' : 'opacity-100'
			}`}
		>
			{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
		</h2>

		<button
			onClick={onNextMonth}
			className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all duration-200 text-gray-200 hover:scale-105"
			aria-label="Next month"
		>
			<ChevronRight className="w-5 h-5" />
		</button>
	</div>
);
