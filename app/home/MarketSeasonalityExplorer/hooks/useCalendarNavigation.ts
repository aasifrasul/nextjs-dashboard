import { useState, useCallback } from 'react';

import { useKeyboardDateNavigation } from './useKeyboardDateNavigation';

export const useCalendarNavigation = (
	currentDate: Date,
	goToPreviousMonth: () => void,
	goToNextMonth: () => void,
	handleDateClick: (date: Date) => void,
) => {
	const [focusedDate, setFocusedDate] = useState<Date | null>(null);
	const [isTransitioning, setIsTransitioning] = useState(false);

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	// Use the shared keyboard navigation
	useKeyboardDateNavigation(
		focusedDate,
		setFocusedDate,
		() => setFocusedDate(null), // onEscape
		handleDateClick, // onEnter
		{
			allowedMonth: month,
			allowedYear: year,
		},
	);

	const handleMonthNavigation = useCallback(
		(direction: 'prev' | 'next') => {
			setIsTransitioning(true);
			setTimeout(() => {
				if (direction === 'prev') {
					goToPreviousMonth();
				} else {
					goToNextMonth();
				}
				setIsTransitioning(false);
			}, 150);
		},
		[goToPreviousMonth, goToNextMonth],
	);

	return {
		focusedDate,
		setFocusedDate,
		isTransitioning,
		handleMonthNavigation,
	};
};
