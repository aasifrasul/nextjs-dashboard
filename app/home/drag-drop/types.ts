// Type definitions
export interface CardProps {
	item: number;
}

export interface DraggedItem {
	item: number;
	sourceColumn: string;
}

export interface ColumnData {
	todo: number[];
	inProgress: number[];
	done: number[];
}

export interface ColumnConfig {
	id: keyof ColumnData;
	title: string;
	items: number[];
}
