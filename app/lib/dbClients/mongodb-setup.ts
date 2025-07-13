import { getCollection } from './mongodb';
import { Task } from '../store/features/tasks/types';
import { User } from '../store/features/tasks/types';

/**
 * Initialize MongoDB collections and indexes
 * Run this once when setting up your database
 */
export async function initializeDatabase() {
	try {
		console.log('Getting database connection...');
		const tasksCollection = await getCollection<Task>('tasks');

		console.log('Creating indexes...');

		// Create indexes for better query performance
		await tasksCollection.createIndex({ status: 1 });
		await tasksCollection.createIndex({ priority: 1 });
		await tasksCollection.createIndex({ assigneeId: 1 });
		await tasksCollection.createIndex({ createdAt: -1 }); // For sorting by newest first
		await tasksCollection.createIndex({ updatedAt: -1 });

		// Compound index for common filter combinations
		await tasksCollection.createIndex({
			status: 1,
			priority: 1,
			assigneeId: 1,
		});

		// Text index for search functionality
		await tasksCollection.createIndex({
			title: 'text',
			description: 'text',
			tags: 'text',
		});

		console.log('Database indexes created successfully');
	} catch (error) {
		console.error('Error initializing database:', error);
		throw error;
	}
}

/**
 * Seed the database with initial data atsks (optional)
 */
export async function seedTasks() {
	try {
		console.log('Getting database connection for seeding...');
		const tasksCollection = await getCollection<Task>('tasks');

		// Check if tasksCollection is empty
		const count = await tasksCollection.countDocuments();
		if (count > 0) {
			console.log(`Database already contains ${count} tasks, skipping seed`);
			return;
		}

		console.log('Seeding database with sample data...');

		// Sample tasks for initial setup
		const sampleTasks: Task[] = [
			{
				title: 'Setup MongoDB Connection',
				description: 'Configure MongoDB connection for the task management system',
				status: 'completed',
				priority: 'high',
				assigneeId: 'user1',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				tags: ['backend', 'database'],
			},
			{
				title: 'Create Task API Routes',
				description: 'Implement CRUD operations for tasks',
				status: 'in_progress',
				priority: 'medium',
				assigneeId: 'user1',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				tags: ['api', 'backend'],
			},
			{
				title: 'Design Task UI Components',
				description: 'Create reusable components for task management',
				status: 'todo',
				priority: 'medium',
				assigneeId: 'user2',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				tags: ['frontend', 'ui'],
			},
			{
				title: 'Implement User Authentication',
				description: 'Add login and registration functionality',
				status: 'todo',
				priority: 'high',
				assigneeId: 'user3',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				tags: ['auth', 'security'],
			},
			{
				title: 'Add Task Filtering',
				description: 'Allow users to filter tasks by status and priority',
				status: 'todo',
				priority: 'low',
				assigneeId: 'user2',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				tags: ['frontend', 'features'],
			},
		];

		const result = await tasksCollection.insertMany(sampleTasks);
		console.log(`Database seeded with ${result.insertedCount} sample tasks`);
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}

/**
 * Seed the database with initial data atsks (optional)
 */
export async function seedUsers() {
	try {
		console.log('Getting database connection for seeding...');
		const usersCollection = await getCollection<User>('users');

		// Check if usersCollection is empty
		const count = await usersCollection.countDocuments();
		if (count > 0) {
			console.log(`Database already contains ${count} users, skipping seed`);
			return;
		}

		console.log('Seeding database with sample data...');

		// Sample users for initial setup
		const sampleUsers: User[] = [
			{
				name: 'John Doe',
				email: 'john@example.com',
				avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
				role: 'admin',
				createdAt: '2024-01-01T08:00:00Z',
				updatedAt: '2024-01-01T08:00:00Z',
			},
			{
				name: 'Jane Smith',
				email: 'jane@example.com',
				avatar: 'https://images.unsplash.com/photo-1494790108755-2616b602e9b1?w=32&h=32&fit=crop&crop=face',
				role: 'manager',
				createdAt: '2024-01-01T09:00:00Z',
				updatedAt: '2024-01-01T09:00:00Z',
			},
		];

		const result = await usersCollection.insertMany(sampleUsers);
		console.log(`Database seeded with ${result.insertedCount} sample users`);
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}
