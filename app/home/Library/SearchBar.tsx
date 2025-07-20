import { useLibrary } from './useHooks';

export function SearchBar() {
	const { searchText, setSearchText } = useLibrary();

	return (
		<div className="mb-6">
			<label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
				Search Books
			</label>
			<input
				type="text"
				id="search"
				value={searchText}
				onChange={(e) => setSearchText(e.target.value)}
				placeholder="Search by title or author..."
				className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			/>
		</div>
	);
}
