import { useState, useCallback } from 'react';
import { DateRange, ViewMode, Filters } from '../types';

export const useAppControls = () => {
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>('daily');
	const [selectedInstrument, setSelectedInstrument] = useState<string>('BTCUSDT');
	const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
	const [filters, setFilters] = useState<Filters>({
		minVolatility: 0,
		maxVolatility: 2,
		showOnlyPositive: false,
		showOnlyNegative: false,
	});

	const goToPreviousMonth = () => {
		setCurrentDate(
			(prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1),
		);
	};

	const goToNextMonth = () => {
		setCurrentDate(
			(prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1),
		);
	};

	// The issue with the type comes from this function signature
	// The function passed to `handleDateClick` needs to be able to accept `null`
	// However, the `handleDateClick` is specifically for calendar clicks,
	// which always have a date. The keyboard navigation hook, though,
	// also needs to be able to clear the selection. So, we'll
	// create a new, dedicated `handleClearSelection` handler.
	const handleDateClick = useCallback(
		(date: Date) => {
			if (isSelectionMode && selectedRange?.start && !selectedRange.end) {
				setSelectedRange((prev) => (prev ? { ...prev, end: date } : null));
				setIsSelectionMode(false);
			} else if (isSelectionMode) {
				setSelectedRange({ start: date, end: null });
			} else {
				setSelectedDate(date);
			}
		},
		[isSelectionMode, selectedRange],
	);

	const handleInstrumentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedInstrument(event.target.value);
	};

	const handleViewModeChange = (mode: ViewMode) => {
		setViewMode(mode);
	};

	const handleSelectionModeToggle = () => {
		setIsSelectionMode(!isSelectionMode);
	};

	const handleTodayClick = () => {
		setSelectedDate(new Date());
	};

	const handleClearClick = () => {
		setSelectedDate(null);
		setSelectedRange(null);
	};

	const handleMinVolatilityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setFilters((prev) => ({
			...prev,
			minVolatility: parseInt(event.target.value),
		}));
	};

	const handleMaxVolatilityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setFilters((prev) => ({
			...prev,
			maxVolatility: parseInt(event.target.value),
		}));
	};

	const handlePositiveOnlyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilters((prev) => ({
			...prev,
			showOnlyPositive: event.target.checked,
		}));
	};

	const handleNegativeOnlyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilters((prev) => ({
			...prev,
			showOnlyNegative: event.target.checked,
		}));
	};

	return {
		currentDate,
		selectedDate,
		selectedRange,
		viewMode,
		selectedInstrument,
		isSelectionMode,
		filters,
		// Handlers
		goToPreviousMonth,
		goToNextMonth,
		handleDateClick,
		handleInstrumentChange,
		handleViewModeChange,
		handleSelectionModeToggle,
		handleTodayClick,
		handleClearClick,
		handleMinVolatilityChange,
		handleMaxVolatilityChange,
		handlePositiveOnlyChange,
		handleNegativeOnlyChange,
		// State setters, now exported for use in other hooks
		setSelectedDate,
		setSelectedRange,
	};
};
