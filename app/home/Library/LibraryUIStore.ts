import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { Book } from './types';

interface LibraryUIState {
	title: string;
	author: string;
	searchText: string;
	editingBook: Book | null;
	setTitle: (title: string) => void;
	setAuthor: (author: string) => void;
	setSearchText: (text: string) => void;
	setEditingBook: (book: Book | null) => void;
	clearForm: () => void;
}

export const useLibraryUIStore = create<LibraryUIState>()(
	immer((set) => ({
		title: '',
		author: '',
		searchText: '',
		editingBook: null,
		setTitle: (title) => set({ title }),
		setAuthor: (author) => set({ author }),
		setSearchText: (searchText) => set({ searchText }),
		setEditingBook: (editingBook) => set({ editingBook }),
		clearForm: () => set({ title: '', author: '', editingBook: null }),
	})),
);
