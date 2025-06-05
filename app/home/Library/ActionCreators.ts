import { ActionType, Action, Book } from './types';

// Type-safe action creators
export const setName = (name: string): Action => ({
	type: ActionType.SET_NAME,
	payload: name,
});

export const setAuthor = (author: string): Action => ({
	type: ActionType.SET_AUTHOR,
	payload: author,
});

export const setSearchText = (searchText: string): Action => ({
	type: ActionType.SET_SEARCH_TEXT,
	payload: searchText,
});

export const addBook = (book: Book): Action => ({
	type: ActionType.ADD_BOOK,
	payload: book,
});

export const updateBook = (book: Book): Action => ({
	type: ActionType.UPDATE_BOOK,
	payload: book,
});

export const deleteBook = (id: number): Action => ({
	type: ActionType.DELETE_BOOK,
	payload: id,
});

export const toggleIssueBook = (id: number): Action => ({
	type: ActionType.TOGGLE_ISSUE_BOOK,
	payload: id,
});

export const filterBooks = (searchText: string): Action => ({
	type: ActionType.FILTER_BOOKS,
	payload: searchText,
});

export const setEditingBook = (book: Book | null): Action => ({
	type: ActionType.SET_EDITING_BOOK,
	payload: book,
});
