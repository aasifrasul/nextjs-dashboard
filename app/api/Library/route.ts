import { NextRequest, NextResponse } from 'next/server';
import { LibraryService, handleServiceError } from '@/app/lib/services/libraryService';
import { z } from 'zod';

// Validation schemas
const createBookSchema = z.object({
	title: z.string().min(1, 'Book name is required'),
	author: z.string().min(1, 'Author name is required'),
	issued: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const searchText = searchParams.get('search');

		const books = await handleServiceError(
			() => LibraryService.getBooks(searchText || undefined),
			'Failed to fetch books',
		);

		return NextResponse.json({
			success: true,
			data: books,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch books',
			},
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate input
		const validatedData = createBookSchema.parse(body);

		const book = await handleServiceError(
			() => LibraryService.createBook(validatedData),
			'Failed to create book',
		);

		return NextResponse.json(
			{
				success: true,
				data: book,
			},
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: 'Validation error',
					details: error.errors,
				},
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create book',
			},
			{ status: 500 },
		);
	}
}
