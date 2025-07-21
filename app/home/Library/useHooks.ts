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
		const { editingBook } = uiState;
		const title = uiState.title.trim();
		const author = uiState.author.trim();

		if (!title || !author) {
			// You might want to add a toast/notification system here
			console.error('Please fill in both title and author fields');
			return;
		}

		const data = { title, author }

		editingBook ?
			updateBookMutation.mutate({ id: editingBook.id, data }) :
			createBookMutation.mutate({ ...data, issued: false });
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

	return {
		// Data
		books: booksQuery.data || [],

		// Loading states
		isLoading: booksQuery.isLoading,
		createBookPednding: createBookMutation.isPending,
		updateBookPending: updateBookMutation.isPending,
		deleteBookPednding: deleteBookMutation.isPending,
		toggleIssuePednding: toggleIssueMutation.isPending,

		isFetching: booksQuery.isFetching,

		// Error handling
		error: booksQuery.error,
		createBookError: createBookMutation.error,
		updateBookError: updateBookMutation.error,
		deleteBookError: deleteBookMutation.error,
		toggleIssueError: toggleIssueMutation.error,

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
