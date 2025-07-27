import { useMemo } from 'react';

import { CalendarDay } from './CalendarDay';
import { DateRange, FilteredData, ViewMode, GetDayData } from '../types';

interface CalendarGridProps {
	currentDate: Date;
	viewMode: ViewMode;
	calendarDays: (number | null)[];
	getDayData: GetDayData;
	filteredData: FilteredData;
	today: Date;
	selectedDate: Date | null;
	selectedRange: DateRange | null;
	focusedDate: Date | null;
	isSelectionMode: boolean;
	onDateClick: (date: Date) => void;
	onFocus: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
	currentDate,
	viewMode,
	calendarDays,
	getDayData,
	filteredData,
	today,
	selectedDate,
	selectedRange,
	focusedDate,
	isSelectionMode,
	onDateClick,
	onFocus,
}) => {
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const weeks = useMemo(() => {
		const weekArray: Array<Array<number | null>> = [];
		let currentWeek: Array<number | null> = [];

		calendarDays.forEach((day, index) => {
			currentWeek.push(day);
			if ((index + 1) % 7 === 0) {
				weekArray.push([...currentWeek]);
				currentWeek = [];
			}
		});

		if (currentWeek.length > 0) {
			weekArray.push(currentWeek);
		}

		return weekArray;
	}, [calendarDays]);

	const renderDayHeaders = () => (
		<>
			{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
				<div
					key={day}
					className={`text-center text-sm font-semibold text-gray-400 ${
						viewMode === 'daily' ? 'py-3' : 'py-2'
					}`}
				>
					{day}
				</div>
			))}
		</>
	);

	const renderDay = (
		day: number | null,
		index: number,
		variant: 'daily' | 'weekly' | 'monthly',
	) => {
		if (day === null) {
			const heightClass =
				variant === 'daily' ? 'h-20 sm:h-24' : variant === 'weekly' ? 'h-16' : 'h-8';
			return (
				<div
					key={`empty-${index}`}
					className={`${heightClass} bg-gray-800/30 rounded-lg`}
				/>
			);
		}

		const date = new Date(year, month, day);
		const dayData = getDayData(year, month, day);
		const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
			2,
			'0',
		)}`;
		const isFiltered = filteredData[dateKey];

		return (
			<CalendarDay
				key={day}
				date={date}
				dayData={dayData}
				today={today}
				selectedDate={selectedDate}
				selectedRange={selectedRange}
				focusedDate={focusedDate}
				isSelectionMode={isSelectionMode}
				isFiltered={isFiltered}
				onDateClick={onDateClick}
				onFocus={onFocus}
				variant={variant}
			/>
		);
	};

	if (viewMode === 'weekly') {
		return (
			<div className="space-y-2">
				{weeks.map((week, weekIndex) => (
					<div key={weekIndex} className="grid grid-cols-7 gap-1 sm:gap-2">
						{week.map((day, dayIndex) =>
							renderDay(day, `${weekIndex}-${dayIndex}` as any, 'weekly'),
						)}
					</div>
				))}
			</div>
		);
	}

	if (viewMode === 'monthly') {
		return (
			<div className="grid grid-cols-7 gap-1">
				{renderDayHeaders()}
				{calendarDays.map((day, index) => renderDay(day, index, 'monthly'))}
			</div>
		);
	}

	// Daily view (default)
	return (
		<div className="grid grid-cols-7 gap-1 sm:gap-2">
			{renderDayHeaders()}
			{calendarDays.map((day, index) => renderDay(day, index, 'daily'))}
		</div>
	);
};
