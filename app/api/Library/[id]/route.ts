import { NextRequest, NextResponse } from 'next/server';
import { LibraryService, handleServiceError } from '@/app/lib/services/LibraryService';
import { z } from 'zod';

const updateBookSchema = z.object({
	title: z.string().min(1).optional(),
	author: z.string().min(1).optional(),
	issued: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { id } = await params;

		if (!id) {
			return NextResponse.json(
				{ success: false, error: 'Invalid book ID' },
				{ status: 400 },
			);
		}

		const book = await handleServiceError(
			() => LibraryService.getBook(id),
			'Failed to fetch book',
		);

		if (!book) {
			return NextResponse.json(
				{ success: false, error: 'Book not found' },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			data: book,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch book',
			},
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { id } = await params;

		if (!id) {
			return NextResponse.json(
				{ success: false, error: 'Invalid book ID' },
				{ status: 400 },
			);
		}

		const body = await request.json();
		const validatedData = updateBookSchema.parse(body);

		const book = await handleServiceError(
			() => LibraryService.updateBook(id, validatedData),
			'Failed to update book',
		);

		return NextResponse.json({
			success: true,
			data: book,
		});
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
				error: error instanceof Error ? error.message : 'Failed to update book',
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { id } = await params;

		if (!id) {
			return NextResponse.json(
				{ success: false, error: 'Invalid book ID' },
				{ status: 400 },
			);
		}

		await handleServiceError(() => LibraryService.deleteBook(id), 'Failed to delete book');

		return NextResponse.json({
			success: true,
			message: 'Book deleted successfully',
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete book',
			},
			{ status: 500 },
		);
	}
}
