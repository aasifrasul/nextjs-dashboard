import { useLibraryUIStore } from './LibraryUIStore';
import {
	useBooks,
	useCreateBook,
	useUpdateBook,
	useDeleteBook,
	useToggleIssueBook,
} from './useQueryHooks';
import { Book } from './types';

export function useLibrary() {
	const uiState = useLibraryUIStore();
	const booksQuery = useBooks();
	const createBookMutation = useCreateBook();
	const updateBookMutation = useUpdateBook();
	const deleteBookMutation = useDeleteBook();
	const toggleIssueMutation = useToggleIssueBook();

	const handleSubmit = async () => {
		const { title, author, editingBook } = uiState;

		if (!title.trim() || !author.trim()) {
			// You might want to add a toast/notification system here
			console.error('Please fill in both title and author fields');
			return;
		}

		if (editingBook) {
			updateBookMutation.mutate({
				id: editingBook.id,
				data: { title: title.trim(), author: author.trim() },
			});
		} else {
			createBookMutation.mutate({
				title: title.trim(),
				author: author.trim(),
				issued: false,
			});
		}
	};

	const handleEditBook = (book: Book) => {
		uiState.setEditingBook(book);
		uiState.setTitle(book.title);
		uiState.setAuthor(book.author);
	};

	const handleDeleteBook = (id: number) => {
		deleteBookMutation.mutate(id);
	};

	const handleIssueBook = (id: number) => {
		toggleIssueMutation.mutate(id);
	};

	const isLoading =
		booksQuery.isLoading ||
		createBookMutation.isPending ||
		updateBookMutation.isPending ||
		deleteBookMutation.isPending ||
		toggleIssueMutation.isPending;

	return {
		// Data
		books: booksQuery.data || [],

		// Loading states
		isLoading,
		isFetching: booksQuery.isFetching,

		// Error handling
		error:
			booksQuery.error ||
			createBookMutation.error ||
			updateBookMutation.error ||
			deleteBookMutation.error ||
			toggleIssueMutation.error,

		// UI state
		...uiState,

		// Actions
		handleSubmit,
		handleEditBook,
		handleDeleteBook,
		handleIssueBook,

		// Query utilities
		refetch: booksQuery.refetch,
	};
}
