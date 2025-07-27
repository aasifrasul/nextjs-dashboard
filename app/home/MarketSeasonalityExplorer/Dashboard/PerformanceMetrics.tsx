import { formatVolume, getVolatilityLabel } from '../utils';
import { DayData } from '../types';

export const PerformanceMetrics = ({ dayData }: { dayData: DayData }) => {
	const metrics = [
		{
			label: 'Daily Change',
			value: `${dayData.changePercent}%`,
			className:
				parseFloat(dayData.changePercent) >= 0 ? 'text-green-400' : 'text-red-400',
		},
		{
			label: 'Volume',
			value: formatVolume(dayData.volume),
			className: 'text-gray-200',
		},
		{
			label: 'Volatility',
			value: getVolatilityLabel(dayData.volatility),
			className: 'text-gray-200',
		},
		{
			label: 'Liquidity',
			value: `${dayData.liquidity}M`,
			className: 'text-gray-200',
		},
	];

	return (
		<div className="bg-gray-700/30 rounded-lg p-4">
			<h4 className="text-lg font-semibold text-gray-200 mb-3">Performance</h4>
			<div className="space-y-3">
				{metrics.map((metric, index) => (
					<div key={index} className="flex justify-between items-center">
						<span className="text-gray-400">{metric.label}</span>
						<span className={`font-semibold ${metric.className}`}>
							{metric.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};
