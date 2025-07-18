import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export class SessionService {
	static async createSession(userId: string, userAgent: string, ipAddress: string) {
		return await prisma.session.create({
			data: {
				userId,
				userAgent,
				ipAddress,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			},
		});
	}

	static async getActiveSessions(userId: string) {
		return await prisma.session.findMany({
			where: {
				userId,
				expiresAt: { gt: new Date() },
			},
			orderBy: { createdAt: 'desc' },
		});
	}

	static async revokeSession(sessionId: string) {
		return await prisma.session.delete({
			where: { id: sessionId },
		});
	}

	static async revokeAllSessions(userId: string, exceptSessionId?: string) {
		return await prisma.session.deleteMany({
			where: {
				userId,
				id: exceptSessionId ? { not: exceptSessionId } : undefined,
			},
		});
	}
}
