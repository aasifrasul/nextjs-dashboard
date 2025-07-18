import { executeQuery } from '@/app/lib/db-utils';
import type { User } from '@/app/lib/definitions';
import { logger } from '@/app/lib/Logger';

export async function getUserByEmail(email: string): Promise<User | null> {
	try {
		const query = 'SELECT id, email, password, name FROM users WHERE email = $1';
		const params = [email];
		const users: User[] = await executeQuery(query, params);
		return users[0] || null; // Return null if no user found
	} catch (err) {
		logger.error('Database Error: Failed to fetch user.');
		return null;
	}
}

export async function getUserById(id: string): Promise<User | null> {
	try {
		const query = 'SELECT id, email, password, name FROM users WHERE id = $1';
		const params = [id];
		const users: User[] = await executeQuery(query, params);
		return users[0] || null; // Return null if no user found
	} catch (err) {
		logger.error('Database Error: Failed to fetch user.');
		return null;
	}
}
