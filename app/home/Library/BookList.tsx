import { useLibrary } from './useHooks';
import { Book } from '@/app/types/Library';

interface BookItemProps {
	book: Book;
	onEdit: (book: Book) => void;
	onDelete: (id: number) => void;
	onToggleIssue: (id: number) => void;
	isLoading: boolean;
}

function BookItem({ book, onEdit, onDelete, onToggleIssue, isLoading }: BookItemProps) {
	return (
		<div className="bg-white p-4 rounded-lg shadow border">
			<div className="flex justify-between items-start mb-2">
				<h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
				<span
					className={`px-2 py-1 text-xs font-medium rounded-full ${
						book.issued ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
					}`}
				>
					{book.issued ? 'Issued' : 'Available'}
				</span>
			</div>

			<p className="text-gray-600 mb-2">by {book.author}</p>

			<div className="text-xs text-gray-500 mb-3">
				{book?.createdAt && (
					<p>Added: {new Date(book.createdAt).toLocaleDateString()}</p>
				)}
				{book?.updatedAt && (
					<p>Updated: {new Date(book.updatedAt).toLocaleDateString()}</p>
				)}
			</div>

			<div className="flex space-x-2">
				<button
					onClick={() => onEdit(book)}
					disabled={isLoading}
					className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
				>
					Edit
				</button>

				<button
					onClick={() => onToggleIssue(book.id)}
					disabled={isLoading}
					className={`px-3 py-1 text-sm rounded disabled:opacity-50 ${
						book.issued
							? 'bg-green-600 text-white hover:bg-green-700'
							: 'bg-yellow-600 text-white hover:bg-yellow-700'
					}`}
				>
					{book.issued ? 'Return' : 'Issue'}
				</button>

				<button
					onClick={() => onDelete(book.id)}
					disabled={isLoading}
					className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
				>
					Delete
				</button>
			</div>
		</div>
	);
}

export function BookList() {
	const { books, isLoading, error, handleEditBook, handleDeleteBook, handleIssueBook } =
		useLibrary();

	if (isLoading && books.length === 0) {
		return (
			<div className="flex justify-center items-center h-32">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (error && books.length === 0) {
		return (
			<div className="text-center py-8">
				<div className="text-red-600 mb-2">Error loading books</div>
				<p className="text-gray-600">{error?.message}</p>
			</div>
		);
	}

	if (books.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500">
				No books found. Add your first book!
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{books.map((book) => (
				<BookItem
					key={book.id}
					book={book}
					onEdit={handleEditBook}
					onDelete={handleDeleteBook}
					onToggleIssue={handleIssueBook}
					isLoading={isLoading}
				/>
			))}
		</div>
	);
}
