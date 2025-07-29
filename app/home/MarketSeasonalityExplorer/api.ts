import { BinanceDepthResponse, BinanceTickerResponse } from './types';

const BASE_URL = 'https://api.binance.com/api/v3/';

export const fetchBinanceData = async (selectedInstrument: string) => {
	try {
		const [tickerResponse, depthResponse] = await Promise.all([
			fetch(`${BASE_URL}ticker/24hr?symbol=${selectedInstrument}`),
			fetch(`${BASE_URL}depth?symbol=${selectedInstrument}&limit=10`),
		]);

		// Check if the responses are successful (status code 200-299)
		if (!tickerResponse.ok) {
			throw new Error(`Ticker API request failed with status: ${tickerResponse.status}`);
		}
		if (!depthResponse.ok) {
			throw new Error(`Depth API request failed with status: ${depthResponse.status}`);
		}

		const [tickerData, depthData]: [
			tickerData: BinanceTickerResponse,
			depthData: BinanceDepthResponse,
		] = await Promise.all([tickerResponse.json(), depthResponse.json()]);

		if (!tickerData || !depthData) {
			throw new Error('Failed to parse data from Binance API.');
		}

		return { tickerData, depthData };
	} catch (err) {
		console.error('Failed to fetch data from Binance API:', err);
		throw new Error('Failed to fetch data from Binance API.');
	}
};
