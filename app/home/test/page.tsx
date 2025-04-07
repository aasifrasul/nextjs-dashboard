'use client';

import { ChangeEvent, useState, useTransition, useDeferredValue, useMemo } from 'react';

import CATEGORIES from './data.json';

// Move large list outside of the component to prevent re-creation
const LARGE_LIST = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

export default function Page() {
	// State for search input
	const [searchTerm, setSearchTerm] = useState('');

	// useTransition example
	const [isPending, startTransition] = useTransition();

	// Use useMemo to memoize filtered list
	const filteredList = useMemo(() => {
		return LARGE_LIST.filter((item) =>
			item.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [searchTerm]);

	// Handler for search input using useTransition
	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;

		// Use startTransition to defer less critical updates
		startTransition(() => {
			setSearchTerm(value);
		});
	};

	const [products] = useState(CATEGORIES);
	const [filterTerm, setFilterTerm] = useState('');
	const deferredFilterTerm = useDeferredValue(filterTerm);

	const filteredProducts = useMemo(() => {
		return products.filter((product) =>
			product.name.toLowerCase().includes(deferredFilterTerm.toLowerCase()),
		);
	}, [products, deferredFilterTerm]);

	return (
		<div>
			<h2>Performance Hooks Demo</h2>

			{/* useTransition Example */}
			<div>
				<h3>useTransition Example</h3>
				<input
					type="text"
					placeholder="Search large list"
					onChange={handleSearchChange}
				/>
				{isPending && <p>Loading...</p>}
				<ul>
					{filteredList.slice(0, 10).map((item, index) => (
						<li key={index}>{item}</li>
					))}
				</ul>
			</div>

			{/* useDeferredValue Example */}
			<div>
				<h3>useDeferredValue Example</h3>
				<input
					type="text"
					placeholder="Filter products"
					value={filterTerm}
					onChange={(e: ChangeEvent<HTMLInputElement>) =>
						setFilterTerm(e.target.value)
					}
				/>
				<ul>
					{filteredProducts.map((product) => (
						<li key={product.id}>
							{product.name} - {product.category}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
