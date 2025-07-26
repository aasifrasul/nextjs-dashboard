'use client';
import { useReducer, useCallback, useEffect, useState } from 'react';
import { historyReducer, HistoryState } from './historyReducer';
import { Storage, StorageType } from '@/app/lib/Storage';

const storage = new Storage(StorageType.LOCAL_STORAGE);
storage.initialize();

export function useStateWithHistory(initialState: any, capacity: number, storageKey: string) {
	const [isLoading, setIsLoading] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);

	const loadFromStorage = useCallback(async (): Promise<HistoryState | null> => {
		try {
			const storedData: HistoryState | null = await storage.getItem(storageKey);
			return storedData &&
				Array.isArray(storedData.queue) &&
				storedData.currentIndex >= 0
				? storedData
				: null;
		} catch (error) {
			console.error('Error loading from storage:', error);
			return null;
		}
	}, [storageKey]);

	// Initialize with a placeholder state
	const [{ queue, currentIndex }, dispatch] = useReducer(historyReducer, {
		queue: [initialState],
		currentIndex: 0,
		storageKey,
	});

	// Load data from storage on mount
	useEffect(() => {
		let isCancelled = false;

		const initializeFromStorage = async () => {
			if (!storageKey) {
				setIsLoading(false);
				setIsInitialized(true);
				return;
			}

			try {
				const storedState = await loadFromStorage();

				if (!isCancelled) {
					if (storedState) {
						// Initialize with stored state
						dispatch({ type: 'INITIALIZE', state: storedState });
					}
					setIsLoading(false);
					setIsInitialized(true);
				}
			} catch (error) {
				if (!isCancelled) {
					console.error('Failed to initialize from storage:', error);
					setIsLoading(false);
					setIsInitialized(true);
				}
			}
		};

		initializeFromStorage();

		return () => {
			isCancelled = true;
		};
	}, [storageKey, loadFromStorage]);

	// Save to storage when state changes (but only after initialization)
	useEffect(() => {
		if (!isInitialized) return;
		saveToStorage();
	}, [currentIndex, queue, isInitialized]);

	const saveToStorage = useCallback(async () => {
		if (!storageKey || !isInitialized) return;

		try {
			await storage.setItem(storageKey, {
				currentIndex,
				queue,
			});
		} catch (err) {
			console.error('Error saving to storage:', err);
		}
	}, [storageKey, currentIndex, queue, isInitialized]);

	const clearStorage = useCallback(async () => {
		if (!storageKey) return;
		try {
			await storage.removeItem(storageKey);
		} catch (err) {
			console.error('Error clearing storage:', err);
		}
	}, [storageKey]);

	// The current state is derived from the queue and currentIndex
	const state = queue[currentIndex];

	const push = useCallback(
		(value: any) => {
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

	// Return loading state as well so components can handle it
	return {
		state,
		push,
		undo,
		redo,
		reset,
		goTo,
		clearStorage,
		isLoading, // Component can show loading spinner
		isInitialized,
	};
}
