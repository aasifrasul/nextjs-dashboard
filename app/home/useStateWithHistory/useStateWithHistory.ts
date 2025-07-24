'use client';
import { useReducer, useCallback } from 'react';
import { historyReducer } from './historyReducer';

/**
 * A custom React hook for managing state with undo/redo history using useReducer.
 *
 * @param initialState The initial state value.
 * @param capacity The maximum number of history entries to keep.
 * @param storageKey A key for potential future storage (not implemented in this version).
 * @returns A tuple containing:
 * [0] The current state.
 * [1] A function to push a new state to the history.
 * [2] A function to undo to the previous state.
 * [3] A function to redo to the next state.
 * [4] A function to reset the history to the initial state.
 * [5] A function to go to a specific index in the history.
 */
export function useStateWithHistory(initialState: any, capacity: number, storageKey: string) {
	// Initialize the reducer with the historyReducer and an initial state object
	const [{ queue, currentIndex }, dispatch] = useReducer(historyReducer, {
		queue: [initialState],
		currentIndex: 0,
	});

	// The current state is derived from the queue and currentIndex
	const state = queue[currentIndex];

	// Memoized callback for pushing a new value.
	// 'capacity' is passed as part of the action, so it's not a stale closure concern here.
	const push = useCallback(
		(value: any) => {
			dispatch({ type: 'PUSH', value, capacity });
		},
		[capacity]
	); // 'capacity' is a dependency because it's part of the action payload

	// Memoized callback for undoing. No dependencies needed as it only dispatches a simple action.
	const undo = useCallback(() => {
		dispatch({ type: 'UNDO' });
	}, []);

	// Memoized callback for redoing. No dependencies needed.
	const redo = useCallback(() => {
		dispatch({ type: 'REDO' });
	}, []);

	// Memoized callback for resetting. 'initialState' is a dependency as it's part of the action payload.
	const reset = useCallback(() => {
		dispatch({ type: 'RESET', initialState });
	}, [initialState]);

	// Memoized callback for going to a specific index. No dependencies needed.
	const goTo = useCallback((index: number) => {
		dispatch({ type: 'GO_TO', index });
	}, []);

	// Return the current state and the action dispatchers
	return [state, push, undo, redo, reset, goTo];
}
