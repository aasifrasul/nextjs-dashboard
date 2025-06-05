'use client';
import { useState, useEffect, useCallback } from 'react';

import { useEventListener } from '.';

type callbackParams = URLSearchParams | ((prev: URLSearchParams) => URLSearchParams);

export function useSearchParams() {
	// Initialize with current URL search params
	const [searchParams, setSearchParams] = useState<URLSearchParams>(
		new URLSearchParams(window?.location?.search),
	);

	useEventListener('popstate', handlePopState, window);

	// Update URL whenever searchParams changes
	useEffect(() => {
		setSearchParams(new URLSearchParams(window?.location?.search));
	}, []);

	function handlePopState(event: PopStateEvent) {
		// Get params from event state if available, otherwise from URL
		const newParams = new URLSearchParams(
			event.state?.searchParams || window?.location?.search,
		);
		setSearchParams(newParams);
	}

	// Convenience method to update parameters
	const updateParams = useCallback(
		(params: Record<string, string | null>) => {
			// null could indicate deletion
			setSearchParams((prevParams: URLSearchParams): URLSearchParams => {
				const newParams: URLSearchParams = new URLSearchParams(prevParams);
				for (const key in params) {
					if (key.length > 0) {
						if (params[key] === null) {
							newParams.delete(key);
						} else {
							newParams.set(key, params[key] as string);
						}
					}
				}
				return newParams;
			});
		},
		[setSearchParams],
	);

	const getPageURL = useCallback(
		(): string => `${window.location.pathname}?${searchParams.toString()}`,
		[searchParams],
	);

	return { searchParams, setSearchParams, updateParams, getPageURL };
}
