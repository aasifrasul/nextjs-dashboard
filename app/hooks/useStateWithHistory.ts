'use client';
import { useState, useCallback } from 'react';

/**
 * A custom React hook for managing state with undo/redo history.
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
	// State to hold the history queue
	const [queue, setQueue] = useState<any[]>([initialState]);
	// State to track the current position in the history queue
	const [currentIndex, setCurrentIndex] = useState(0);

	// The current state is simply the item at the currentIndex in the queue
	const state = queue[currentIndex];

	/**
	 * Pushes a new value to the history queue.
	 * If the current index is not at the end of the queue (meaning undo was used),
	 * it truncates the "future" history before adding the new value.
	 * It also handles the capacity limit.
	 */
	const push = useCallback(
		(value: any) => {
			setQueue((prevQueue) => {
				// Create a new queue array to avoid direct state mutation
				let newQueue = [...prevQueue];

				// 1. If we are not at the end of the history, truncate the "future" history
				// This ensures that pushing a new value after an undo correctly
				// overwrites the future states.
				if (currentIndex < newQueue.length - 1) {
					newQueue = newQueue.slice(0, currentIndex + 1);
				}

				// 2. Handle capacity limit: If adding the new item would exceed capacity,
				// remove the oldest item from the beginning.
				if (newQueue.length >= capacity) {
					newQueue.shift();
				}

				// 3. Add the new value to the end of the queue
				newQueue.push(value);

				// 4. Update the current index to point to the newly added item
				// This is done inside the setQueue callback to ensure both state updates
				// are batched together by React, preventing race conditions.
				setCurrentIndex(newQueue.length - 1);

				return newQueue;
			});
		},
		[capacity, currentIndex]
	); // currentIndex is a dependency because push needs its latest value for truncation

	/**
	 * Moves the current index one step back in history (undo).
	 */
	const undo = useCallback(() => {
		// Use functional update for setCurrentIndex to ensure it operates on the latest state
		setCurrentIndex((prev) => Math.max(0, prev - 1));
	}, []); // No dependencies needed as it only uses functional update

	/**
	 * Moves the current index one step forward in history (redo).
	 */
	const redo = useCallback(() => {
		// Use functional update for setCurrentIndex and ensure it doesn't go beyond the queue's length
		setCurrentIndex((prev) => Math.min(queue.length - 1, prev + 1));
	}, [queue.length]); // queue.length is a dependency because it determines the upper bound

	/**
	 * Resets the history queue to the initial state and sets the index to 0.
	 */
	const reset = useCallback(() => {
		setQueue([initialState]); // Reset queue to initial state
		setCurrentIndex(0); // Reset index to the beginning
	}, [initialState]); // initialState is a dependency to ensure it's always the latest value

	/**
	 * Navigates to a specific index in the history queue.
	 * @param index The target index.
	 */
	const goTo = useCallback(
		(index: number) => {
			// Ensure the target index is within valid bounds
			if (index >= 0 && index < queue.length) {
				setCurrentIndex(index);
			}
		},
		[queue.length]
	); // queue.length is a dependency to ensure correct bounds checking

	// Return the current state and all history manipulation functions
	return [state, push, undo, redo, reset, goTo];
}
