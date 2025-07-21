import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useLibraryUIStore } from './LibraryUIStore';
import { useDebounced } from '@/app/hooks';
import { LibraryApiClient, useApiError } from '@/app/api/Library/LibraryClient';
import { Book } from '@/app/types/Library';

const QUERY_KEYS = {
	books: (search?: string) => ['books', search].filter(Boolean),
} as const;

// Hook for fetching books with search
export function useBooks() {
	const { searchText } = useLibraryUIStore();
	const debouncedSearchText = useDebounced(searchText, 300);

	return useQuery({
		queryKey: QUERY_KEYS.books(debouncedSearchText || undefined),
		queryFn: () => LibraryApiClient.getBooks(debouncedSearchText || undefined),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Hook for creating a book
export function useCreateBook() {
	const queryClient = useQueryClient();
	const { handleError } = useApiError();
	const { clearForm } = useLibraryUIStore();

	return useMutation({
		mutationFn: (bookData: { title: string; author: string; issued: boolean }) =>
			LibraryApiClient.createBook(bookData),
		onSuccess: () => {
			// Invalidate and refetch books queries
			queryClient.invalidateQueries({ queryKey: ['books'] });
			clearForm();
		},
		onError: (error) => {
			handleError(error);
		},
	});
}

// Hook for updating a book
export function useUpdateBook() {
	const queryClient = useQueryClient();
	const { handleError } = useApiError();
	const { clearForm } = useLibraryUIStore();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: { title: string; author: string } }) =>
			LibraryApiClient.updateBook(id, data),
		onSuccess: (updatedBook) => {
			// Update the book in all relevant queries
			queryClient.setQueriesData(
				{ queryKey: ['books'] },
				(oldData: Book[] | undefined) => {
					if (!oldData) return oldData;
					return oldData.map((book) =>
						book.id === updatedBook.id ? updatedBook : book,
					);
				},
			);
			clearForm();
		},
		onError: (error) => {
			handleError(error);
		},
	});
}

// Hook for deleting a book
export function useDeleteBook() {
	const queryClient = useQueryClient();
	const { handleError } = useApiError();

	return useMutation({
		mutationFn: (id: number) => LibraryApiClient.deleteBook(id),
		onSuccess: (_, deletedId) => {
			// Remove the book from all relevant queries
			queryClient.setQueriesData(
				{ queryKey: ['books'] },
				(oldData: Book[] | undefined) => {
					if (!oldData) return oldData;
					return oldData.filter((book) => book.id !== deletedId);
				},
			);
		},
		onError: (error) => {
			handleError(error);
		},
	});
}

// Hook for toggling issue status
export function useToggleIssueBook() {
	const queryClient = useQueryClient();
	const { handleError } = useApiError();

	return useMutation({
		mutationFn: (id: number) => LibraryApiClient.toggleIssueStatus(id),
		onSuccess: (updatedBook) => {
			// Update the book in all relevant queries
			queryClient.setQueriesData(
				{ queryKey: ['books'] },
				(oldData: Book[] | undefined) => {
					if (!oldData) return oldData;
					return oldData.map((book) =>
						book.id === updatedBook.id ? updatedBook : book,
					);
				},
			);
		},
		onError: (error) => {
			handleError(error);
		},
	});
}
