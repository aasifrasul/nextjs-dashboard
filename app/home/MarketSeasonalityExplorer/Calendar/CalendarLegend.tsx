export const CalendarLegend: React.FC = () => (
	<div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
		<div className="flex flex-wrap gap-4 text-xs">
			<div className="flex items-center gap-2">
				<div className="w-3 h-3 rounded bg-gradient-to-r from-green-700 to-green-600" />
				<span>Low Volatility</span>
			</div>
			<div className="flex items-center gap-2">
				<div className="w-3 h-3 rounded bg-gradient-to-r from-yellow-700 to-yellow-600" />
				<span>Medium Volatility</span>
			</div>
			<div className="flex items-center gap-2">
				<div className="w-3 h-3 rounded bg-gradient-to-r from-red-700 to-red-600" />
				<span>High Volatility</span>
			</div>
			<div className="flex items-center gap-2">
				<div className="w-3 h-3 rounded-full bg-blue-400" />
				<span>Liquidity</span>
			</div>
		</div>
	</div>
);
