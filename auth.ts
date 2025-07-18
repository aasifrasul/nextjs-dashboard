import NextAuth from 'next-auth';
import bcrypt from 'bcrypt';
import z from 'zod';
import Credentials from 'next-auth/providers/credentials';

import { getUserByEmail } from '@/app/lib/database';
import { authConfig } from '@/auth.config';
import type { User } from '@/app/lib/definitions';
import { logger } from '@/app/lib/Logger';

const stripPassword = (user: User): Omit<User, 'password'> => {
	const { password, ...userWithoutPassword } = user;
	return {
		...userWithoutPassword,
		id: user.id.toString(),
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
					const user = await getUserByEmail(email);

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
