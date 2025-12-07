import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the auth cookie
    (await cookies()).delete('auth-token');

    return response;
}
