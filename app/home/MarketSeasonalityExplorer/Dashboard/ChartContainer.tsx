import { ReactElement, JSXElementConstructor } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
	title: string;
	children: ReactElement<unknown, string | JSXElementConstructor<any>>;
	height?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
	title,
	children,
	height = 'h-48',
}) => {
	return (
		<div className="bg-gray-700/30 rounded-lg p-4">
			<h4 className="text-lg font-semibold text-gray-200 mb-4">{title}</h4>
			<div className={height}>
				<ResponsiveContainer width="100%" height="100%">
					{children}
				</ResponsiveContainer>
			</div>
		</div>
	);
};
