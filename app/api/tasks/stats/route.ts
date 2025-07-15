import { NextResponse } from 'next/server';
import { getCollection } from '@/app/lib/dbClients/mongodb';
import { Task } from '@/app/lib/store/features/tasks/types';

export async function GET() {
	const collection = await getCollection<Task>('tasks');
	const tasks: Task[] = await collection.find({}).toArray();

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
