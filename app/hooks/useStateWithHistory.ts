'use client';
import { useState, useCallback, useEffect } from 'react';

/**
 * A custom React hook for managing state with undo/redo history and optional persistence.
 */
export function useStateWithHistory(initialState: any, capacity: number, storageKey?: string) {
	// Helper function to load from storage
	const loadFromStorage = useCallback(() => {
		if (!storageKey || typeof window === 'undefined') return null;

		try {
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Validate the stored data structure
				if (
					parsed.queue &&
					Array.isArray(parsed.queue) &&
					typeof parsed.currentIndex === 'number'
				) {
					return parsed;
				}
			}
		} catch (error) {
			console.warn(`Failed to load from storage key "${storageKey}":`, error);
		}
		return null;
	}, [storageKey]);

	// Helper function to save to storage
	const saveToStorage = useCallback(
		(queue: any[], currentIndex: number) => {
			if (!storageKey || typeof window === 'undefined') return;

			try {
				const dataToStore = { queue, currentIndex };
				localStorage.setItem(storageKey, JSON.stringify(dataToStore));
			} catch (error) {
				console.warn(`Failed to save to storage key "${storageKey}":`, error);
			}
		},
		[storageKey]
	);

	// Initialize state from storage or use initial values
	const [queue, setQueue] = useState<any[]>(() => {
		const stored = loadFromStorage();
		return stored ? stored.queue : [initialState];
	});

	const [currentIndex, setCurrentIndex] = useState(() => {
		const stored = loadFromStorage();
		return stored ? stored.currentIndex : 0;
	});

	// Save to storage whenever queue or currentIndex changes
	useEffect(() => {
		if (storageKey) {
			saveToStorage(queue, currentIndex);
		}
	}, [queue, currentIndex, saveToStorage, storageKey]);

	const state = queue[currentIndex];

	const push = useCallback(
		(value: any) => {
			setQueue((prevQueue) => {
				let newQueue = [...prevQueue];

				if (currentIndex < newQueue.length - 1) {
					newQueue = newQueue.slice(0, currentIndex + 1);
				}

				if (newQueue.length >= capacity) {
					newQueue.shift();
				}

				newQueue.push(value);
				setCurrentIndex(newQueue.length - 1);
				return newQueue;
			});
		},
		[capacity, currentIndex]
	);

	const undo = useCallback(() => {
		setCurrentIndex((prev: number) => Math.max(0, prev - 1));
	}, []);

	const redo = useCallback(() => {
		setCurrentIndex((prev: number) => Math.min(queue.length - 1, prev + 1));
	}, [queue.length]);

	const reset = useCallback(() => {
		setQueue([initialState]);
		setCurrentIndex(0);
	}, [initialState]);

	const goTo = useCallback(
		(index: number) => {
			if (index >= 0 && index < queue.length) {
				setCurrentIndex(index);
			}
		},
		[queue.length]
	);

	// Clear storage function (bonus utility)
	const clearStorage = useCallback(() => {
		if (storageKey && typeof window !== 'undefined') {
			localStorage.removeItem(storageKey);
		}
	}, [storageKey]);

	return [state, push, undo, redo, reset, goTo, clearStorage];
}
