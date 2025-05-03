import React from 'react';

interface Props {
	children: React.ReactNode;
}

interface Book {
	id: number;
	name: string;
	author: string;
	issued: boolean;
}

interface InitialState {
	books: Book[];
	name: string;
	setName: (name: string) => void;
	author: string;
	setAuthor: (author: string) => void;
	searchText: string;
	setSearhText: (searchText: string) => void;
	editingBook: Book | null;
	handleSubmit: () => void;
	handleEditBook: (id: number) => void;
	handleDeleteBook: (id: number) => void;
	handleIssueBook: (id: number) => void;
	filterBooks: (text: string) => void;
}

const initialState: InitialState = {
	books: [],
	name: '',
	author: '',
	searchText: '',
	editingBook: null,
	setName: () => {},
	setAuthor: () => {},
	setSearhText: () => {},
	handleSubmit: () => {},
	handleEditBook: (id: number) => {},
	handleDeleteBook: (id: number) => {},
	handleIssueBook: (id: number) => {},
	filterBooks: (text: string) => {},
};

const libraryContext = React.createContext<InitialState>(initialState);

export function useLibrary() {
	const context = React.useContext(libraryContext);

	if (!context) {
		throw new Error('Please use inside LibraryProvider');
	}

	return context;
}

export default function LibraryProivder({ children }: Props) {
	const [searchText, setSearhText] = React.useState<string>('');
	const [name, setName] = React.useState<string>('');
	const [author, setAuthor] = React.useState<string>('');
	const [books, setBooks] = React.useState<Book[]>([]);
	const [filteredBooks, setFilteredBooks] = React.useState<Book[]>([]);
	const [editingBook, setEditingBook] = React.useState<Book | null>(null);

	const handleSubmit = () => {
		if (isDisabled) return;

		if (editingBook?.id) {
			const index = books.findIndex((book) => book.id === editingBook?.id);
			if (index < 0) return;
			const oldBook = books[index];
			
			setBooks((prevBooks) => {
				prevBooks[index] = { ...oldBook, name, author };
				return [...prevBooks];
			});
		} else {
			const newBook = {
				id: Date.now(),
				author,
				name,
				issued: false,
			};

			setBooks((prevBooks) => {
				return [...prevBooks, newBook]
			});
		}

		setName('');
		setAuthor('');
		setEditingBook(null);
	};

	const handleEditBook = (id: number) => {
		const index = books.findIndex((book) => book.id === id);
		if (index < 0) return;
		const currentBook = books[index];
		const { name, author } = currentBook;

		setEditingBook(currentBook);

		setName(name);
		setAuthor(author);
	};

	const handleDeleteBook = React.useCallback((id: number) => {
		setBooks((prevBooks) => {
			const index = prevBooks.findIndex((book) => book.id === id);
			if (index >= 0) prevBooks.splice(index, 1);
			return [...prevBooks];
		});
	}, []);

	const handleIssueBook = (id: number) => {
		const index = books.findIndex((book) => book.id === id);
		if (index < 0) return;
		
		
		setBooks((prevBooks) => {
			const oldBook = books[index];
			const issued = !oldBook.issued;
			prevBooks[index] = { ...oldBook, issued };
			return [...prevBooks];
		});
	};

	const filterBooks = (text: string) => {
		if (text.length === 0) {
			setFilteredBooks([...books]);
			return;
		}

		const lowerCasedText = text.toLowerCase();
		const newBooks = books.filter((book) => {
			return (
				book.name.toLowerCase().includes(lowerCasedText) ||
				book.author.toLowerCase().includes(lowerCasedText)
			);
		});
		setFilteredBooks(newBooks);
	};

	React.useEffect(() => {
		filterBooks(searchText);
	}, [books])

	const isDisabled = name?.length <= 0 || author?.length <= 0;

	const value = {
		name,
		setName,
		author,
		setAuthor,
		searchText,
		setSearhText,
		editingBook,
		books: filteredBooks,
		filterBooks,
		handleSubmit,
		handleEditBook,
		handleDeleteBook,
		handleIssueBook,
	};

	return <libraryContext.Provider value={value}>{children}</libraryContext.Provider>;
}
