import { NextResponse } from 'next/server';
import { tasks } from '@/app/api/tasks/mockData';
import { Task } from '@/app/lib/store/features/tasks/types';

// Helper function to find a task by ID
function findTask(id: string) {
	return tasks.find((t) => t.id === id);
}

// Helper function to find a task index by ID
function findTaskIndex(id: string) {
	return tasks.findIndex((t) => t.id === id);
}

/**
 * Handles GET requests for a single task.
 * @param request The Next.js Request object.
 * @param { params: { id: string } } The parameters object containing the task ID.
 * @returns A NextResponse object with the task data or an error message.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
	const { id } = params;
	const task = findTask(id);

	if (!task) {
		return NextResponse.json(
			{
				status: 'error',
				message: 'Task not found',
			},
			{ status: 404 },
		);
	}

	return NextResponse.json({
		data: task,
		status: 'success',
	});
}

/**
 * Handles PATCH requests to update a single task.
 * @param request The Next.js Request object containing the update data in the body.
 * @param { params: { id: string } } The parameters object containing the task ID.
 * @returns A NextResponse object with the updated task data or an error message.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
	const { id } = params;
	const taskIndex = findTaskIndex(id);

	if (taskIndex === -1) {
		return NextResponse.json(
			{
				status: 'error',
				message: 'Task not found',
			},
			{ status: 404 },
		);
	}

	const body = await request.json();

	const updatedTask: Task = {
		...tasks[taskIndex],
		...body,
		updatedAt: new Date().toISOString(),
	};

	tasks[taskIndex] = updatedTask;

	// Simulate network delay if necessary (typically removed in production)
	await new Promise((resolve) => setTimeout(resolve, 150));

	return NextResponse.json({
		data: updatedTask,
		status: 'success',
		message: 'Task updated successfully',
	});
}

/**
 * Handles DELETE requests to delete a single task.
 * @param request The Next.js Request object.
 * @param { params: { id: string } } The parameters object containing the task ID.
 * @returns A NextResponse object indicating success or an error message.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
	const { id } = params;
	const taskIndex = findTaskIndex(id);

	if (taskIndex === -1) {
		return NextResponse.json(
			{
				status: 'error',
				message: 'Task not found',
			},
			{ status: 404 },
		);
	}

	tasks.splice(taskIndex, 1);

	return NextResponse.json({
		status: 'success',
		message: 'Task deleted successfully',
	});
}
