import React from 'react';
import { Zap } from 'lucide-react';

import { formatPrice, formatVolume } from '../utils';
import { RealtimeData } from '../types';

interface RealtimeDataCardProps {
	realtimeData: RealtimeData;
}

export const RealtimeDataCard: React.FC<RealtimeDataCardProps> = ({ realtimeData }) => {
	return (
		<div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
			<h4 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
				<Zap className="w-5 h-5" />
				Live Market Data
			</h4>
			<div className="grid grid-cols-2 gap-4 text-sm">
				<div>
					<div className="text-gray-400">Current Price</div>
					<div className="text-xl font-bold text-blue-300">
						{formatPrice(realtimeData.price)}
					</div>
				</div>
				<div>
					<div className="text-gray-400">24h Change</div>
					<div
						className={`text-lg font-semibold ${
							parseFloat(realtimeData.change24h || '0') >= 0
								? 'text-green-400'
								: 'text-red-400'
						}`}
					>
						{realtimeData.change24h || '0.00'}%
					</div>
				</div>
				<div>
					<div className="text-gray-400">24h Volume</div>
					<div className="text-gray-200">{formatVolume(realtimeData.volume24h)}</div>
				</div>
				<div>
					<div className="text-gray-400">Spread</div>
					<div className="text-gray-200">{formatPrice(realtimeData.spread)}</div>
				</div>
			</div>
		</div>
	);
};
