import { useEffect, useReducer, useCallback, createContext, useContext } from 'react';

import { dbounce } from '@/app/lib/utils';

import { LibraryProivderProps, InitialState, LibraryContext } from './types';
import { libraryReducer } from './libraryReducer';
import * as actions from './ActionCreators';

const initialState: InitialState = {
	books: [],
	filteredBooks: [],
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
	handleSubmit: () => {},
	handleEditBook: (id: number) => {},
	handleDeleteBook: (id: number) => {},
	handleIssueBook: (id: number) => {},
});

export function useLibrary() {
	const context = useContext(libraryContext);

	if (!context) {
		throw new Error('Please use inside LibraryProvider');
	}

	return context;
}

export default function LibraryProvider({ children }: LibraryProivderProps) {
	const [state, dispatch] = useReducer(libraryReducer, initialState);
	const { books, filteredBooks, title, author, searchText, editingBook } = state;

	// Memoized handler functions
	const setTitle = useCallback((title: string) => {
		dispatch(actions.setTitle(title));
	}, []);

	const setAuthor = useCallback((author: string) => {
		dispatch(actions.setAuthor(author));
	}, []);

	const setSearchText = useCallback((text: string) => {
		dispatch(actions.setSearchText(text));
		dispatch(actions.filterBooks(text));
	}, []);

	const handleSubmit = useCallback(() => {
		if (title.length <= 0 || author.length <= 0) return;

		if (editingBook) {
			dispatch(actions.updateBook({ ...editingBook, title, author }));
		} else {
			dispatch(
				actions.addBook({
					id: Date.now(),
					title,
					author,
					issued: false,
				}),
			);
		}

		// Reset form
		dispatch(actions.setTitle(''));
		dispatch(actions.setAuthor(''));
		dispatch(actions.setEditingBook(null));
	}, [title, author, editingBook]);

	const handleEditBook = useCallback(
		(id: number) => {
			const bookToEdit = books.find((book) => book.id === id);
			if (bookToEdit) {
				dispatch(actions.setEditingBook(bookToEdit));
			}
		},
		[books],
	);

	const handleDeleteBook = useCallback((id: number) => {
		dispatch(actions.deleteBook(id));
	}, []);

	const handleIssueBook = useCallback((id: number) => {
		dispatch(actions.toggleIssueBook(id));
	}, []);

	// Filter books whenever books or searchText changes
	useEffect(() => {
		dispatch(actions.filterBooks(searchText));
	}, [books, searchText]);

	const contextValue: LibraryContext = {
		...state,
		books: (searchText.length > 0 ? filteredBooks : books) || [],
		setTitle,
		setAuthor,
		setSearchText: dbounce(setSearchText, 300),
		handleSubmit,
		handleEditBook,
		handleDeleteBook,
		handleIssueBook,
	};

	return <libraryContext.Provider value={contextValue}>{children}</libraryContext.Provider>;
}
