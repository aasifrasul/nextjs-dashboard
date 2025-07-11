// app/api/tasks/stats/route.ts
import { NextResponse } from 'next/server';
import { tasks } from '@/app/api/tasks/mockData'; // Adjust the path to your mockData

export async function GET() {
	const stats = {
		total: tasks.length,
		completed: tasks.filter((t) => t.status === 'completed').length,
		pending: tasks.filter((t) => t.status === 'todo').length,
		inProgress: tasks.filter((t) => t.status === 'in_progress').length,
	};

	return NextResponse.json(
		{
			data: stats,
			status: 'success',
		},
		{ status: 200 },
	); // Set the status code directly in the NextResponse.json options
}
