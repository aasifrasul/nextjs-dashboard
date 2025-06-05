'use client';
import { useState, useCallback } from 'react';

type ToggleFunction = (value?: boolean) => void;

export const useToggle = (initialState: boolean = false): [boolean, ToggleFunction] => {
	const [state, setState] = useState<boolean>(initialState);

	const toggle: ToggleFunction = useCallback((value?: boolean) => {
		setState((prevState) => (typeof value === 'boolean' ? value : !prevState));
	}, []);

	return [state, toggle];
};
