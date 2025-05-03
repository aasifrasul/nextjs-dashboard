import React from 'react';

export interface LibraryProivderProps {
	children: React.ReactNode;
}

export interface Book {
	id: number;
	name: string;
	author: string;
	issued: boolean;
}

export enum ActionType {
	SET_NAME = 'SET_NAME',
	SET_AUTHOR = 'SET_AUTHOR',
	SET_SEARCH_TEXT = 'SET_SEARCH_TEXT',
	ADD_BOOK = 'ADD_BOOK',
	UPDATE_BOOK = 'UPDATE_BOOK',
	DELETE_BOOK = 'DELETE_BOOK',
	TOGGLE_ISSUE_BOOK = 'TOGGLE_ISSUE_BOOK',
	FILTER_BOOKS = 'FILTER_BOOKS',
	SET_EDITING_BOOK = 'SET_EDITING_BOOK',
}

// Define more specific action types with correct payload types
export type Action =
	| { type: ActionType.SET_NAME; payload: string }
	| { type: ActionType.SET_AUTHOR; payload: string }
	| { type: ActionType.SET_SEARCH_TEXT; payload: string }
	| { type: ActionType.ADD_BOOK; payload: Book }
	| { type: ActionType.UPDATE_BOOK; payload: Book }
	| { type: ActionType.DELETE_BOOK; payload: number }
	| { type: ActionType.TOGGLE_ISSUE_BOOK; payload: number }
	| { type: ActionType.FILTER_BOOKS; payload: string }
	| { type: ActionType.SET_EDITING_BOOK; payload: Book | null };

export interface InitialState {
	books: Book[];
	filteredBooks: Book[]; // Changed from optional to required, with empty array as default
	name: string;
	author: string;
	searchText: string;
	editingBook: Book | null;
}

export interface LibraryContext extends InitialState {
	handleSubmit: () => void;
	setName: (name: string) => void;
	setAuthor: (author: string) => void;
	setSearchText: (searchText: string) => void;
	handleEditBook: (id: number) => void;
	handleDeleteBook: (id: number) => void;
	handleIssueBook: (id: number) => void;
}
