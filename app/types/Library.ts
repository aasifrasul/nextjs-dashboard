export interface Book {
	id: number;
	title: string;
	author: string;
	issued: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateBookData {
	title: string;
	author: string;
	issued?: boolean;
}

export interface UpdateBookData {
	title?: string;
	author?: string;
	issued?: boolean;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	details?: any;
}

export interface LibraryState {
	books: Book[];
	isLoading: boolean;
	error: string | null;
	title: string;
	author: string;
	searchText: string;
	editingBook: Book | null;
}

export interface LibraryContext extends LibraryState {
	setTitle: (title: string) => void;
	setAuthor: (author: string) => void;
	setSearchText: (text: string) => void;
	handleSubmit: () => Promise<void>;
	handleEditBook: (book: Book) => void;
	handleDeleteBook: (id: number) => Promise<void>;
	handleIssueBook: (id: number) => Promise<void>;
	refreshBooks: () => Promise<void>;
}

export interface LibraryProviderProps {
	children: React.ReactNode;
}

export enum ActionType {
	SET_LOADING = 'SET_LOADING',
	SET_ERROR = 'SET_ERROR',
	SET_BOOKS = 'SET_BOOKS',
	SET_NAME = 'SET_NAME',
	SET_AUTHOR = 'SET_AUTHOR',
	SET_SEARCH_TEXT = 'SET_SEARCH_TEXT',
	SET_EDITING_BOOK = 'SET_EDITING_BOOK',
	ADD_BOOK = 'ADD_BOOK',
	UPDATE_BOOK = 'UPDATE_BOOK',
	DELETE_BOOK = 'DELETE_BOOK',
	TOGGLE_ISSUE_BOOK = 'TOGGLE_ISSUE_BOOK',
	CLEAR_FORM = 'CLEAR_FORM',
}

export type Action =
	| { type: ActionType.SET_LOADING; payload: boolean }
	| { type: ActionType.SET_ERROR; payload: string | null }
	| { type: ActionType.SET_BOOKS; payload: Book[] }
	| { type: ActionType.SET_NAME; payload: string }
	| { type: ActionType.SET_AUTHOR; payload: string }
	| { type: ActionType.SET_SEARCH_TEXT; payload: string }
	| { type: ActionType.SET_EDITING_BOOK; payload: Book | null }
	| { type: ActionType.ADD_BOOK; payload: Book }
	| { type: ActionType.UPDATE_BOOK; payload: Book }
	| { type: ActionType.DELETE_BOOK; payload: number }
	| { type: ActionType.TOGGLE_ISSUE_BOOK; payload: Book }
	| { type: ActionType.CLEAR_FORM };
