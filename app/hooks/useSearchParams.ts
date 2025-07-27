'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

import { useEventListener } from '.';

export function useSearchParams() {
	// Initialize directly from URL - single source of truth
	const [searchParams, setSearchParams] = useState<URLSearchParams>(
		() => new URLSearchParams(globalThis.location?.search || ''),
	);

	// Track if this is the initial render to avoid history updates
	const isInitialMount = useRef(true);

	useEventListener('popstate', handlePopState, globalThis);

	// Update history when searchParams change (but not on initial mount)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		const newURL = `${globalThis.location.pathname}?${searchParams.toString()}`;

		// Only update if the URL has actually changed
		if (globalThis.location.href === newURL) return;

		globalThis.history.replaceState({ searchParams: searchParams.toString() }, '', newURL);
	}, [searchParams]);

	function handlePopState(event: PopStateEvent) {
		// Get params from event state if available, otherwise from URL
		const newParams = new URLSearchParams(
			event.state?.searchParams || globalThis.location.search,
		);
		setSearchParams(newParams);
	}

	const getPageURL = useCallback(
		(): string => `${globalThis.location.pathname}?${searchParams.toString()}`,
		[searchParams],
	);

	// Convenience method to update parameters
	const updateParams = useCallback((params: Record<string, string | null>) => {
		setSearchParams((prevParams: URLSearchParams): URLSearchParams => {
			const newParams: URLSearchParams = new URLSearchParams(prevParams);
			for (const key in params) {
				if (key.length === 0) continue;
				params[key] === null
					? newParams.delete(key)
					: newParams.set(key, params[key] as string);
			}
			return newParams;
		});
	}, []);

	return { searchParams, setSearchParams, updateParams, getPageURL };
}
