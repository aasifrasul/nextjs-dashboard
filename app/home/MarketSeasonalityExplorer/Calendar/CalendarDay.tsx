import {
	isDateInRange,
	getVolatilityColor,
	getPerformanceIcon,
	isToday,
	isFocused,
	isSelected,
} from '../utils';

import { DateRange } from '../types';
interface CalendarDayProps {
	date: Date;
	dayData: any;
	today: Date;
	selectedDate: Date | null;
	selectedRange: DateRange | null;
	focusedDate: Date | null;
	isSelectionMode: boolean;
	isFiltered: boolean;
	onDateClick: (date: Date) => void;
	onFocus: (date: Date) => void;
	variant: 'daily' | 'weekly' | 'monthly';
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
	date,
	dayData,
	today,
	selectedDate,
	selectedRange,
	focusedDate,
	isSelectionMode,
	isFiltered,
	onDateClick,
	onFocus,
	variant,
}) => {
	const day = date.getDate();

	if (!isFiltered && Object.keys({}).length > 0) {
		const heightClass =
			variant === 'daily' ? 'h-20 sm:h-24' : variant === 'weekly' ? 'h-16' : 'h-8';
		return (
			<div
				className={`${heightClass} bg-gray-800/10 rounded-lg opacity-30 flex items-center justify-center`}
			>
				<span className="text-gray-600 text-sm">{day}</span>
			</div>
		);
	}

	const volatilityClass = dayData
		? getVolatilityColor(dayData.volatility)
		: 'from-gray-700 to-gray-600';

	if (variant === 'monthly') {
		return (
			<div
				className={`h-8 rounded cursor-pointer transition-all duration-200 flex items-center justify-center text-sm
                    ${dayData ? `bg-gradient-to-br ${volatilityClass}` : 'bg-gray-700'}
                    ${isToday(date, today) ? 'ring-2 ring-blue-400' : ''}
                    ${isSelected(date, selectedDate) ? 'ring-2 ring-purple-500' : ''}
                    hover:scale-110 hover:shadow-md`}
				onClick={() => onDateClick(date)}
			>
				<span className="text-gray-100 font-medium">{day}</span>
			</div>
		);
	}

	if (variant === 'weekly') {
		return (
			<div
				className={`relative h-16 rounded-lg p-2 cursor-pointer transition-all duration-300 group
                    bg-gradient-to-br ${volatilityClass}
                    hover:scale-105 hover:shadow-lg hover:z-10
                    ${
						isToday(date, today)
							? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900'
							: ''
					}
                    ${
						isDateInRange(date, selectedRange)
							? 'ring-2 ring-orange-500 ring-offset-1 ring-offset-gray-900'
							: ''
					}
                    ${
						isFocused(date, focusedDate)
							? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-900'
							: ''
					}
                    ${isSelectionMode ? 'hover:ring-2 hover:ring-orange-400' : ''}
                    flex items-center justify-center`}
				onClick={() => onDateClick(date)}
				onFocus={() => onFocus(date)}
				tabIndex={0}
			>
				<span className="text-sm font-bold text-gray-100">{day}</span>
				{dayData && (
					<div className="absolute bottom-1 right-1">
						{getPerformanceIcon(dayData.performance)}
					</div>
				)}
			</div>
		);
	}

	// Daily variant (default)
	const liquiditySize = dayData ? Math.min((dayData.liquidity / 100) * 60 + 20, 80) : 0;

	return (
		<div
			className={`relative h-20 sm:h-24 rounded-lg p-2 cursor-pointer transition-all duration-300 group
                bg-gradient-to-br ${volatilityClass}
                hover:scale-105 hover:shadow-xl hover:z-10
                ${
					isToday(date, today)
						? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900'
						: ''
				}
                ${
					isSelected(date, selectedDate)
						? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-gray-900'
						: ''
				}
                ${
					isDateInRange(date, selectedRange)
						? 'ring-2 ring-orange-500 ring-offset-1 ring-offset-gray-900'
						: ''
				}
                ${
					isFocused(date, focusedDate)
						? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-900'
						: ''
				}
                ${isSelectionMode ? 'hover:ring-2 hover:ring-orange-400' : ''}
                flex flex-col justify-between overflow-hidden`}
			onClick={() => onDateClick(date)}
			onFocus={() => onFocus(date)}
			tabIndex={0}
		>
			<div className="text-right text-sm font-bold text-gray-100 z-10">{day}</div>

			{dayData && (
				<div className="flex flex-col items-center justify-center flex-grow">
					<div
						className="rounded-full bg-blue-400/70 backdrop-blur-sm mb-1"
						style={{
							width: `${liquiditySize}%`,
							height: `${liquiditySize}%`,
							minWidth: '8px',
							minHeight: '8px',
							maxWidth: '20px',
							maxHeight: '20px',
						}}
						title={`Liquidity: ${dayData.liquidity}M`}
					/>

					<div className="flex items-center justify-center">
						{getPerformanceIcon(dayData.performance)}
					</div>

					<div className="w-full bg-gray-800/30 rounded-full h-1 mt-1 overflow-hidden">
						<div
							className="h-full bg-purple-400/70 rounded-full transition-all duration-300"
							style={{
								width: `${Math.min((dayData.liquidity / 100) * 100, 100)}%`,
							}}
						/>
					</div>
				</div>
			)}

			{dayData && (
				<div className="absolute invisible group-hover:visible bg-gray-900 text-gray-200 text-xs p-3 rounded-lg shadow-xl z-20 -top-32 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-700">
					<div className="font-semibold text-purple-400 mb-2">
						{date.toLocaleDateString()}
					</div>
					<div className="space-y-1">
						<p>
							Price: ${dayData.close} ({dayData.changePercent}%)
						</p>
						<p>Volume: {dayData.liquidity}M</p>
						<p>Volatility: {['Low', 'Medium', 'High'][dayData.volatility]}</p>
						<p>RSI: {dayData.rsi}</p>
						<p>
							H/L: ${dayData.high}/${dayData.low}
						</p>
					</div>
					<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
				</div>
			)}
		</div>
	);
};
