'use client';
import { useCallback, useEffect, useState } from 'react';

type State = string;
interface HistoryState {
	store: State[];
	currentIndex: number;
}

export function useStateWithHistory(initialState: State, limit: number, storageKey: string) {
	const loadFromStorage = useCallback(() => {
		if (!storageKey || typeof window === 'undefined') return null;

		try {
			setIsLoading(true);
			const storedData: string | null = localStorage.getItem(storageKey);
			if (!storedData) return null;
			const parsedData: HistoryState = JSON.parse(storedData);
			return parsedData;
		} catch (err) {
			console.log('Some Error', err);
		} finally {
			setIsLoading(false);
		}
	}, [storageKey]);

	const [isLoading, setIsLoading] = useState(false);
	const [store, setStore] = useState<State[]>((): State[] => {
		const parsedData = loadFromStorage();
		return parsedData?.store || [initialState];
	});
	const [currentIndex, setCurrentIndex] = useState<number>((): number => {
		const parsedData = loadFromStorage();
		return parsedData?.currentIndex || 0;
	});
	const state = store[currentIndex];

	const saveToStorage = useCallback(
		(data: HistoryState) => {
			if (!storageKey || typeof window === 'undefined') return null;
			try {
				localStorage.setItem(storageKey, JSON.stringify(data));
			} catch (err) {
				console.log('Some Error', err);
			}
		},
		[storageKey]
	);

	useEffect(() => {
		saveToStorage({
			store,
			currentIndex,
		});
	}, [store, currentIndex, saveToStorage]);

	const push = useCallback(
		(newState: State) => {
			setStore((prevStore) => {
				let newStore = [...prevStore];
				if (currentIndex < newStore.length - 1) {
					newStore = newStore.slice(0, currentIndex + 1);
				}

				if (newStore.length >= limit) {
					newStore.shift();
				}

				newStore.push(newState);
				setCurrentIndex((prevIndex: number) =>
					Math.min(newStore.length - 1, prevIndex + 1)
				);
				return newStore;
			});
		},
		[currentIndex]
	);

	const undo = useCallback(() => {
		setCurrentIndex((prevIndex: number) => Math.max(0, prevIndex - 1));
	}, []);

	const redo = useCallback(() => {
		setCurrentIndex((prevIndex: number) => Math.min(store.length - 1, prevIndex + 1));
	}, [store.length]);

	const reset = useCallback(() => {
		setCurrentIndex(0);
		setStore([initialState]);
	}, [initialState]);

	const goTo = useCallback(
		(index: number) => {
			if (index >= 0 && index < store.length) setCurrentIndex(() => index);
		},
		[store.length]
	);

	const clearStorage = useCallback(() => {}, []);

	return { state, push, undo, redo, reset, goTo, clearStorage, isLoading };
}
