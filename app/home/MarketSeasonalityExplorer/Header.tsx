import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Define the RealtimeData interface if not already defined
interface RealtimeData {
	price?: string;
	change24h?: string;
	lastUpdate?: string;
}

interface HeaderProps {
	realtimeData: RealtimeData;
	isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ realtimeData, isLoading }) => {
	// Helper function to safely parse change percentage
	const getChangeValue = (change: string | undefined): number => {
		if (!change) return 0;
		// Remove % symbol if present and parse
		const cleanChange = change.replace('%', '');
		return parseFloat(cleanChange) || 0;
	};

	const changeValue = getChangeValue(realtimeData.change24h);
	const isPositive = changeValue > 0;

	return (
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
							{/* Status indicator */}
							<div className="flex items-center gap-2">
								<div
									className={`w-2 h-2 rounded-full ${
										isLoading
											? 'bg-yellow-400 animate-pulse'
											: 'bg-green-400'
									}`}
									aria-label={isLoading ? 'Loading' : 'Live data'}
								/>
								<span className="text-gray-300">Live</span>
							</div>

							{/* Price display */}
							<div className="text-xl font-bold text-blue-300">
								{realtimeData.price ? `$${realtimeData.price}` : 'Loading...'}
							</div>

							{/* Change indicator */}
							<div
								className={`flex items-center gap-1 ${
									isPositive ? 'text-green-400' : 'text-red-400'
								}`}
							>
								{isPositive ? (
									<TrendingUp size={16} aria-label="Price up" />
								) : (
									<TrendingDown size={16} aria-label="Price down" />
								)}
								<span>
									{realtimeData.change24h
										? `${realtimeData.change24h}${
												realtimeData.change24h.includes('%') ? '' : '%'
											}`
										: '0%'}
								</span>
							</div>
						</div>

						{/* Last update timestamp */}
						<div className="text-xs text-gray-400 mt-1">
							Last update: {realtimeData.lastUpdate || 'Never'}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};
