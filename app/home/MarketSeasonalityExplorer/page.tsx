'use client';
import { Calendar } from './Calendar';
import { Dashboard } from './Dashboard';
import { SimpleDashboard } from './SimpleDashboard';
import { Header } from './Header';
import { Controls } from './Controls';

import { useAppControls } from './hooks/useAppControls';
import { useMarketData } from './hooks/useMarketData';
import { useRealtimeData } from './hooks/useRealtimeData';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

const App: React.FC = () => {
	const {
		currentDate,
		selectedDate,
		selectedRange,
		viewMode,
		selectedInstrument,
		isSelectionMode,
		filters,
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
		// Import the setters directly
		setSelectedDate,
		setSelectedRange,
	} = useAppControls();

	const { getDayData, filteredData } = useMarketData(currentDate, filters);
	const { realtimeData, isLoading } = useRealtimeData(selectedInstrument);

	// Pass the state setters to the keyboard hook
	useKeyboardNavigation(selectedDate, setSelectedDate, setSelectedRange);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 font-sans">
			<Header realtimeData={realtimeData} isLoading={isLoading} />

			<div className="max-w-7xl mx-auto p-4 sm:p-6">
				<Controls
					selectedInstrument={selectedInstrument}
					handleInstrumentChange={handleInstrumentChange}
					viewMode={viewMode}
					handleViewModeChange={handleViewModeChange}
					isSelectionMode={isSelectionMode}
					handleSelectionModeToggle={handleSelectionModeToggle}
					handleTodayClick={handleTodayClick}
					handleClearClick={handleClearClick}
					filters={filters}
					handleMinVolatilityChange={handleMinVolatilityChange}
					handleMaxVolatilityChange={handleMaxVolatilityChange}
					handlePositiveOnlyChange={handlePositiveOnlyChange}
					handleNegativeOnlyChange={handleNegativeOnlyChange}
				/>

				<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
					<div className="xl:col-span-2">
						<Calendar
							currentDate={currentDate}
							goToPreviousMonth={goToPreviousMonth}
							goToNextMonth={goToNextMonth}
							handleDateClick={handleDateClick}
							getDayData={getDayData}
							viewMode={viewMode}
							selectedDate={selectedDate}
							selectedRange={selectedRange}
							filteredData={filteredData}
							isSelectionMode={isSelectionMode}
							onViewModeChange={handleViewModeChange}
						/>
					</div>

					<div className="xl:col-span-1">
						{selectedDate || selectedRange ? (
							<Dashboard
								selectedDate={selectedDate}
								getDayData={getDayData}
								realtimeData={realtimeData}
							/>
						) : (
							<SimpleDashboard />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default App;
