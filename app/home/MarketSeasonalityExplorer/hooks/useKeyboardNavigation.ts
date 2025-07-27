import { useEffect } from 'react';
import { DateRange } from '../types';

export const useKeyboardNavigation = (
	selectedDate: Date | null,
	setSelectedDate: (date: Date | null) => void,
	setSelectedRange: (range: DateRange | null) => void,
) => {
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (!selectedDate) return;

			const newDate = new Date(selectedDate);
			switch (event.key) {
				case 'ArrowLeft':
					newDate.setDate(newDate.getDate() - 1);
					setSelectedDate(newDate);
					break;
				case 'ArrowRight':
					newDate.setDate(newDate.getDate() + 1);
					setSelectedDate(newDate);
					break;
				case 'ArrowUp':
					newDate.setDate(newDate.getDate() - 7);
					setSelectedDate(newDate);
					break;
				case 'ArrowDown':
					newDate.setDate(newDate.getDate() + 7);
					setSelectedDate(newDate);
					break;
				case 'Escape':
					setSelectedDate(null);
					setSelectedRange(null);
					break;
				default:
					break;
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [selectedDate, setSelectedDate, setSelectedRange]);
};
