import { DayData } from '../types';

import { getRSIStatus, formatPrice } from '../utils';

export function getIndicators(dayData: DayData) {
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
	return indicators;
}
