// Type definitions
export interface VolumeProfile {
	hour: number;
	volume: number;
}

export interface DayData {
	volatility: number;
	liquidity: number;
	performance: number;
	open: string;
	close: string;
	high: string;
	low: string;
	volume: string;
	volatilityIndex: string;
	rsi: string;
	vwap: string;
	sma20: string;
	movingAverage: string;
	changePercent: string;
	volumeProfile: VolumeProfile[];
}

export interface MonthData {
	[dateKey: string]: DayData;
}

export interface YearData {
	[month: number]: MonthData;
}

export interface DateRange {
	start: Date;
	end: Date | null;
}

export type ViewMode = 'daily' | 'weekly' | 'monthly';

export interface VolatilityColorMap {
	[key: number]: string;
}

export interface PerformanceIconProps {
	performance: number;
}

export interface RealtimeData {
	price?: string;
	change24h?: string;
	volume24h?: string;
	high24h?: string;
	low24h?: string;
	spread?: string;
	bidSize?: string;
	askSize?: string;
	lastUpdate?: string;
}

export interface ChartDataPoint {
	hour: string;
	volume: number;
	price: number;
}

export interface PriceHistoryDataPoint {
	date: string;
	price: number;
	volume: number;
	high: number;
	low: number;
}

export interface TabConfig {
	id: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

export interface MarketData {
	[year: number]: YearData;
}

export interface Filters {
	minVolatility: number;
	maxVolatility: number;
	showOnlyPositive: boolean;
	showOnlyNegative: boolean;
}

export interface BinanceTickerResponse {
	symbol: string;
	priceChange: string;
	priceChangePercent: string;
	weightedAvgPrice: string;
	prevClosePrice: string;
	lastPrice: string;
	lastQty: string;
	bidPrice: string;
	bidQty: string;
	askPrice: string;
	askQty: string;
	openPrice: string;
	highPrice: string;
	lowPrice: string;
	volume: string;
	quoteVolume: string;
	openTime: number;
	closeTime: number;
	firstId: number;
	lastId: number;
	count: number;
}

export interface BinanceDepthResponse {
	lastUpdateId: number;
	bids: [string, string][];
	asks: [string, string][];
}

export type GetDayData = (year: number, month: number, day: number) => DayData | undefined;

export interface FilteredData {
	[key: string]: boolean;
}
