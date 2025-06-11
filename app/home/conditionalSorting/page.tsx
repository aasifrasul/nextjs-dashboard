'use client';
import React from 'react';

const ignoreList = ['a', 'an', 'the'];

export default function App() {
	const [books, setBooks] = React.useState([
		'The Lord of the Rings',
		'A Game of Thrones',
		'Ancillary Justice',
		'1984',
		'The Great Gatsby',
		'An American Tragedy',
		'To Kill a Mockingbird',
	]);

	const [sortedBooks, setSortedBooks] = React.useState<string[]>([]);
	const hash = React.useRef<Record<string, string>>({});

	// Helper function to compute sortable title for a single book
	const computeSortableTitle = (title: string) => {
		const words = title.trim().split(' ');
		const firstWord = words[0].toLowerCase();

		if (ignoreList.includes(firstWord)) {
			return words.slice(1).join(' ').toLowerCase();
		}
		return title.toLowerCase();
	};

	// Helper function to sort books using existing hash
	const sortBooks = (bookList: string[]) => {
		return [...bookList].sort((a, b) => {
			return hash.current[a].localeCompare(hash.current[b]);
		});
	};

	// Initialize hash and sorted list only once
	React.useEffect(() => {
		// Build initial hash
		books.forEach((title) => {
			hash.current[title] = computeSortableTitle(title);
		});

		// Set initial sorted list
		setSortedBooks(sortBooks(books));

		console.log('Initial hash built:', hash.current);
	}, []); // Empty dependency array - runs only once

	const addBook = () => {
		const newTitle = prompt('Enter a book title:');
		if (newTitle && newTitle.trim()) {
			const trimmedTitle = newTitle.trim();

			// Add to hash
			hash.current[trimmedTitle] = computeSortableTitle(trimmedTitle);

			// Update books list
			const newBooks = [...books, trimmedTitle];
			setBooks(newBooks);

			// Re-sort with new book included
			setSortedBooks(sortBooks(newBooks));

			console.log(
				'Added book:',
				trimmedTitle,
				'Hash entry:',
				hash.current[trimmedTitle],
			);
		}
	};

	const removeBook = (index: number) => {
		const bookToRemove = books[index];

		// Remove from hash
		delete hash.current[bookToRemove];

		// Update books list
		const newBooks = books.filter((_, i) => i !== index);
		setBooks(newBooks);

		// Re-sort without removed book
		setSortedBooks(sortBooks(newBooks));

		console.log(
			'Removed book:',
			bookToRemove,
			'Hash size:',
			Object.keys(hash.current).length,
		);
	};

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">
					Truly Optimized Book Title Sorter
				</h1>
				<p className="text-gray-600 mb-6">
					Hash built once, direct updates, minimal re-sorting
				</p>

				<button
					onClick={addBook}
					className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
				>
					Add Book
				</button>

				<div className="grid md:grid-cols-2 gap-8">
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">
							Original Order
						</h2>
						<ul className="space-y-2">
							{books.map((book, index) => (
								<li
									key={index}
									className="flex justify-between items-center p-3 bg-gray-50 rounded"
								>
									<span className="text-gray-700">{book}</span>
									<button
										onClick={() => removeBook(index)}
										className="text-red-500 hover:text-red-700 ml-2"
									>
										×
									</button>
								</li>
							))}
						</ul>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">
							Sorted Alphabetically
						</h2>
						<ul className="space-y-2">
							{sortedBooks.map((book, index) => (
								<li key={index} className="p-3 bg-green-50 rounded">
									<span className="text-gray-700">{book}</span>
									<span className="text-sm text-gray-500 ml-2">
										(sorts as: "{hash.current[book]}")
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="mt-8 bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg font-semibold text-gray-800 mb-3">
						True Optimization:
					</h3>
					<ul className="text-gray-600 space-y-1">
						<li>
							• <strong>useEffect runs once:</strong> Only for initial hash
							building
						</li>
						<li>
							• <strong>Add operation:</strong> O(1) hash update + O(n log n)
							sort
						</li>
						<li>
							• <strong>Remove operation:</strong> O(1) hash deletion + O(n log
							n) sort
						</li>
						<li>
							• <strong>No redundant effects:</strong> Direct state manipulation
						</li>
						<li>
							• <strong>Minimal work:</strong> Only sort when list actually
							changes
						</li>
					</ul>

					<div className="mt-4 p-3 bg-gray-50 rounded">
						<strong>Hash Map ({Object.keys(hash.current).length} entries):</strong>
						<pre className="text-sm mt-2 overflow-x-auto">
							{JSON.stringify(hash.current, null, 2)}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
