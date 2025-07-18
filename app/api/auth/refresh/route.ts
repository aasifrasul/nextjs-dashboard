import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/app/lib/services';
import { getUserById } from '@/app/lib/database';

export async function POST(request: NextRequest) {
	const refreshToken = request.cookies.get('refreshToken')?.value;

	if (!refreshToken) {
		return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
	}

	const payload = AuthService.verifyRefreshToken(refreshToken);
	if (!payload) {
		return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
	}

	// Check if user still exists and is active
	const user = await getUserById(payload.userId);
	if (!user) {
		return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
	}

	// Generate new tokens
	const newTokens = AuthService.generateTokens({
		userId: user.id,
		email: user.email,
		role: user.role,
	});

	// Set new cookies
	await AuthService.setAuthCookies(newTokens);

	return NextResponse.json({ success: true });
}
