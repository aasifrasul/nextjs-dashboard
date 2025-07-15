// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
	const users = await db.user.findMany();
	return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
	const body = await request.json();
	const user = await db.user.create({
		data: body,
	});
	return NextResponse.json(user, { status: 201 });
}
