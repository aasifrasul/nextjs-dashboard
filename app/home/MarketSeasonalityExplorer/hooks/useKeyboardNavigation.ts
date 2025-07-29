import { DateRange } from '../types';

import { useKeyboardDateNavigation } from './useKeyboardDateNavigation';

export const useKeyboardNavigation = (
	selectedDate: Date | null,
	setSelectedDate: (date: Date | null) => void,
	setSelectedRange: (range: DateRange | null) => void,
) => {
	// Use the shared keyboard navigation
	useKeyboardDateNavigation(
		selectedDate,
		(date: Date) => setSelectedDate(date),
		() => {
			setSelectedDate(null);
			setSelectedRange(null);
		},
	);
};
