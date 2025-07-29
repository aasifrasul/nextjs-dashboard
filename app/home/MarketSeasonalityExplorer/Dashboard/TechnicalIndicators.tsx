import { useMemo } from 'react';

import { formatPrice, calculateSupportResistance } from '../utils';
import { DayData } from '../types';

import { getIndicators } from './helper';

interface TechnicalIndicatorsProps {
	dayData: DayData;
}

export const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ dayData }) => {
	const indicators = useMemo(() => getIndicators(dayData), [dayData]);

	const levels = calculateSupportResistance(dayData.high, dayData.low);

	return (
		<div className="space-y-6">
			<div className="bg-gray-700/30 rounded-lg p-4">
				<h4 className="text-lg font-semibold text-gray-200 mb-4">
					Technical Indicators
				</h4>
				<div className="space-y-4">
					{indicators.map((indicator, index) => (
						<div
							key={index}
							className="flex justify-between items-center py-2 border-b border-gray-600 last:border-b-0"
						>
							<span className="text-gray-400">{indicator.label}</span>
							<div className="flex items-center gap-2">
								<span className="text-gray-200">{indicator.value}</span>
								{indicator.extra}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Support/Resistance Levels */}
			<div className="bg-gray-700/30 rounded-lg p-4">
				<h4 className="text-lg font-semibold text-gray-200 mb-4">Key Levels</h4>
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-red-400">Resistance</span>
						<span className="text-gray-200">${levels.resistance}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-blue-400">Current</span>
						<span className="text-gray-200">{formatPrice(dayData.close)}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-green-400">Support</span>
						<span className="text-gray-200">${levels.support}</span>
					</div>
				</div>
			</div>
		</div>
	);
};
