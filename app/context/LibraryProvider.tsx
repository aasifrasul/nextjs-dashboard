import { useEffect, useReducer, useCallback, createContext, useContext, useMemo } from 'react';
import { useDebounced } from '@/app/hooks';
import { LibraryApiClient, useApiError } from '@/app/api/Library/LibraryClient';
import {
	LibraryProviderProps,
	LibraryState,
	LibraryContext,
	Book,
	Action,
} from '@/app/types/Library';
import { libraryReducer, actions } from '@/app/reducer/LibraryReducer';

const initialState: LibraryState = {
	books: [],
	isLoading: false,
	error: null,
	title: '',
	author: '',
	searchText: '',
	editingBook: null,
};

const libraryContext = createContext<LibraryContext>({
	...initialState,
	setTitle: () => {},
	setAuthor: () => {},
	setSearchText: () => {},
	handleSubmit: async () => {},
	handleEditBook: () => {},
	handleDeleteBook: async () => {},
	handleIssueBook: async () => {},
	refreshBooks: async () => {},
});

export function useLibrary() {
	const context = useContext(libraryContext);
	if (!context) {
		throw new Error('useLibrary must be used within a LibraryProvider');
	}
	return context;
}

export default function LibraryProvider({ children }: LibraryProviderProps) {
	const [state, dispatch] = useReducer(libraryReducer, initialState);
	const { handleError } = useApiError();

	const { books, isLoading, error, title, author, searchText, editingBook } = state;

	// Debounced search text for API calls
	const debouncedSearchText = useDebounced(searchText, 300);

	// Fetch books from API
	const fetchBooks = useCallback(
		async (search?: string) => {
			dispatch(actions.setLoading(true) as Action);
			dispatch(actions.setError(null) as Action);

			try {
				const books = await LibraryApiClient.getBooks(search);
				dispatch(actions.setBooks(books) as Action);
			} catch (error) {
				const errorMessage = handleError(error);
				dispatch(actions.setError(errorMessage) as Action);
			}
		},
		[handleError],
	);

	// Refresh books - can be called manually
	const refreshBooks = useCallback(async () => {
		await fetchBooks(debouncedSearchText || undefined);
	}, [fetchBooks, debouncedSearchText]);

	// Form handlers
	const setTitle = useCallback((title: string) => {
		dispatch(actions.setTitle(title) as Action);
	}, []);

	const setAuthor = useCallback((author: string) => {
		dispatch(actions.setAuthor(author) as Action);
	}, []);

	const setSearchText = useCallback((text: string) => {
		dispatch(actions.setSearchText(text) as Action);
	}, []);

	// Submit handler - create or update book
	const handleSubmit = useCallback(async () => {
		if (!title.trim() || !author.trim()) {
			dispatch(
				actions.setError('Please fill in both title and author fields') as Action,
			);
			return;
		}

		dispatch(actions.setLoading(true) as Action);
		dispatch(actions.setError(null) as Action);

		try {
			if (editingBook) {
				// Update existing book
				const updatedBook = await LibraryApiClient.updateBook(editingBook.id, {
					title: title.trim(),
					author: author.trim(),
				});
				dispatch(actions.updateBook(updatedBook) as Action);
			} else {
				// Create new book
				const newBook = await LibraryApiClient.createBook({
					title: title.trim(),
					author: author.trim(),
					issued: false,
				});
				dispatch(actions.addBook(newBook) as Action);
			}

			// Clear form
			dispatch(actions.clearForm() as Action);
		} catch (error) {
			const errorMessage = handleError(error);
			dispatch(actions.setError(errorMessage) as Action);
		} finally {
			dispatch(actions.setLoading(false) as Action);
		}
	}, [title, author, editingBook, handleError]);

	// Edit book handler
	const handleEditBook = useCallback((book: Book) => {
		dispatch(actions.setEditingBook(book) as Action);
	}, []);

	// Delete book handler
	const handleDeleteBook = useCallback(
		async (id: number) => {
			dispatch(actions.setLoading(true) as Action);
			dispatch(actions.setError(null) as Action);

			try {
				await LibraryApiClient.deleteBook(id);
				dispatch(actions.deleteBook(id) as Action);
			} catch (error) {
				const errorMessage = handleError(error);
				dispatch(actions.setError(errorMessage) as Action);
			} finally {
				dispatch(actions.setLoading(false) as Action);
			}
		},
		[handleError],
	);

	// Toggle issue status handler
	const handleIssueBook = useCallback(
		async (id: number) => {
			dispatch(actions.setLoading(true) as Action);
			dispatch(actions.setError(null) as Action);

			try {
				const updatedBook = await LibraryApiClient.toggleIssueStatus(id);
				dispatch(actions.toggleIssueBook(updatedBook) as Action);
			} catch (error) {
				const errorMessage = handleError(error);
				dispatch(actions.setError(errorMessage) as Action);
			} finally {
				dispatch(actions.setLoading(false) as Action);
			}
		},
		[handleError],
	);

	// Load initial books
	useEffect(() => {
		fetchBooks();
	}, [fetchBooks]);

	// Fetch books when search text changes
	useEffect(() => {
		if (debouncedSearchText !== undefined) {
			fetchBooks(debouncedSearchText || undefined);
		}
	}, [debouncedSearchText, fetchBooks]);

	// Memoize context value to prevent unnecessary re-renders
	const contextValue = useMemo(
		(): LibraryContext => ({
			books,
			isLoading,
			error,
			title,
			author,
			searchText,
			editingBook,
			setTitle,
			setAuthor,
			setSearchText,
			handleSubmit,
			handleEditBook,
			handleDeleteBook,
			handleIssueBook,
			refreshBooks,
		}),
		[
			books,
			isLoading,
			error,
			title,
			author,
			searchText,
			editingBook,
			setTitle,
			setAuthor,
			setSearchText,
			handleSubmit,
			handleEditBook,
			handleDeleteBook,
			handleIssueBook,
			refreshBooks,
		],
	);

	return <libraryContext.Provider value={contextValue}>{children}</libraryContext.Provider>;
}
