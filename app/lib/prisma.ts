import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Optional: Add logging
export const db = new PrismaClient({
	log: ['query', 'info', 'warn', 'error'],
});

// Export types for your components
// export type { Book, User, BookIssue } from '@prisma/client'
