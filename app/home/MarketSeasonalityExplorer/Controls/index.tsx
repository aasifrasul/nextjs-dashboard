import React from 'react';
import { ViewMode, Filters } from '../types';
import { Filters as AdvancedFilters } from './Filters'; // Rename to avoid conflict

interface ControlsProps {
	selectedInstrument: string;
	handleInstrumentChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
	viewMode: ViewMode;
	handleViewModeChange: (mode: ViewMode) => void;
	isSelectionMode: boolean;
	handleSelectionModeToggle: () => void;
	handleTodayClick: () => void;
	handleClearClick: () => void;
	filters: Filters;
	handleMinVolatilityChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
	handleMaxVolatilityChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
	handlePositiveOnlyChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleNegativeOnlyChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Controls: React.FC<ControlsProps> = ({
	selectedInstrument,
	handleInstrumentChange,
	viewMode,
	handleViewModeChange,
	isSelectionMode,
	handleSelectionModeToggle,
	handleTodayClick,
	handleClearClick,
	filters,
	handleMinVolatilityChange,
	handleMaxVolatilityChange,
	handlePositiveOnlyChange,
	handleNegativeOnlyChange,
}) => (
	<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Instrument Selector */}
			<div>
				<label className="block text-gray-300 text-sm font-medium mb-2">
					Trading Pair
				</label>
				<select
					value={selectedInstrument}
					onChange={handleInstrumentChange}
					className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
				>
					<option value="BTCUSDT">BTC/USDT</option>
					<option value="ETHUSDT">ETH/USDT</option>
					<option value="BNBUSDT">BNB/USDT</option>
					<option value="ADAUSDT">ADA/USDT</option>
					<option value="SOLUSDT">SOL/USDT</option>
				</select>
			</div>

			{/* View Mode */}
			<div>
				<label className="block text-gray-300 text-sm font-medium mb-2">
					View Mode
				</label>
				<div className="flex rounded-lg overflow-hidden border border-gray-600">
					{(['daily', 'weekly', 'monthly'] as const).map((mode) => (
						<button
							key={mode}
							onClick={() => handleViewModeChange(mode)}
							className={`px-4 py-2 font-medium capitalize transition-all duration-200 flex-1 ${
								viewMode === mode
									? 'bg-purple-600 text-white'
									: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
							}`}
						>
							{mode}
						</button>
					))}
				</div>
			</div>

			{/* Selection Mode Toggle */}
			<div>
				<label className="block text-gray-300 text-sm font-medium mb-2">
					Selection
				</label>
				<button
					onClick={handleSelectionModeToggle}
					className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
						isSelectionMode
							? 'bg-orange-600 text-white'
							: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
					}`}
				>
					{isSelectionMode ? 'Range Mode' : 'Single Mode'}
				</button>
			</div>

			{/* Quick Actions */}
			<div>
				<label className="block text-gray-300 text-sm font-medium mb-2">
					Quick Actions
				</label>
				<div className="flex gap-2">
					<button
						onClick={handleTodayClick}
						className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors duration-200"
					>
						Today
					</button>
					<button
						onClick={handleClearClick}
						className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors duration-200"
					>
						Clear
					</button>
				</div>
			</div>
		</div>

		{/* Advanced Filters */}
		<AdvancedFilters
			filters={filters}
			handleMinVolatilityChange={handleMinVolatilityChange}
			handleMaxVolatilityChange={handleMaxVolatilityChange}
			handlePositiveOnlyChange={handlePositiveOnlyChange}
			handleNegativeOnlyChange={handleNegativeOnlyChange}
		/>
	</div>
);
