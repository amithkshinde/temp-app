import { NextResponse } from 'next/server';
import { MOCK_USERS } from '@/data/users';
import { SignJWT } from 'jose';

const SECRET = new TextEncoder().encode('this-is-a-secret-key-for-demo-only');

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const user = MOCK_USERS.find(
            (u) => u.email === email && u.password === password
        );

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Create a simple JWT
        const token = await new SignJWT({ id: user.id, role: user.role, email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(SECRET);

        const response = NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token, // Return token in body as requested? Spec says: returns { token, user... }
        });

        // Client must store token in httpOnly cookie
        // We can also set it here for convenience/security
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day
        });

        return response;
    } catch (err) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
