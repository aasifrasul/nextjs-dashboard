'use client';
import { useRef, useEffect, ChangeEvent, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Portal from '@/app/lib/Portal';
import {
	useClickOutside,
	useSearchParams,
	useEventListener,
	useCompanySearch,
	useDebounced,
	useAppDispatch,
	useAppSelector,
} from '@/app/hooks';
import {
	setSearchText,
	openModal,
	closeModal,
	clearAll,
} from '@/app/stores/slices/autoCompleteSlice';

import { CompanyItem } from '@/app/types/autoComplete';

const DEBOUNCE_DELAY = 250;

export default function AutoComplete() {
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();

	// Client state from Redux
	const { searchText, isModalOpen, currentItem } = useAppSelector(
		(state) => state.autoComplete,
	);

	const modalContainerRef = useRef<HTMLDivElement | null>(null);
	const { searchParams, updateParams } = useSearchParams();

	// Debounced search text for API calls
	const debouncedSearchText = useDebounced(searchText, DEBOUNCE_DELAY);

	// Server state from TanStack Query
	const { data, isLoading, isError } = useCompanySearch({
		searchText: debouncedSearchText,
		enabled: debouncedSearchText.length > 0,
	});

	const companies = data as CompanyItem[];

	// Track outside clicks for the list separately
	const { isOutsideClick: isListOutsideClick, outsideRef: listRef } =
		useClickOutside<HTMLUListElement>(false);

	// Track outside clicks for the modal separately
	const { isOutsideClick: isModalOutsideClick, outsideRef: modalRef } =
		useClickOutside<HTMLDivElement>(false);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value || '';
		dispatch(setSearchText(value));
	};

	const handleItemClick = (index: number) => {
		const selectedItem = companies[index];
		if (selectedItem) {
			dispatch(openModal(selectedItem));
		}
	};

	const handleClear = () => {
		dispatch(clearAll());
		updateParams({ searchText: null });
		// Clear all cached queries
		queryClient.clear();
	};

	const handleCloseModal = () => {
		dispatch(closeModal());
	};

	// Handle URL params on mount
	useEffect(() => {
		const urlSearchText = searchParams.get('searchText') || '';
		if (urlSearchText) {
			dispatch(setSearchText(urlSearchText));
		}
	}, []);

	// Update URL params when search text changes
	useEffect(() => {
		if (searchText) {
			updateParams({ searchText });
		}
	}, [searchText, updateParams]);

	// Handle outside click for modal
	useEffect(() => {
		if (isModalOutsideClick && isModalOpen) {
			handleCloseModal();
		}
	}, [isModalOutsideClick, isModalOpen]);

	const handlePageReload = useCallback((e: BeforeUnloadEvent) => {
		console.log('Page reloaded on event', e);
		// Optionally clear search params on reload
		// updateParams({ searchText: null });
	}, []);

	useEventListener('beforeunload', handlePageReload, globalThis);

	// Determine what to show in the results area
	const showResults = !isLoading && !isModalOpen && companies?.length > 0;
	const showNoResults =
		!isLoading && !isModalOpen && companies?.length === 0 && searchText.length > 0;
	const showError = isError && !isLoading;

	return (
		<>
			<div className="relative flex flex-col items-center p-4 min-h-screen bg-gray-50">
				<div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
					<div className="flex items-center gap-2 mb-4">
						<input
							type="text"
							value={searchText}
							onChange={handleChange}
							placeholder="Search companies..."
							className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base"
						/>
						<button
							onClick={handleClear}
							className="h-10 px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out flex items-center justify-center"
						>
							<span className="text-sm"> Clear </span>
						</button>
					</div>

					{/* Loading state */}
					{isLoading && (
						<div className="text-center py-4 text-blue-600 font-semibold">
							Loading results...
						</div>
					)}

					{/* Error state */}
					{showError && (
						<div className="text-center py-4 text-red-600">
							Error loading results.Please try again.
						</div>
					)}

					{/* Results list */}
					{showResults && (
						<ul
							ref={listRef}
							className="absolute z-10 w-[calc(100%-3rem)] max-w-lg bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
						>
							{companies.map(({ name, logo, domain }, index) => (
								<li
									key={domain}
									onClick={() => handleItemClick(index)}
									className="flex items-center p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
								>
									{logo && (
										<img
											src={logo}
											alt={`${name} logo`}
											className="w-8 h-8 mr-3 object-contain rounded-full border border-gray-200 p-0.5"
										/>
									)}
									<span className="text-gray-800 font-medium"> {name} </span>
									<span className="ml-auto text-sm text-gray-500">
										{domain}
									</span>
								</li>
							))}
						</ul>
					)}

					{/* No results */}
					{showNoResults && (
						<div className="text-center py-4 text-gray-500">
							No results found for "{searchText}".
						</div>
					)}
				</div>
			</div>

			{/* Modal Portal */}
			{isModalOpen && modalContainerRef.current && (
				<Portal container={modalContainerRef.current}>
					<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
						<div
							ref={modalRef}
							className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fade-in"
						>
							<button
								onClick={handleCloseModal}
								className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold p-1 rounded-full hover:bg-gray-100"
							>
								X
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
								</div>
							)}
						</div>
					</div>
				</Portal>
			)}

			{/* Hidden div for Portal container */}
			<div ref={modalContainerRef} id="modal-root" />
		</>
	);
}
