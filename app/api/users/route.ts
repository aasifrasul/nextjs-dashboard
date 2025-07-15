import { NextResponse } from 'next/server';
import { User } from '@/app/lib/store/features/tasks/types';
import { getCollection } from '@/app/lib/dbClients/mongodb';

let users: User[] = [
	{
		id: 'user-1',
		name: 'John Doe',
		email: 'john@example.com',
		avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
		role: 'admin',
		createdAt: '2024-01-01T08:00:00Z',
		updatedAt: '2024-01-01T08:00:00Z',
	},
	{
		id: 'user-2',
		name: 'Jane Smith',
		email: 'jane@example.com',
		avatar: 'https://images.unsplash.com/photo-1494790108755-2616b602e9b1?w=32&h=32&fit=crop&crop=face',
		role: 'manager',
		createdAt: '2024-01-01T09:00:00Z',
		updatedAt: '2024-01-01T09:00:00Z',
	},
];

export async function GET() {
	const usersCollection = await getCollection<User>('users');
	const results: User[] = await usersCollection.find().toArray();
	console.log(`users`, results);
	const users = results.map((doc) => ({
		id: doc._id,
		...doc,
		_id: undefined,
	}));
	return NextResponse.json({
		data: users,
		status: 'success',
	});
}

export async function POST(request: Request) {
	const body = await request.json();
	const newUser: User = {
		id: `user-${Date.now()}`,
		...body,
		role: body.role || 'member',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};
	users.push(newUser);
	return NextResponse.json(
		{
			data: newUser,
			status: 'success',
		},
		{ status: 201 },
	);
}
