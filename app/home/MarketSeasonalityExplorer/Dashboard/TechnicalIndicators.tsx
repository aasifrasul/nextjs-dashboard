import { formatPrice, getRSIStatus, calculateSupportResistance } from '../utils';
import { DayData } from '../types';

interface TechnicalIndicatorsProps {
	dayData: DayData;
}

export const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ dayData }) => {
	const indicators = [
		{
			label: 'RSI (14)',
			value: dayData.rsi,
			extra: (
				<div
					className={`px-2 py-1 rounded text-xs font-medium ${
						getRSIStatus(dayData.rsi).className
					}`}
				>
					{getRSIStatus(dayData.rsi).label}
				</div>
			),
		},
		{
			label: 'SMA (20)',
			value: formatPrice(dayData.sma20),
		},
		{
			label: 'VWAP',
			value: formatPrice(dayData.vwap),
		},
		{
			label: 'Volatility Index',
			value: dayData.volatilityIndex,
		},
	];

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
