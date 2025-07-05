import { LibraryState, Action, ActionType, Book } from '@/app/types/Library';

export function libraryReducer(state: LibraryState, action: Action): LibraryState {
	switch (action.type) {
		case ActionType.SET_LOADING:
			return {
				...state,
				isLoading: action.payload,
			};

		case ActionType.SET_ERROR:
			return {
				...state,
				error: action.payload,
				isLoading: false,
			};

		case ActionType.SET_BOOKS:
			return {
				...state,
				books: action.payload,
				isLoading: false,
				error: null,
			};

		case ActionType.SET_NAME:
			return {
				...state,
				title: action.payload,
			};

		case ActionType.SET_AUTHOR:
			return {
				...state,
				author: action.payload,
			};

		case ActionType.SET_SEARCH_TEXT:
			return {
				...state,
				searchText: action.payload,
			};

		case ActionType.SET_EDITING_BOOK:
			return {
				...state,
				editingBook: action.payload,
				title: action.payload?.title || '',
				author: action.payload?.author || '',
			};

		case ActionType.ADD_BOOK:
			return {
				...state,
				books: [action.payload, ...state.books],
				error: null,
			};

		case ActionType.UPDATE_BOOK:
			return {
				...state,
				books: state.books.map((book) =>
					book.id === action.payload.id ? action.payload : book,
				),
				error: null,
			};

		case ActionType.DELETE_BOOK:
			return {
				...state,
				books: state.books.filter((book) => book.id !== action.payload),
				error: null,
			};

		case ActionType.TOGGLE_ISSUE_BOOK:
			return {
				...state,
				books: state.books.map((book) =>
					book.id === action.payload.id ? action.payload : book,
				),
				error: null,
			};

		case ActionType.CLEAR_FORM:
			return {
				...state,
				title: '',
				author: '',
				editingBook: null,
			};

		default:
			return state;
	}
}

// Action creators
export const actions = {
	setLoading: (loading: boolean) => ({ type: ActionType.SET_LOADING, payload: loading }),
	setError: (error: string | null) => ({ type: ActionType.SET_ERROR, payload: error }),
	setBooks: (books: Book[]) => ({ type: ActionType.SET_BOOKS, payload: books }),
	setTitle: (title: string) => ({ type: ActionType.SET_NAME, payload: title }),
	setAuthor: (author: string) => ({ type: ActionType.SET_AUTHOR, payload: author }),
	setSearchText: (text: string) => ({ type: ActionType.SET_SEARCH_TEXT, payload: text }),
	setEditingBook: (book: Book | null) => ({
		type: ActionType.SET_EDITING_BOOK,
		payload: book,
	}),
	addBook: (book: Book) => ({ type: ActionType.ADD_BOOK, payload: book }),
	updateBook: (book: Book) => ({ type: ActionType.UPDATE_BOOK, payload: book }),
	deleteBook: (id: number) => ({ type: ActionType.DELETE_BOOK, payload: id }),
	toggleIssueBook: (book: Book) => ({ type: ActionType.TOGGLE_ISSUE_BOOK, payload: book }),
	clearForm: () => ({ type: ActionType.CLEAR_FORM }),
} as const;
