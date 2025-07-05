import { useCallback } from 'react';
import { Book, CreateBookData, UpdateBookData, ApiResponse } from '@/app/types/Library';

const API_BASE_URL = '/api/Library';
const headers = {
	'Content-Type': 'application/json',
};

class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public details?: any,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new ApiError(
			errorData.error || `HTTP error! status: ${response.status}`,
			response.status,
			errorData.details,
		);
	}

	const data: ApiResponse<T> = await response.json();

	if (!data.success) {
		throw new ApiError(data.error || 'API request failed', response.status, data.details);
	}

	return data.data as T;
}

export class LibraryApiClient {
	static async getBooks(searchText?: string): Promise<Book[]> {
		const url = searchText
			? `${API_BASE_URL}?search=${encodeURIComponent(searchText)}`
			: API_BASE_URL;

		const response = await fetch(url, {
			method: 'GET',
			headers,
		});

		return handleResponse<Book[]>(response);
	}

	static async getBook(id: number): Promise<Book> {
		const response = await fetch(`${API_BASE_URL}/${id}`, {
			method: 'GET',
			headers,
		});

		return handleResponse<Book>(response);
	}

	static async createBook(data: CreateBookData): Promise<Book> {
		const response = await fetch(API_BASE_URL, {
			method: 'POST',
			headers,
			body: JSON.stringify(data),
		});

		return handleResponse<Book>(response);
	}

	static async updateBook(id: number, data: UpdateBookData): Promise<Book> {
		const response = await fetch(`${API_BASE_URL}/${id}`, {
			method: 'PUT',
			headers,
			body: JSON.stringify(data),
		});

		return handleResponse<Book>(response);
	}

	static async deleteBook(id: number): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/${id}`, {
			method: 'DELETE',
			headers,
		});

		await handleResponse<void>(response);
	}

	static async toggleIssueStatus(id: number): Promise<Book> {
		const response = await fetch(`${API_BASE_URL}/${id}/toggle-issue`, {
			method: 'PATCH',
			headers,
		});

		return handleResponse<Book>(response);
	}
}

// Custom hook for handling API errors
export function useApiError() {
	const handleError = useCallback((error: unknown): string => {
		if (error instanceof ApiError) {
			return error.message;
		}

		if (error instanceof Error) {
			return error.message;
		}

		return 'An unexpected error occurred';
	}, []);

	return { handleError };
}
