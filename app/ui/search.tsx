'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback, useRef, useMemo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { dbounce } from '@/app/lib/utils';

export default function Search({ placeholder }: { placeholder: string }) {
	const searchParams = useSearchParams();
	const { replace } = useRouter();
	// Use consistent parameter name (e.g., 'query')
	const [query, setQuery] = useState(searchParams.get('query')?.toString() || '');
	const searchRef = useRef<HTMLInputElement>(null);

	// Correct implementation
	const handleSearch = useCallback(
		(term: string) => {
			// Create new URLSearchParams but preserve other parameters
			const params = new URLSearchParams(searchParams);

			// Remove any old 'search' parameter if it exists
			params.delete('search');
			params.set('page', '1');

			// Set or remove 'query' parameter
			term ? params.set('query', term) : params.delete('query');

			replace(`?${params.toString()}`);
		},
		[searchParams, replace]
	);

	// Apply dbounce separately
	const debouncedHandleSearch = useMemo(() => dbounce(handleSearch, 500), [handleSearch]);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const term = event.target.value;
		setQuery(term);
		debouncedHandleSearch(term);
	};

	return (
		<div className="relative flex items-center rounded-md md:w-1/2">
			<input
				ref={searchRef}
				type="text"
				placeholder={placeholder}
				className="peer hidden w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 md:block"
				value={query}
				onChange={handleInputChange}
			/>
			<MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-gray-400" />
		</div>
	);
}
