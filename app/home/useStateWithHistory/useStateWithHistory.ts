'use cleint';
import { useCallback, useReducer } from 'react';
import { historyReducer } from './historyReducer';

export function useStateWithHistory(initialState: any, capacity: number, storageKey: string) {
	const [{ queue, currentIndex }, dispatch] = useReducer(historyReducer, {
		queue: [initialState],
		currentIndex: 0,
	});

	const push = useCallback(
		(value: string) => {
			dispatch({ type: 'PUSH', value, capacity });
		},
		[capacity]
	);

	const undo = useCallback(() => {
		dispatch({ type: 'UNDO' });
	}, []);

	const redo = useCallback(() => {
		dispatch({ type: 'REDO' });
	}, []);

	const reset = useCallback(() => {
		dispatch({ type: 'RESET', initialState });
	}, [initialState]);

	const goTo = useCallback((index: number) => {
		dispatch({ type: 'GO_TO', index });
	}, []);

	return [queue[currentIndex], push, undo, redo, reset, goTo];
}
