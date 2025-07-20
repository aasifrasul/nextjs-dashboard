import { useBooks } from './useQueryHooks';
import { Book } from './types';

export function LibraryStats() {
	const { data = [] } = useBooks();
	const books = data as Book[];

	const totalBooks = books?.length;
	const issuedBooks = books?.filter((book) => book.issued).length;
	const availableBooks = totalBooks - issuedBooks;

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
			<div className="bg-blue-100 p-4 rounded-lg">
				<h3 className="text-lg font-semibold text-blue-800">Total Books</h3>
				<p className="text-2xl font-bold text-blue-900">{totalBooks}</p>
			</div>

			<div className="bg-green-100 p-4 rounded-lg">
				<h3 className="text-lg font-semibold text-green-800">Available</h3>
				<p className="text-2xl font-bold text-green-900">{availableBooks}</p>
			</div>

			<div className="bg-red-100 p-4 rounded-lg">
				<h3 className="text-lg font-semibold text-red-800">Issued</h3>
				<p className="text-2xl font-bold text-red-900">{issuedBooks}</p>
			</div>
		</div>
	);
}
