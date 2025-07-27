import { useState, useEffect, useCallback } from 'react';

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

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!focusedDate) return;

			let newDate = new Date(focusedDate);

			switch (event.key) {
				case 'ArrowLeft':
					event.preventDefault();
					newDate.setDate(newDate.getDate() - 1);
					break;
				case 'ArrowRight':
					event.preventDefault();
					newDate.setDate(newDate.getDate() + 1);
					break;
				case 'ArrowUp':
					event.preventDefault();
					newDate.setDate(newDate.getDate() - 7);
					break;
				case 'ArrowDown':
					event.preventDefault();
					newDate.setDate(newDate.getDate() + 7);
					break;
				case 'Enter':
					event.preventDefault();
					handleDateClick(focusedDate);
					break;
				case 'Escape':
					event.preventDefault();
					setFocusedDate(null);
					break;
				default:
					return;
			}

			if (newDate.getMonth() === month && newDate.getFullYear() === year) {
				setFocusedDate(newDate);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [focusedDate, month, year, handleDateClick]);

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
