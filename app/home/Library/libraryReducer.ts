import { ActionType, InitialState, Action, Book } from './types';

export function libraryReducer(state: InitialState, action: Action): InitialState {
	const { type, payload } = action;

	switch (type) {
		case ActionType.SET_NAME:
			// For string-specific actions, we can use proper typed actions
			return { ...state, name: payload };

		case ActionType.SET_AUTHOR:
			return { ...state, author: payload };

		case ActionType.SET_SEARCH_TEXT:
			return { ...state, searchText: payload };

		case ActionType.ADD_BOOK:
			// Here we know payload must be a Book
			if (!isBook(payload)) {
				console.error('Invalid payload for ADD_BOOK action', payload);
				return state;
			}

			return { ...state, books: [...state.books, payload] };

		case ActionType.SET_EDITING_BOOK:
			return {
				...state,
				editingBook: action.payload,
				name: action.payload ? action.payload.name : '',
				author: action.payload ? action.payload.author : '',
			};

		case ActionType.UPDATE_BOOK:
			// Check if payload is a valid Book
			if (!isBook(payload)) {
				console.error('Invalid payload for UPDATE_BOOK action', payload);
				return state;
			}

			const updatedBooks = state.books.map((book) =>
				book.id === payload.id ? payload : book,
			);

			return { ...state, books: updatedBooks };

		case ActionType.DELETE_BOOK:
			// When deleting, payload should be an ID (number)
			if (typeof payload !== 'number') {
				console.error('Invalid payload for DELETE_BOOK action', payload);
				return state;
			}

			return {
				...state,
				books: state.books.filter((book) => book.id !== payload),
			};

		case ActionType.TOGGLE_ISSUE_BOOK:
			// When toggling issue status, payload should be an ID (number)
			if (typeof payload !== 'number') {
				console.error('Invalid payload for TOGGLE_ISSUE_BOOK action', payload);
				return state;
			}

			return {
				...state,
				books: state.books.map((book) =>
					book.id === payload ? { ...book, issued: !book.issued } : book,
				),
			};

		default:
			return state;
	}
}

// Type guard to check if payload is a Book
function isBook(payload: any): payload is Book {
	return (
		payload !== null &&
		typeof payload === 'object' &&
		typeof payload.id === 'number' &&
		typeof payload.name === 'string' &&
		typeof payload.author === 'string' &&
		typeof payload.issued === 'boolean'
	);
}
