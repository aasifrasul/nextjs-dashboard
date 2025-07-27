'use client';
import React, { useState } from 'react';

import { Header } from './Header';
import { PriceInfoGrid } from './PriceInfoGrid';
import { PerformanceMetrics } from './PerformanceMetrics';
import { RealtimeDataCard } from './RealtimeDataCard';
import { TechnicalIndicators } from './TechnicalIndicators';
import { ChartsTab } from './ChartsTab';

import { tabs, getChartData, getPriceHistoryData, getDayDataFromSelectedDate } from '../utils';

import {
	DayData,
	ChartDataPoint,
	RealtimeData,
	GetDayData,
	PriceHistoryDataPoint,
} from '../types';

interface EnhancedDashboardProps {
	selectedDate: Date | null;
	getDayData: GetDayData;
	realtimeData: RealtimeData;
}

export const Dashboard: React.FC<EnhancedDashboardProps> = ({
	selectedDate,
	getDayData,
	realtimeData,
}) => {
	const [activeTab, setActiveTab] = useState<string>('overview');

	const dayData: DayData | undefined = getDayDataFromSelectedDate(selectedDate, getDayData);
	const chartData: ChartDataPoint[] = getChartData(dayData);
	const priceHistoryData: PriceHistoryDataPoint[] = getPriceHistoryData(
		selectedDate,
		getDayData,
	);

	const handleTabClick = (tabId: string): void => {
		setActiveTab(tabId);
	};

	const renderTabContent = () => {
		if (!dayData) return null;

		switch (activeTab) {
			case 'overview':
				return (
					<div className="space-y-6">
						<PriceInfoGrid dayData={dayData} />
						<PerformanceMetrics dayData={dayData} />
						<RealtimeDataCard realtimeData={realtimeData} />
					</div>
				);
			case 'technical':
				return <TechnicalIndicators dayData={dayData} />;
			case 'charts':
				return <ChartsTab priceHistoryData={priceHistoryData} chartData={chartData} />;
			default:
				return null;
		}
	};

	return (
		<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
			<Header
				selectedDate={selectedDate}
				tabs={tabs}
				activeTab={activeTab}
				onTabClick={handleTabClick}
			/>
			<div className="p-6">{renderTabContent()}</div>
		</div>
	);
};
