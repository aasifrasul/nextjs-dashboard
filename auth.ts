import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { sql } from './app/lib/db';
import type { User } from './app/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | null> {
	try {
		const user: User[] = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;
		return user[0];
	} catch (err) {
		console.error('Database Error: Failed to fetch user.');
		return null;
	}
}

export const { auth, signIn, signOut } = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			async authorize(credentials) {
				const parsedCredentials = z
					.object({
						email: z.string(),
						password: z.string().min(6),
					})
					.safeParse(credentials);
				if (parsedCredentials.success) {
					const { email, password } = parsedCredentials.data;
					const user = await getUser(email);
					
                    if (!user) return null;

					const isValid = await bcrypt.compare(password, user.password);

					if (isValid) return user;
				}

				console.log('Invalid credentials');
				return null;
			},
		}),
	],
});
