'use client';
import React from 'react';

import LibraryProvider, { useLibrary } from './LibraryProvider';

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
		filteredBooks,
		searchText,
		name,
		setName,
		author,
		setAuthor,
		setSearchText,
		handleSubmit,
		handleIssueBook,
		handleDeleteBook,
		handleEditBook,
	} = useLibrary();

	const displayBooks = searchText.length > 0 ? filteredBooks : books;

	return (
		<div>
			<div className="flex align-tem-center">
				<div>
					<label htmlFor="name">Name</label>
					<input
						type="text"
						name="name"
						value={name}
						onChange={(e) => setName(e.target.value || '')}
					/>
				</div>
				<div>
					<label htmlFor="author">Author</label>
					<input
						type="text"
						name="author"
						value={author}
						onChange={(e) => setAuthor(e.target.value || '')}
					/>
				</div>
				<div>
					<Button className="bg-blue-300" onClick={handleSubmit}>
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
					onChange={(e) => setSearchText(e.target.value || '')}
				/>
			</div>
			<div>
				<ul>
					{displayBooks?.length > 0 ? (
						displayBooks.map(({ id, name, author, issued }) => {
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
