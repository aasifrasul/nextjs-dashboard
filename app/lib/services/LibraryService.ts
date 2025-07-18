import { PrismaClient, Prisma, book_store } from '@/generated/prisma';

const prisma = new PrismaClient();

export interface CreateBookData {
	title: string;
	author: string;
	issued?: boolean;
}

export interface UpdateBookData {
	title?: string;
	author?: string;
	issued?: boolean;
}

export class LibraryService {
	// Get all books with optional filtering
	static async getBooks(searchText?: string): Promise<book_store[]> {
		const where: Prisma.book_storeWhereInput = searchText
			? {
					OR: [
						{ title: { contains: searchText, mode: 'insensitive' } },
						{ author: { contains: searchText, mode: 'insensitive' } },
					],
				}
			: {};

		return await prisma.book_store.findMany({
			where,
		});
	}

	// Get a single book_store by ID
	static async getBook(id: string): Promise<book_store | null> {
		return await prisma.book_store.findUnique({
			where: { id },
		});
	}

	// Create a new book_store
	static async createBook(data: CreateBookData): Promise<book_store> {
		return await prisma.book_store.create({
			data,
		});
	}

	// Update an existing book_store
	static async updateBook(id: string, data: UpdateBookData): Promise<book_store> {
		return await prisma.book_store.update({
			where: { id },
			data,
		});
	}

	// Delete a book_store
	static async deleteBook(id: string): Promise<book_store> {
		return await prisma.book_store.delete({
			where: { id },
		});
	}

	/**
	 * Toggles the book_store issue status using a single raw SQL update query.
	 * This method directly flips the boolean value in the database.
	 *
	 * @param id The ID of the book_store to toggle.
	 * @returns A Promise resolving to the updated book_store object.
	 * Note: To return the full updated object, a subsequent findUnique
	 * query is still needed after the raw update, as $executeRaw
	 * only returns the number of affected rows.
	 * If you only need confirmation of the update, you can return
	 * the affected row count or a boolean.
	 */
	static async toggleIssueStatus(id: string): Promise<book_store> {
		try {
			// Use $executeRaw to perform a direct SQL update that toggles the 'issued' status.
			// 'NOT "issued"' is a common SQL syntax for toggling a boolean field.
			// Ensure your database supports this syntax (e.g., PostgreSQL, MySQL).
			const affectedRows = await prisma.$executeRaw`
                UPDATE "book_store"
                SET "issued" = NOT "issued"
                WHERE "id" = ${id}::uuid
                RETURNING *;
            `;

			if (affectedRows === 0) {
				throw new Error('book_store not found or no change occurred');
			}

			// To fulfill the original function signature (returning the updated book_store object),
			// we still need to fetch the record after the raw update.
			// If you don't strictly need the full object returned by this function,
			// you could simplify the return type (e.g., Promise<boolean> or Promise<number>).
			const updatedBookStore = await prisma.book_store.findUnique({
				where: { id },
			});

			if (!updatedBookStore) {
				// This case should ideally not happen if affectedRows > 0,
				// but it's good for robustness.
				throw new Error('Failed to retrieve updated book_store');
			}

			return updatedBookStore;
		} catch (error) {
			console.error('Error toggling book_store status:', error);
			throw error; // Re-throw the error for upstream handling
		}
	}

	// Get books by author
	static async getBooksByAuthor(author: string): Promise<book_store[]> {
		return await prisma.book_store.findMany({
			where: {
				author: { contains: author, mode: 'insensitive' },
			},
			orderBy: { title: 'asc' },
		});
	}

	// Get issued books
	static async getIssuedBooks(): Promise<book_store[]> {
		return await prisma.book_store.findMany({
			where: { issued: true },
		});
	}

	// Get available books
	static async getAvailableBooks(): Promise<book_store[]> {
		return await prisma.book_store.findMany({
			where: { issued: false },
			orderBy: { title: 'asc' },
		});
	}

	// Bulk operations
	static async createMultipleBooks(books: CreateBookData[]): Promise<Prisma.BatchPayload> {
		return await prisma.book_store.createMany({
			data: books,
		});
	}

	// Get book_store statistics
	static async getBookStats() {
		const [total, issued, available] = await Promise.all([
			prisma.book_store.count(),
			prisma.book_store.count({ where: { issued: true } }),
			prisma.book_store.count({ where: { issued: false } }),
		]);

		return {
			total,
			issued,
			available,
		};
	}
}

// Error handling wrapper
export async function handleServiceError<T>(
	operation: () => Promise<T>,
	errorMessage: string,
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		console.error(`${errorMessage}:`, error);
		throw new Error(
			`${errorMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
	}
}
