'use client';
import React from 'react';

import LibraryProvider, { useLibrary } from '@/app/stores/LibraryProvider';

import { Button } from '@/app/ui/button';

interface Book {
	id: number;
	name: string;
	author: string;
	issued: boolean;
}

function LibraryContainer() {
	const {
		books,
		searchText,
		editingBook,
		setSearhText,
		name,
		setName,
		author,
		setAuthor,
		filterBooks,
		handleSubmit,
		handleIssueBook,
		handleDeleteBook,
		handleEditBook,
	} = useLibrary();

	const handleNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const text = e.target.value || '';
		setName(text);
	}, []);

	const handleAuthorChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const text = e.target.value || '';
		setAuthor(text);
	}, []);

	const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const text = e.target.value || '';

		setSearhText(text);
		filterBooks(text.toLowerCase());
	};

	return (
		<div>
			<div className="flex align-tem-center">
				<div>
					<label htmlFor="name">Name</label>
					<input type="text" name="name" value={name} onChange={handleNameChange} />
				</div>
				<div>
					<label htmlFor="author">Author</label>
					<input
						type="text"
						name="author"
						value={author}
						onChange={handleAuthorChange}
					/>
				</div>
				<div>
					<Button
						className="bg-blue-300"
						onClick={handleSubmit}
					>
						Submit
					</Button>
				</div>
			</div>
			<div>{'----------------------------------------------------------------'}</div>
			<div>{'----------------------------------------------------------------'}</div>
			<div>
				<label htmlFor="searchText">Search Book</label>
				<input
					type="text"
					name="searchText"
					value={searchText}
					onChange={handleSearchTextChange}
				/>
			</div>
			<div>
				<ul>
					{books?.length > 0 ? (
						books.map(({ id, name, author, issued }) => {
							return (
								<li key={id}>
									{name} {author} {issued ? 'UnAvailable' : 'Available'}
									<Button onClick={() => handleIssueBook(id)}>
										{issued ? 'Return' : 'Issue'}
									</Button>
									<Button onClick={() => handleEditBook(id)}>Edit</Button>
									<Button onClick={() => handleDeleteBook(id)}>
										Delete
									</Button>
								</li>
							);
						})
					) : (
						<li>No records found</li>
					)}
				</ul>
			</div>
		</div>
	);
}

export default function Library() {
	return (
		<LibraryProvider>
			<LibraryContainer />
		</LibraryProvider>
	);
}
