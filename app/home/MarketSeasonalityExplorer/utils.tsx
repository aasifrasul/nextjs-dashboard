import { TrendingUp, TrendingDown, Minus, BarChart3, Activity } from 'lucide-react';

import {
	VolatilityColorMap,
	DateRange,
	TabConfig,
	ChartDataPoint,
	DayData,
	PriceHistoryDataPoint,
	GetDayData,
	MonthData,
	VolumeProfile,
} from './types';

export const getVolatilityColor = (volatility: number): string => {
	const colorMap: VolatilityColorMap = {
		0: 'from-green-700 to-green-600',
		1: 'from-yellow-700 to-yellow-600',
		2: 'from-red-700 to-red-600',
	};
	return colorMap[volatility] || 'from-gray-700 to-gray-600';
};

export const getPerformanceIcon = (performance: number): React.ReactElement => {
	switch (performance) {
		case 1:
			return <TrendingUp className="w-3 h-3 text-green-400" />;
		case -1:
			return <TrendingDown className="w-3 h-3 text-red-400" />;
		default:
			return <Minus className="w-3 h-3 text-gray-400" />;
	}
};

export const isDateInRange = (date: Date, selectedRange: DateRange | null): boolean => {
	if (!selectedRange?.start || !selectedRange?.end) return false;
	return date >= selectedRange.start && date <= selectedRange.end;
};

export const formatDateKey = (year: number, month: number, day: number): string => {
	return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const calculateLiquiditySize = (liquidity: number): number => {
	return Math.min((liquidity / 100) * 60 + 20, 80);
};

export const calculateVolumeWidth = (liquidity: number): number => {
	return Math.min((liquidity / 100) * 100, 100);
};

export const getVolatilityLabel = (volatility: number): string => {
	const labels = ['Low', 'Medium', 'High'];
	return labels[volatility] || 'Unknown';
};

export const formatVolume = (volume: string | undefined): string => {
	if (!volume) return '0M';
	return (parseFloat(volume) / 1000000).toFixed(2) + 'M';
};

export const formatPrice = (price: string | undefined): string => {
	return price ? `$${price}` : '$0.00';
};

export const getRSIStatus = (rsi: string): { label: string; className: string } => {
	const rsiValue = parseFloat(rsi);
	if (rsiValue > 70) {
		return { label: 'Overbought', className: 'bg-red-600 text-white' };
	} else if (rsiValue < 30) {
		return { label: 'Oversold', className: 'bg-green-600 text-white' };
	} else {
		return { label: 'Neutral', className: 'bg-gray-600 text-gray-200' };
	}
};

export const calculateSupportResistance = (high: string, low: string) => {
	return {
		resistance: (parseFloat(high) * 1.02).toFixed(2),
		support: (parseFloat(low) * 0.98).toFixed(2),
	};
};

export const tabs: TabConfig[] = [
	{ id: 'overview', label: 'Overview', icon: BarChart3 },
	{ id: 'technical', label: 'Technical', icon: Activity },
	{ id: 'charts', label: 'Charts', icon: TrendingUp },
];

export const getChartData = (dayData?: DayData): ChartDataPoint[] =>
	dayData
		? dayData.volumeProfile.map(
				(item): ChartDataPoint => ({
					hour: `${item.hour}:00`,
					volume: item.volume,
					price: parseFloat(dayData.close) + (Math.random() * 200 - 100),
				}),
			)
		: [];

export const getDayDataFromSelectedDate = (
	selectedDate: Date | null,
	getDayData: GetDayData,
): DayData | undefined =>
	selectedDate
		? getDayData(
				selectedDate.getFullYear(),
				selectedDate.getMonth(),
				selectedDate.getDate(),
			)
		: undefined;

export const getPriceHistoryData = (
	selectedDate: Date | null,
	getDayData: GetDayData,
): PriceHistoryDataPoint[] => {
	const priceHistoryData: PriceHistoryDataPoint[] = [];
	if (selectedDate) {
		const baseDate = new Date(selectedDate);
		for (let i = -7; i <= 0; i++) {
			const date = new Date(baseDate);
			date.setDate(baseDate.getDate() + i);
			const data = getDayData(date.getFullYear(), date.getMonth(), date.getDate());
			if (data) {
				priceHistoryData.push({
					date: date.toLocaleDateString(),
					price: parseFloat(data.close),
					volume: parseFloat(data.volume) / 1000000,
					high: parseFloat(data.high),
					low: parseFloat(data.low),
				});
			}
		}
	}
	return priceHistoryData;
};

export const isToday = (date: Date, today: Date): boolean => {
	return date.toDateString() === today.toDateString();
};

export const isSelected = (date: Date, selectedDate: Date | null): boolean => {
	return selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
};

export const isFocused = (date: Date, focusedDate: Date | null): boolean => {
	return focusedDate ? date.toDateString() === focusedDate.toDateString() : false;
};

export const simulateMarketData = (year: number, month: number): MonthData => {
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const newData: MonthData = {};

	for (let i = 1; i <= daysInMonth; i++) {
		const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(
			2,
			'0',
		)}`;

		const basePrice = 25000 + Math.sin((i / daysInMonth) * Math.PI * 2) * 5000;
		const volatility = Math.floor(Math.random() * 3);
		const volatilityMultiplier = [0.5, 1, 2][volatility];

		const open = basePrice + (Math.random() * 2000 - 1000);
		const dailyRange = 500 * volatilityMultiplier;
		const high = open + Math.random() * dailyRange;
		const low = open - Math.random() * dailyRange;
		const close = low + Math.random() * (high - low);

		const performance = close > open ? 1 : close < open ? -1 : 0;
		const liquidity = Math.floor(Math.random() * 100) + 20;

		const rsi = Math.random() * 100;
		const volume = liquidity * 1000000 * (1 + Math.random());
		const vwap = (high + low + close) / 3;
		const sma20 = basePrice + (Math.random() * 1000 - 500);

		newData[dateKey] = {
			volatility,
			liquidity,
			performance,
			open: open.toFixed(2),
			close: close.toFixed(2),
			high: high.toFixed(2),
			low: low.toFixed(2),
			volume: volume.toFixed(0),
			volatilityIndex: (volatility * 10 + Math.random() * 15).toFixed(2),
			rsi: rsi.toFixed(2),
			vwap: vwap.toFixed(2),
			sma20: sma20.toFixed(2),
			movingAverage: sma20.toFixed(2),
			changePercent: (((close - open) / open) * 100).toFixed(2),
			volumeProfile: Array.from(
				{ length: 24 },
				(_, hour): VolumeProfile => ({
					hour,
					volume: (Math.random() * volume) / 24,
				}),
			),
		};
	}
	return newData;
};
