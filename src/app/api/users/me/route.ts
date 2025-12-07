import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { MOCK_USERS } from '@/data/users';

const SECRET = new TextEncoder().encode('this-is-a-secret-key-for-demo-only');

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, SECRET);
        const userId = payload.id as string;

        const user = MOCK_USERS.find(u => u.id === userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}
