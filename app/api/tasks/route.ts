import { NextRequest, NextResponse } from 'next/server';
import { Task, TaskFilters } from '@/app/lib/store/features/tasks/types';
import { getCollection } from '@/app/lib/dbClients/mongodb';

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const filters: TaskFilters = {
			status: (searchParams.get('status') as Task['status']) || undefined,
			priority: (searchParams.get('priority') as Task['priority']) || undefined,
			assigneeId: searchParams.get('assigneeId') || undefined,
		};

		const collection = await getCollection<Task>('tasks');

		// Build MongoDB query
		const query: any = {};
		if (filters.status) {
			query.status = filters.status;
		}
		if (filters.priority) {
			query.priority = filters.priority;
		}
		if (filters.assigneeId) {
			query.assigneeId = filters.assigneeId;
		}

		// Fetch filtered tasks from MongoDB
		const results = await collection
			.find(query)
			.sort({ createdAt: -1 }) // Sort by newest first
			.toArray();
		const tasks = results.map((doc) => ({
			id: doc._id,
			...doc,
			_id: undefined,
		}));

		return NextResponse.json({
			data: tasks,
			status: 'success',
		});
	} catch (error) {
		console.error('Error fetching tasks:', error);
		return NextResponse.json(
			{
				status: 'error',
				message: 'Failed to fetch tasks',
			},
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const taskData = await req.json();

		const newTask: Omit<Task, 'id'> = {
			...taskData,
			status: taskData.status || 'todo',
			priority: taskData.priority || 'medium',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const collection = await getCollection<Task>('tasks');

		// Insert the new task
		const result = await collection.insertOne(newTask as any);

		// Get the inserted task with MongoDB ObjectId
		const insertedTask = await collection.findOne({ _id: result.insertedId });

		if (!insertedTask) {
			throw new Error('Failed to retrieve inserted task');
		}

		// Convert MongoDB document to Task format
		const responseTask: Task = {
			...insertedTask,
			id: insertedTask._id.toString(),
		};

		return NextResponse.json(
			{
				data: responseTask,
				status: 'success',
				message: 'Task created successfully',
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error('Error creating task:', error);
		return NextResponse.json(
			{
				status: 'error',
				message: 'Failed to create task',
			},
			{ status: 500 },
		);
	}
}
