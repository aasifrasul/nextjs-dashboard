import React, { useEffect, useReducer, useCallback, createContext, useContext } from 'react';

import { Book, LibraryProivderProps, InitialState, LibraryContext } from './types';
import { libraryReducer } from './libraryReducer';
import * as actions from './ActionCreators';

const initialState: InitialState = {
	books: [],
	filteredBooks: [],
	name: '',
	author: '',
	searchText: '',
	editingBook: null,
};

const libraryContext = createContext<LibraryContext>({
	...initialState,
	setName: () => {},
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
	const { books, filteredBooks, name, author, searchText, editingBook } = state;

	// Memoized handler functions
	const setName = useCallback((name: string) => {
		dispatch(actions.setName(name));
	}, []);

	const setAuthor = useCallback((author: string) => {
		dispatch(actions.setAuthor(author));
	}, []);

	const setSearchText = useCallback((text: string) => {
		dispatch(actions.setSearchText(text));
		dispatch(actions.filterBooks(text));
	}, []);

	const handleSubmit = useCallback(() => {
		if (name.length <= 0 || author.length <= 0) return;

		if (editingBook) {
			dispatch(actions.updateBook({ ...editingBook, name, author }));
		} else {
			dispatch(
				actions.addBook({
					id: Date.now(),
					name,
					author,
					issued: false,
				}),
			);
		}

		// Reset form
		dispatch(actions.setName(''));
		dispatch(actions.setAuthor(''));
		dispatch(actions.setEditingBook(null));
	}, [name, author, editingBook]);

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
		setName,
		setAuthor,
		setSearchText,
		handleSubmit,
		handleEditBook,
		handleDeleteBook,
		handleIssueBook,
	};

	return <libraryContext.Provider value={contextValue}>{children}</libraryContext.Provider>;
}
