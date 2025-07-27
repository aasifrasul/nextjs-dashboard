import { useState, useEffect, useCallback } from 'react';
import { RealtimeData } from '../types';
import { fetchBinanceData } from '../api';

export const useRealtimeData = (selectedInstrument: string) => {
	const [realtimeData, setRealtimeData] = useState<RealtimeData>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fetchRealtimeData = useCallback(async () => {
		setIsLoading(true);
		try {
			const { tickerData, depthData } = await fetchBinanceData(selectedInstrument);

			const spread = parseFloat(depthData.asks[0][0]) - parseFloat(depthData.bids[0][0]);
			const bidSize = depthData.bids.reduce((sum, bid) => sum + parseFloat(bid[1]), 0);
			const askSize = depthData.asks.reduce((sum, ask) => sum + parseFloat(ask[1]), 0);

			setRealtimeData({
				price: parseFloat(tickerData.lastPrice).toFixed(2),
				change24h: parseFloat(tickerData.priceChangePercent).toFixed(2),
				volume24h: parseFloat(tickerData.volume).toFixed(0),
				high24h: parseFloat(tickerData.highPrice).toFixed(2),
				low24h: parseFloat(tickerData.lowPrice).toFixed(2),
				spread: spread.toFixed(2),
				bidSize: bidSize.toFixed(2),
				askSize: askSize.toFixed(2),
				lastUpdate: new Date().toLocaleTimeString(),
			});
		} catch (error) {
			console.error('Error fetching real-time data:', error);
		} finally {
			setIsLoading(false);
		}
	}, [selectedInstrument]);

	useEffect(() => {
		fetchRealtimeData();
		const interval = setInterval(fetchRealtimeData, 5000);
		return () => clearInterval(interval);
	}, [fetchRealtimeData]);

	return { realtimeData, isLoading };
};
