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

interface LibraryContextType {
	books: Book[];
	name: string;
	setName: (name: string) => void;
	author: string;
	setAuthor: (author: string) => void;
	searchText: string;
	setSearhText: (searchText: string) => void;
	editingBook: Book;
	handleSubmit: () => void;
	handleEditBook: (id: number) => void;
	handleDeleteBook: (id: number) => void;
	handleIssueBook: (id: number) => void;
	filterBooks: (text: string) => void;
}

const LibraryContext = React.createContext<LibraryContextType>({
	books: [],
	name: '',
	author: '',
	searchText: '',
	editingBook: {},
	setName: () => {},
	setAuthor: () => {},
	setSearhText: () => {},
	handleSubmit: () => {},
	handleEditBook: (id) => {},
	handleDeleteBook: (id) => {},
	handleIssueBook: (id) => {},
	filterBooks: (text) => {},
});

export function useLibrary() {
	const context = React.useContext(LibraryContext);

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
			setFilteredBooks((prevBooks) => {
				prevBooks.splice(index, 1);
				return [...prevBooks, { ...oldBook, name, author }];
			});
			setBooks((prevBooks) => {
				prevBooks.splice(index, 1);
				return [...prevBooks, { ...oldBook, name, author }];
			});
		} else {
			const newBook = {
				id: Date.now(),
				author,
				name,
				issued: false,
			};

			setBooks((prevBooks) => [...prevBooks, newBook]);
			setFilteredBooks((prevBooks) => [...prevBooks, newBook]);
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

	const handleDeleteBook = (id: number) => {
		const index = books.findIndex((book) => book.id === id);
		if (index < 0) return;
		setFilteredBooks((prevBooks) => {
			prevBooks.splice(index, 1);
			return [...prevBooks];
		});
		setBooks((prevBooks) => {
			prevBooks.splice(index, 1);
			return [...prevBooks];
		});
	};

	const handleIssueBook = (id: number) => {
		const index = books.findIndex((book) => book.id === id);
		if (index < 0) return;
		const oldBook = books[index];
		const issued = !oldBook.issued;
		setFilteredBooks((prevBooks) => {
			prevBooks.splice(index, 1);
			return [...prevBooks, { ...oldBook, issued }];
		});
		setBooks((prevBooks) => {
			prevBooks.splice(index, 1);
			return [...prevBooks, { ...oldBook, issued }];
		});
	};

	const filterBooks = (text: string) => {
		if (text.length === 0) {
			setFilteredBooks([...books]);
			return;
		}

		setFilteredBooks((prevBooks) => {
			const currentBooks = prevBooks.filter((book) => {
				return (
					book.name.toLowerCase().includes(text) ||
					book.author.toLowerCase().includes(text)
				);
			});
			return [...currentBooks];
		});
	};

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

	const { Provider } = LibraryContext;

	return <Provider value={value}>{children}</Provider>;
}
