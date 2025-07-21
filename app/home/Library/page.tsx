'use client';
import { QueryProvider } from '@/app/context/QueryProvider';
import { LibraryForm } from './LibraryForm';
import { BookList } from './BookList';
import { SearchBar } from './SearchBar';
import { LibraryStats } from './LibraryStats';

export default function LibraryPage() {
	return (
		<QueryProvider>
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-3xl font-bold text-gray-900 mb-8">
						Library Management
					</h1>

					{/* Statistics */}
					<LibraryStats />

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Left Column - Form */}
						<div>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Add New Book
							</h2>
							<LibraryForm />
						</div>

						{/* Right Column - Search and List */}
						<div>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Book Collection
							</h2>
							<SearchBar />
							<BookList />
						</div>
					</div>
				</div>
			</div>
		</QueryProvider>
	);
}
