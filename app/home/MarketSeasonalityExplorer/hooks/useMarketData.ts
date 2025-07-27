import { useState, useEffect, useCallback, useMemo } from 'react';
import { MarketData, Filters, GetDayData, FilteredData } from '../types';
import { simulateMarketData as simulateData } from '../utils';

export const useMarketData = (currentDate: Date, filters: Filters) => {
	const [marketData, setMarketData] = useState<MarketData>({});

	const simulateMarketData = useCallback(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		const newData = simulateData(year, month);

		setMarketData((prevData) => ({
			...prevData,
			[year]: {
				...(prevData[year] || {}),
				[month]: newData,
			},
		}));
	}, [currentDate]);

	useEffect(() => {
		simulateMarketData();
	}, [simulateMarketData]);

	const getDayData: GetDayData = useCallback(
		(year, month, day) => {
			const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(
				day,
			).padStart(2, '0')}`;
			return marketData[year]?.[month]?.[dateKey];
		},
		[marketData],
	);

	const filteredData = useMemo((): FilteredData => {
		const monthData = marketData[currentDate.getFullYear()]?.[currentDate.getMonth()];
		if (!monthData) return {};

		const filtered: { [key: string]: boolean } = {};
		Object.entries(monthData).forEach(([dateKey, data]) => {
			const passesVolatilityFilter =
				data.volatility >= filters.minVolatility &&
				data.volatility <= filters.maxVolatility;
			const passesPerformanceFilter =
				(!filters.showOnlyPositive || data.performance > 0) &&
				(!filters.showOnlyNegative || data.performance < 0);

			filtered[dateKey] = passesVolatilityFilter && passesPerformanceFilter;
		});

		return filtered;
	}, [marketData, currentDate, filters]);

	return { marketData, getDayData, filteredData };
};
