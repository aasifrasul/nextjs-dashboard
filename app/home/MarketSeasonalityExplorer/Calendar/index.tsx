import React, { useMemo } from 'react';

import { ViewModeSelector } from './ViewModeSelector';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { CalendarLegend } from './CalendarLegend';

import { useCalendarNavigation } from '../hooks/useCalendarNavigation';

import { DateRange, FilteredData, ViewMode, GetDayData } from '../types';

interface CalendarProps {
	currentDate: Date;
	goToPreviousMonth: () => void;
	goToNextMonth: () => void;
	handleDateClick: (date: Date) => void;
	getDayData: GetDayData;
	viewMode: ViewMode;
	selectedDate: Date | null;
	selectedRange: DateRange | null;
	filteredData: FilteredData;
	isSelectionMode: boolean;
	onViewModeChange: (mode: ViewMode) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
	currentDate,
	goToPreviousMonth,
	goToNextMonth,
	handleDateClick,
	getDayData,
	viewMode,
	selectedDate,
	selectedRange,
	filteredData,
	isSelectionMode,
	onViewModeChange,
}) => {
	const today = useMemo(() => new Date(), []);
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const firstDayOfMonth = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const { focusedDate, setFocusedDate, isTransitioning, handleMonthNavigation } =
		useCalendarNavigation(currentDate, goToPreviousMonth, goToNextMonth, handleDateClick);

	const calendarDays = useMemo(() => {
		const days: (number | null)[] = [];
		for (let i = 0; i < firstDayOfMonth; i++) {
			days.push(null);
		}
		for (let i = 1; i <= daysInMonth; i++) {
			days.push(i);
		}
		return days;
	}, [firstDayOfMonth, daysInMonth]);

	return (
		<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
			<ViewModeSelector viewMode={viewMode} onViewModeChange={onViewModeChange} />

			<CalendarHeader
				currentDate={currentDate}
				isTransitioning={isTransitioning}
				onPrevMonth={() => handleMonthNavigation('prev')}
				onNextMonth={() => handleMonthNavigation('next')}
			/>

			{viewMode === 'daily' && <CalendarLegend />}

			<div
				className={`transition-opacity duration-150 ${
					isTransitioning ? 'opacity-50' : 'opacity-100'
				}`}
			>
				<CalendarGrid
					currentDate={currentDate}
					viewMode={viewMode}
					calendarDays={calendarDays}
					getDayData={getDayData}
					filteredData={filteredData}
					today={today}
					selectedDate={selectedDate}
					selectedRange={selectedRange}
					focusedDate={focusedDate}
					isSelectionMode={isSelectionMode}
					onDateClick={handleDateClick}
					onFocus={setFocusedDate}
				/>
			</div>

			<div className="mt-4 text-xs text-gray-400 text-center">
				Use arrow keys to navigate • Enter to select • ESC to clear selection
			</div>
		</div>
	);
};
