import { useCallback } from 'react';

import { useEventListener } from '@/app/hooks';

export const useKeyboardDateNavigation = (
	currentDate: Date | null,
	onDateChange: (date: Date) => void,
	onEscape?: () => void,
	onEnter?: (date: Date) => void,
	constraints?: {
		minDate?: Date;
		maxDate?: Date;
		allowedMonth?: number;
		allowedYear?: number;
	},
) => {
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!currentDate) return;

			let newDate = new Date(currentDate);
			let shouldUpdate = false;

			switch (event.key) {
				case 'ArrowLeft':
					event.preventDefault();
					newDate.setDate(newDate.getDate() - 1);
					shouldUpdate = true;
					break;
				case 'ArrowRight':
					event.preventDefault();
					newDate.setDate(newDate.getDate() + 1);
					shouldUpdate = true;
					break;
				case 'ArrowUp':
					event.preventDefault();
					newDate.setDate(newDate.getDate() - 7);
					shouldUpdate = true;
					break;
				case 'ArrowDown':
					event.preventDefault();
					newDate.setDate(newDate.getDate() + 7);
					shouldUpdate = true;
					break;
				case 'Enter':
					event.preventDefault();
					onEnter?.(currentDate);
					break;
				case 'Escape':
					event.preventDefault();
					onEscape?.();
					break;
				default:
					return;
			}

			if (shouldUpdate) {
				// Apply constraints if provided
				if (constraints) {
					const { minDate, maxDate, allowedMonth, allowedYear } = constraints;

					if (minDate && newDate < minDate) return;
					if (maxDate && newDate > maxDate) return;
					if (allowedMonth !== undefined && newDate.getMonth() !== allowedMonth)
						return;
					if (allowedYear !== undefined && newDate.getFullYear() !== allowedYear)
						return;
				}

				onDateChange(newDate);
			}
		},
		[currentDate, onDateChange, onEscape, onEnter, constraints],
	);

	useEventListener('keydown', handleKeyDown, globalThis);
};
