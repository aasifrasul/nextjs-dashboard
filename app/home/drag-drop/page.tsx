'use client';
import React, { DragEvent, ReactNode } from 'react';

import { CardProps, DraggedItem, ColumnData, ColumnConfig } from './types';

import styles from './styles.module.css';

const Card = ({ item }: CardProps): ReactNode => (
	<div draggable="true" className={styles.item} data-item={item}>
		{item}
	</div>
);

export default function App() {
	const [columns, setColumns] = React.useState<ColumnData>({
		todo: [1, 2, 3],
		inProgress: [4, 5, 6],
		done: [7, 8, 9],
	});

	const [draggedItem, setDraggedItem] = React.useState<DraggedItem | null>(null);

	const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement;
		if (target.getAttribute('draggable') === 'true') {
			const item = Number(target.getAttribute('data-item'));
			const sourceColumn = target
				.closest('[data-column-id]')
				?.getAttribute('data-column-id');

			if (sourceColumn) {
				setDraggedItem({ item, sourceColumn });
				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setData('text/plain', ''); // For touch compatibility

				// Add visual feedback
				target.style.opacity = '0.5';
			}
		}
	};

	const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement;
		if (target.getAttribute('draggable') === 'true') {
			target.style.opacity = '1';
			setDraggedItem(null);
		}
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	};

	const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const target = e.target as HTMLElement;
		const column = target.closest('[data-column-id]') as HTMLElement;
		if (column && column.getAttribute('data-column-type') !== 'header') {
			column.setAttribute('data-drag-over', 'true');
		}
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement;
		const relatedTarget = e.relatedTarget as HTMLElement;
		const column = target.closest('[data-column-id]') as HTMLElement;
		if (column && !column.contains(relatedTarget)) {
			column.removeAttribute('data-drag-over');
		}
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();

		// Remove visual feedback from all columns
		document.querySelectorAll('[data-column-id]').forEach((col) => {
			col.removeAttribute('data-drag-over');
		});

		if (!draggedItem) return;

		const target = e.target as HTMLElement;
		const dropTarget = target.closest('[data-column-id]') as HTMLElement;
		if (!dropTarget || dropTarget.getAttribute('data-column-type') === 'header') return;

		const targetColumn = dropTarget.getAttribute('data-column-id') as keyof ColumnData;
		const { item, sourceColumn } = draggedItem;

		if (sourceColumn === targetColumn) return;

		// Single state update with functional update
		setColumns((prev) => {
			const newColumns = { ...prev };

			// Remove from source
			newColumns[sourceColumn as keyof ColumnData] = prev[
				sourceColumn as keyof ColumnData
			].filter((i) => i !== item);

			// Add to target (keep sorted)
			newColumns[targetColumn] = [...prev[targetColumn], item].sort((a, b) => a - b);

			return newColumns;
		});

		setDraggedItem(null);
	};

	// Memoized column data to avoid recreating arrays
	const columnConfig = React.useMemo(
		(): ColumnConfig[] => [
			{ id: 'todo', title: 'To Do', items: columns.todo },
			{ id: 'inProgress', title: 'In Progress', items: columns.inProgress },
			{ id: 'done', title: 'Done', items: columns.done },
		],
		[columns],
	);

	return (
		<div
			className={styles.App}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<div className={styles.board}>
				{columnConfig.map(({ id, title, items }) => (
					<div key={id} className={styles['column-container']}>
						<div
							className={`${styles.column} ${styles.header}`}
							data-column-id={id}
							data-column-type="header"
						>
							{title}
						</div>
						<div
							className={styles.column}
							data-column-id={id}
							data-column-type="drop-zone"
						>
							{items.map((item) => (
								<Card key={item} item={item} />
							))}
							{items.length === 0 && (
								<div className={styles['empty-state']}>Drop items here</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
