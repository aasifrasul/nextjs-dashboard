// API Route for MFA setup
import { NextRequest, NextResponse } from 'next/server';
import { MFAService } from '@/app/lib/services';
import { getCurrentUser, updateUserMFA } from '@/app/lib/database';

export async function POST(request: NextRequest) {
	const user = await getCurrentUser(request);
	if (!user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const secret = MFAService.generateSecret(user.email);
	const qrCode = await MFAService.generateQRCode(secret, user.email);

	// Store secret temporarily (don't activate MFA yet)
	await updateUserMFA(user.id, { tempSecret: secret });

	return NextResponse.json({ qrCode, secret });
}
