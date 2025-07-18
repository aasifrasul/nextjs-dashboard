'use client';
import { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import Portal from '@/app/lib/Portal';
import {
	useClickOutside,
	useSearchParams,
	useEventListener,
	useDebouncedCallback,
} from '@/app/hooks';
import { fetchAPIData } from '@/app/lib/apiUtils';

const url: string = 'https://autocomplete.clearbit.com/v1/companies/suggest?query=';
const delay: number = 500;

interface Item {
	name: string;
	logo: string;
	domain: string;
}

export default function AutoComplete() {
	const [text, setText] = useState<string>('');
	const [items, setItems] = useState<Item[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [currentItem, setCurrentItem] = useState<Item | null>(null);

	const modalContainerRef = useRef<HTMLDivElement | null>(null);
	const searchCacheRef = useRef<Record<string, Item[]>>({});
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	const { searchParams, updateParams } = useSearchParams();

	// Track outside clicks for the list separately
	const { isOutsideClick: isListOutsideClick, outsideRef: listRef } =
		useClickOutside<HTMLUListElement>(false);

	// Track outside clicks for the modal separately
	const { isOutsideClick: isModalOutsideClick, outsideRef: modalRef } =
		useClickOutside<HTMLDivElement>(false);

	const fetchData = useCallback(
		async (searchText: string) => {
			if (searchText.length === 0 || isLoading) return;

			if (searchText in searchCacheRef.current) {
				return setItems(searchCacheRef.current[searchText]);
			}

			setIsLoading(true);

			const result = await fetchAPIData(`${url}${searchText}`);

			if (result.success) {
				const data: Item[] = result.data as Item[];
				searchCacheRef.current[searchText] = data;
				setItems(data);
				updateParams({ searchText });
			} else {
				console.error('Error fetching data:', result.error);
				setItems([]);
			}

			setIsLoading(false);
		},
		[updateParams],
	);

	const { debouncedCallback, cancel } = useDebouncedCallback(fetchData, delay);

	useEffect(() => {
		if (text.length === 0) {
			cancel();
			setItems([]);
			return;
		}
		debouncedCallback(text);
		return cancel;
	}, [text, debouncedCallback, cancel]);

	/*const debouncedFetch = useCallback((searchText: string) => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			fetchData(searchText);
		}, delay)
	}, [fetchData]);

	// Dedicated useEffect for debounced fetch - this is the single source of truth
	useEffect(() => {
		if (text.length > 0) {
			debouncedFetch(text);
		} else {
			setItems([]);
		}
	}, [text, debouncedFetch]);*/

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setText(e.target.value || '');
	};

	const handleClick = (index: number) => {
		setCurrentItem(items[index]);
		setIsModalOpen(true);
	};

	const handleClear = () => {
		setText('');
		setItems([]);
		closeModal();
		updateParams({ searchText: null }); // Ensure URL param is cleared
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setCurrentItem(null);
	};

	// Handle URL params on mount/change
	useEffect(() => {
		const searchText = searchParams.get('searchText') || '';
		if (searchText.length > 0) {
			setText(searchText); // This will trigger the debounced fetch useEffect
		}
	}, [searchParams]);

	// Handle outside click for search results list
	useEffect(() => {
		if (isListOutsideClick && items.length > 0 && !isModalOpen) {
			//setItems([]); // Only hide search results when modal is not open
		}
	}, [isListOutsideClick, items.length, isModalOpen]);

	// Handle outside click for modal
	useEffect(() => {
		if (isModalOutsideClick && isModalOpen) {
			closeModal(); // Close the modal
		}
	}, [isModalOutsideClick, isModalOpen]);

	const handlePageReload = useCallback((e: BeforeUnloadEvent) => {
		console.log('Page reloaded on event', e);
		// You might want to remove searchParams here or not, depending on desired behavior
		// updateParams({ searchText: null }); // Example: clear on reload
	}, []); // useCallback for handlePageReload

	useEventListener('beforeunload', handlePageReload, globalThis);

	return (
		<>
			<div className="relative flex flex-col items-center p-4 min-h-screen bg-gray-50">
				{' '}
				{/* Container for centering and background */}
				<div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
					{' '}
					{/* Card-like container for the autocomplete */}
					<div className="flex items-center gap-2 mb-4">
						{' '}
						{/* Input and button group */}
						<input
							type="text"
							value={text}
							onChange={handleChange}
							placeholder="Search companies..."
							className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base"
						/>
						<button
							onClick={handleClear}
							// Re-evaluated Tailwind classes for better button styling
							className="h-10 px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out flex items-center justify-center"
						>
							<span className="text-sm">Clear</span>
							{/* You could add an icon here, e.g., <XMarkIcon className="h-5 w-5 ml-1" /> */}
						</button>
					</div>
					{isLoading && (
						<div className="text-center py-4 text-blue-600 font-semibold">
							Loading results...
						</div>
					)}
					{!isLoading && !isModalOpen && items.length > 0 && (
						<ul
							ref={listRef}
							className="absolute z-10 w-[calc(100%-3rem)] max-w-lg bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
						>
							{' '}
							{/* Positioning and styling for results list */}
							{items.map(({ name, logo, domain }, index) => (
								<li
									key={domain} // Use a unique key like domain
									onClick={() => handleClick(index)}
									className="flex items-center p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
								>
									{logo && (
										<img
											src={logo}
											alt={`${name} logo`}
											className="w-8 h-8 mr-3 object-contain rounded-full border border-gray-200 p-0.5"
										/>
									)}
									<span className="text-gray-800 font-medium">{name}</span>
									<span className="ml-auto text-sm text-gray-500">
										{domain}
									</span>{' '}
									{/* Show domain as well */}
								</li>
							))}
						</ul>
					)}
					{!isLoading && !isModalOpen && items.length === 0 && text.length > 0 && (
						<div className="text-center py-4 text-gray-500">
							No results found for "{text}".
						</div>
					)}
				</div>
			</div>
			{/* Modal Portal */}
			{isModalOpen && modalContainerRef.current && (
				<Portal container={modalContainerRef.current}>
					{' '}
					{/* Non-null assertion as it's guaranteed to be mounted */}
					<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
						{' '}
						{/* Overlay */}
						<div
							ref={modalRef}
							className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fade-in"
						>
							{' '}
							{/* Modal content box */}
							<button
								onClick={closeModal}
								className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold p-1 rounded-full hover:bg-gray-100"
							>
								&times; {/* Nicer 'X' character */}
							</button>
							{currentItem && (
								<div className="text-center">
									<h2 className="text-2xl font-bold text-gray-800 mb-4">
										{currentItem.name}
									</h2>
									{currentItem.logo && (
										<img
											src={currentItem.logo}
											alt={`${currentItem.name} logo`}
											className="mx-auto mb-4 w-24 h-24 object-contain rounded-full border border-gray-200 p-1"
										/>
									)}
									<p className="text-gray-600 text-lg">
										{currentItem.domain}
									</p>
									{/* Add more details here if needed */}
								</div>
							)}
						</div>
					</div>
				</Portal>
			)}
			{/* Hidden div for Portal container */}
			<div ref={modalContainerRef} id="modal-root" /> {/* Assign ID for clarity */}
		</>
	);
}
