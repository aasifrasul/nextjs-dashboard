import { BinanceDepthResponse, BinanceTickerResponse } from './types';

export const fetchBinanceData = async (selectedInstrument: string) => {
	const [tickerResponse, depthResponse] = await Promise.all([
		fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedInstrument}`),
		fetch(`https://api.binance.com/api/v3/depth?symbol=${selectedInstrument}&limit=10`),
	]);

	const tickerData: BinanceTickerResponse = await tickerResponse.json();
	const depthData: BinanceDepthResponse = await depthResponse.json();

	if (!tickerData || !depthData) {
		throw new Error('Failed to fetch data from Binance API.');
	}

	return { tickerData, depthData };
};
