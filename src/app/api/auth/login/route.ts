import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

const SECRET = new TextEncoder().encode('this-is-a-secret-key-for-demo-only');

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        let user = null;

        try {
            user = await prisma.user.findUnique({
                where: { email }
            });
        } catch (dbError) {
            console.error("Database connection failed, falling back to mock users:", dbError);
        }

        // Fallback to mock users if DB fails or user not found
        if (!user) {
            const { MOCK_USERS } = await import('@/data/users');
            const mockUser = MOCK_USERS.find(u => u.email === email);
            if (mockUser && mockUser.password === password) {
                user = mockUser;
            }
        }

        if (!user || user.password !== password) {
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
    } catch (error) {
        console.error("Login Query Error:", error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
