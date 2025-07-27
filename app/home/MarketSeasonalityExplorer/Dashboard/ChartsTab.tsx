import {
	LineChart,
	Line,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	BarChart,
	Bar,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { ChartDataPoint, PriceHistoryDataPoint } from '../types';

interface ChartsTabProps {
	priceHistoryData: PriceHistoryDataPoint[];
	chartData: ChartDataPoint[];
}

export const ChartsTab: React.FC<ChartsTabProps> = ({ priceHistoryData, chartData }) => {
	const tooltipStyle = {
		backgroundColor: '#1F2937',
		border: '1px solid #374151',
		borderRadius: '8px',
	};

	return (
		<div className="space-y-6">
			{/* Price History Chart */}
			<ChartContainer title="7-Day Price History">
				<LineChart data={priceHistoryData}>
					<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
					<XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
					<YAxis stroke="#9CA3AF" fontSize={12} />
					<Tooltip contentStyle={tooltipStyle} />
					<Line
						type="monotone"
						dataKey="price"
						stroke="#8B5CF6"
						strokeWidth={2}
						dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
					/>
				</LineChart>
			</ChartContainer>

			{/* Volume Chart */}
			<ChartContainer title="Volume Distribution">
				<BarChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
					<XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
					<YAxis stroke="#9CA3AF" fontSize={12} />
					<Tooltip contentStyle={tooltipStyle} />
					<Bar dataKey="volume" fill="#3B82F6" radius={[2, 2, 0, 0]} />
				</BarChart>
			</ChartContainer>

			{/* Price vs Volume Correlation */}
			<ChartContainer title="Price vs Volume">
				<AreaChart data={priceHistoryData}>
					<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
					<XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
					<YAxis stroke="#9CA3AF" fontSize={12} />
					<Tooltip contentStyle={tooltipStyle} />
					<Area
						type="monotone"
						dataKey="volume"
						stackId="1"
						stroke="#10B981"
						fill="#10B981"
						fillOpacity={0.3}
					/>
				</AreaChart>
			</ChartContainer>
		</div>
	);
};
