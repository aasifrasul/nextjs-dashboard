import { formatPrice } from '../utils';
import { DayData } from '../types';

interface PriceInfoGridProps {
	dayData: DayData;
}

export const PriceInfoGrid: React.FC<PriceInfoGridProps> = ({ dayData }) => {
	const priceItems = [
		{ label: 'Open Price', value: formatPrice(dayData.open), color: 'text-gray-100' },
		{ label: 'Close Price', value: formatPrice(dayData.close), color: 'text-gray-100' },
		{ label: 'High', value: formatPrice(dayData.high), color: 'text-green-400' },
		{ label: 'Low', value: formatPrice(dayData.low), color: 'text-red-400' },
	];

	return (
		<div className="grid grid-cols-2 gap-4">
			{priceItems.map((item, index) => (
				<div key={index} className="bg-gray-700/30 rounded-lg p-4">
					<div className="text-sm text-gray-400 mb-1">{item.label}</div>
					<div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
				</div>
			))}
		</div>
	);
};
