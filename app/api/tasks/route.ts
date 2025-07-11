import { NextRequest, NextResponse } from 'next/server';
import { Task, TaskFilters } from '@/app/lib/store/features/tasks/types';
import { tasks } from './mockData';

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const filters: TaskFilters = {
		status: searchParams.get('status') || undefined,
		priority: searchParams.get('priority') || undefined,
		assigneeId: searchParams.get('assigneeId') || undefined,
	};

	let filteredTasks = [...tasks];

	// Apply filters
	if (filters.status) {
		filteredTasks = filteredTasks.filter((task) => task.status === filters.status);
	}

	if (filters.priority) {
		filteredTasks = filteredTasks.filter((task) => task.priority === filters.priority);
	}

	if (filters.assigneeId) {
		filteredTasks = filteredTasks.filter((task) => task.assigneeId === filters.assigneeId);
	}

	// Simulate network delay
	await delay(100);

	return NextResponse.json({
		data: filteredTasks,
		status: 'success',
	});
}

export async function POST(req: NextRequest) {
	const taskData = await req.json();

	const newTask: Task = {
		id: `task-${Date.now()}`,
		...taskData,
		status: taskData.status || 'todo',
		priority: taskData.priority || 'medium',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	tasks.unshift(newTask);

	// Simulate network delay
	await delay(200);

	return NextResponse.json(
		{
			data: newTask,
			status: 'success',
			message: 'Task created successfully',
		},
		{ status: 201 },
	);
}
