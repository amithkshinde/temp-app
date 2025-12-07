
import { NextResponse } from 'next/server';
import { MOCK_USERS } from '@/data/users';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        // Check if email exists
        const user = MOCK_USERS.find(u => u.email === email);

        // In a real app, we wouldn't reveal if a user exists, but for this mock/demo, we might returns success regardless
        // OR we can simulate sending if user exists.

        // Simulating delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock sending email
        console.log(`[Forgot Password] Reset link sent to ${email}`);

        return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
