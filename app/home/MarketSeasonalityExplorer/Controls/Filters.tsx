import React from 'react';
import { Filters as FiltersProps } from '../types';

interface Props {
	filters: FiltersProps;
	handleMinVolatilityChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
	handleMaxVolatilityChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
	handlePositiveOnlyChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleNegativeOnlyChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Filters: React.FC<Props> = ({
	filters,
	handleMinVolatilityChange,
	handleMaxVolatilityChange,
	handlePositiveOnlyChange,
	handleNegativeOnlyChange,
}) => (
	<div className="mt-4 pt-4 border-t border-gray-700">
		<h3 className="text-sm font-medium text-gray-300 mb-3">Filters</h3>
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			{/* Volatility Range */}
			<div>
				<label className="block text-xs text-gray-400 mb-1">Volatility Range</label>
				<div className="flex items-center gap-2">
					<select
						value={filters.minVolatility}
						onChange={handleMinVolatilityChange}
						className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-sm"
					>
						<option value={0}>Low</option>
						<option value={1}>Medium</option>
						<option value={2}>High</option>
					</select>
					<span className="text-gray-500">to</span>
					<select
						value={filters.maxVolatility}
						onChange={handleMaxVolatilityChange}
						className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-sm"
					>
						<option value={0}>Low</option>
						<option value={1}>Medium</option>
						<option value={2}>High</option>
					</select>
				</div>
			</div>

			{/* Positive/Negative Checkboxes */}
			<div className="flex items-center gap-4">
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={filters.showOnlyPositive}
						onChange={handlePositiveOnlyChange}
						className="rounded"
					/>
					<span className="text-green-400">Positive only</span>
				</label>
			</div>
			<div className="flex items-center gap-4">
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={filters.showOnlyNegative}
						onChange={handleNegativeOnlyChange}
						className="rounded"
					/>
					<span className="text-red-400">Negative only</span>
				</label>
			</div>
		</div>
	</div>
);
