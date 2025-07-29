import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const getPerformanceIcon = (performance: number): React.ReactElement => {
	switch (performance) {
		case 1:
			return <TrendingUp className="w-3 h-3 text-green-400" />;
		case -1:
			return <TrendingDown className="w-3 h-3 text-red-400" />;
		default:
			return <Minus className="w-3 h-3 text-gray-400" />;
	}
};
