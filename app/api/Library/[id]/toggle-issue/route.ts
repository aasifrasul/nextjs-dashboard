import { NextRequest, NextResponse } from 'next/server';
import { LibraryService, handleServiceError } from '@/app/lib/services/LibraryService';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { id } = await params;

		if (!id) {
			return NextResponse.json(
				{ success: false, error: 'Invalid book ID' },
				{ status: 400 },
			);
		}

		const book = await handleServiceError(
			() => LibraryService.toggleIssueStatus(id),
			'Failed to toggle book issue status',
		);

		return NextResponse.json({
			success: true,
			data: book,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to toggle book issue status',
			},
			{ status: 500 },
		);
	}
}
