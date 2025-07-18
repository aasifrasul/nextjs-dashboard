import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export class MFAService {
	static generateSecret(userEmail: string): string {
		return authenticator.generateSecret();
	}

	static async generateQRCode(secret: string, userEmail: string): Promise<string> {
		const service = 'Your Dashboard App';
		const otpauth = authenticator.keyuri(userEmail, service, secret);
		return await QRCode.toDataURL(otpauth);
	}

	static verifyToken(token: string, secret: string): boolean {
		try {
			return authenticator.verify({ token, secret });
		} catch {
			return false;
		}
	}
}
