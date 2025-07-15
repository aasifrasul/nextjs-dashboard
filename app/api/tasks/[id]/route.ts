import { NextResponse } from 'next/server';
import { Task } from '@/app/lib/store/features/tasks/types';
import { getCollection } from '@/app/lib/dbClients/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Handles GET requests for a single task.
 * @param request The Next.js Request object.
 * @param { params: { id: string } } The parameters object containing the task ID.
 * @returns A NextResponse object with the task data or an error message.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params;

		// Validate ObjectId format
		if (!ObjectId.isValid(id)) {
			return NextResponse.json(
				{
					status: 'error',
					message: 'Invalid task ID format',
				},
				{ status: 400 },
			);
		}

		const collection = await getCollection<Task>('tasks');
		const task = await collection.findOne({ _id: new ObjectId(id) });

		if (!task) {
			return NextResponse.json(
				{
					status: 'error',
					message: 'Task not found',
				},
				{ status: 404 },
			);
		}

		// Convert MongoDB document to Task format
		const responseTask: Task = {
			...task,
			id: task._id.toString(),
		};

		return NextResponse.json({
			data: responseTask,
			status: 'success',
		});
	} catch (error) {
		console.error('Error fetching task:', error);
		return NextResponse.json(
			{
				status: 'error',
				message: 'Failed to fetch task',
			},
			{ status: 500 },
		);
	}
}

/**
 * Handles PATCH requests to update a single task.
 * @param request The Next.js Request object containing the update data in the body.
 * @param { params: { id: string } } The parameters object containing the task ID.
 * @returns A NextResponse object with the updated task data or an error message.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params;

		// Validate ObjectId format
		if (!ObjectId.isValid(id)) {
			return NextResponse.json(
				{
					status: 'error',
					message: 'Invalid task ID format',
				},
				{ status: 400 },
			);
		}

		const body = await request.json();
		const updateData = {
			...body,
			updatedAt: new Date().toISOString(),
		};

		const collection = await getCollection<Task>('tasks');
		const result = await collection.findOneAndUpdate(
			{ _id: new ObjectId(id) },
			{ $set: updateData },
			{ returnDocument: 'after' },
		);

		if (!result?._id) {
			return NextResponse.json(
				{
					status: 'error',
					message: 'Task not found',
				},
				{ status: 404 },
			);
		}

		// Convert MongoDB document to Task format
		const updatedTask: Task = {
			...result,
			id: result._id.toString(),
		};

		return NextResponse.json({
			data: updatedTask,
			status: 'success',
			message: 'Task updated successfully',
		});
	} catch (error) {
		console.error('Error updating task:', error);
		return NextResponse.json(
			{
				status: 'error',
				message: 'Failed to update task',
			},
			{ status: 500 },
		);
	}
}

/**
 * Handles DELETE requests to delete a single task.
 * @param request The Next.js Request object.
 * @param { params: { id: string } } The parameters object containing the task ID.
 * @returns A NextResponse object indicating success or an error message.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params;

		// Validate ObjectId format
		if (!ObjectId.isValid(id)) {
			return NextResponse.json(
				{
					status: 'error',
					message: 'Invalid task ID format',
				},
				{ status: 400 },
			);
		}

		const collection = await getCollection<Task>('tasks');
		const result = await collection.deleteOne({ _id: new ObjectId(id) });

		if (result.deletedCount === 0) {
			return NextResponse.json(
				{
					status: 'error',
					message: 'Task not found',
				},
				{ status: 404 },
			);
		}

		return NextResponse.json({
			status: 'success',
			message: 'Task deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting task:', error);
		return NextResponse.json(
			{
				status: 'error',
				message: 'Failed to delete task',
			},
			{ status: 500 },
		);
	}
}
