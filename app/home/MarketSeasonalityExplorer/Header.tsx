import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { RealtimeData } from './types';

interface HeaderProps {
	realtimeData: RealtimeData;
	isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ realtimeData, isLoading }) => (
	<header className="w-full bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 sm:p-6">
		<div className="max-w-7xl mx-auto">
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
				<div>
					<h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
						Market Seasonality Explorer
					</h1>
					<p className="text-gray-300 mt-1">
						Advanced market data visualization and analysis
					</p>
				</div>

				<div className="bg-gray-700/50 rounded-xl p-4 backdrop-blur-sm border border-gray-600">
					<div className="flex items-center gap-4 text-sm">
						<div className="flex items-center gap-2">
							<div
								className={`w-2 h-2 rounded-full ${
									isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
								}`}
							></div>
							<span className="text-gray-300">Live</span>
						</div>
						<div className="text-xl font-bold text-blue-300">
							${realtimeData.price || 'Loading...'}
						</div>
						<div
							className={`flex items-center gap-1 ${
								parseFloat(realtimeData.change24h || '0') > 0
									? 'text-green-400'
									: 'text-red-400'
							}`}
						>
							{parseFloat(realtimeData.change24h || '0') > 0 ? (
								<TrendingUp size={16} />
							) : (
								<TrendingDown size={16} />
							)}
							{realtimeData.change24h}%
						</div>
					</div>
					<div className="text-xs text-gray-400 mt-1">
						Last update: {realtimeData.lastUpdate || 'Never'}
					</div>
				</div>
			</div>
		</div>
	</header>
);
