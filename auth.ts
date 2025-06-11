import NextAuth from 'next-auth';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from './auth.config';
import type { User } from './app/lib/definitions';
import { logger } from './app/lib/Logger';
import { executeQueryWithResult } from './app/lib/db-utils';

async function getUser(email: string): Promise<User | null> {
	try {
		const query = 'SELECT id, email, password, name FROM users WHERE email = $1';
		const params = [email];
		const users: User[] = await executeQueryWithResult(query, params);
		return users[0] || null; // Return null if no user found
	} catch (err) {
		logger.error('Database Error: Failed to fetch user.');
		return null;
	}
}

const stripPassword = (user: User): Omit<User, 'password'> => {
	const { password, ...userWithoutPassword } = user;
	return {
		...userWithoutPassword,
		id: user.id.toString(), // Ensure id is string
	};
};

export const { auth, signIn, signOut } = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			async authorize(credentials) {
				const parsedCredentials = z
					.object({
						email: z.string().email(),
						password: z.string().min(6),
					})
					.safeParse(credentials);

				if (parsedCredentials.success) {
					const { email, password } = parsedCredentials.data;
					const user = await getUser(email);

					if (!user) {
						logger.info('User not found');
						return null;
					}

					const isPasswordsMatch = await bcrypt.compare(password, user.password);

					if (isPasswordsMatch) return stripPassword(user);
				}

				logger.info('Invalid credentials');
				return null;
			},
		}),
	],
});
