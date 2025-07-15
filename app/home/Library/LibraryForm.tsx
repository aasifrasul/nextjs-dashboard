import { useLibrary } from '@/app/context/LibraryProvider';
import { useEffect, useRef } from 'react';

export function LibraryForm() {
	const { title, author, editingBook, isLoading, error, setTitle, setAuthor, handleSubmit } =
		useLibrary();

	const editRef = useRef<HTMLInputElement>(null);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await handleSubmit();
	};

	useEffect(() => {
		if (editingBook) {
			editRef.current?.focus();
		}
	}, [editingBook]);

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			{error && (
				<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
					{error}
				</div>
			)}

			<div>
				<label htmlFor="title" className="block text-sm font-medium text-gray-700">
					Book Name
				</label>
				<input
					ref={editRef}
					type="text"
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					placeholder="Enter book title"
					disabled={isLoading}
				/>
			</div>

			<div>
				<label htmlFor="author" className="block text-sm font-medium text-gray-700">
					Author
				</label>
				<input
					type="text"
					id="author"
					value={author}
					onChange={(e) => setAuthor(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					placeholder="Enter author title"
					disabled={isLoading}
				/>
			</div>

			<button
				type="submit"
				disabled={isLoading || !title.trim() || !author.trim()}
				className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
			</button>
		</form>
	);
}
