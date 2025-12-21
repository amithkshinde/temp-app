import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role, inviteCode } = body;

        // Basic Validation
        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Role specific validation (Simplified: Only Invite Code for Management if exposed)
        if (role === 'management') {
            // Mock Invite Code Check
            if (inviteCode !== 'ADMIN-INVITE-2025') {
                return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 });
            }
        }

        // Create User
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password, // Note: Storing plain text as per previous MVP. Recommendation: Hash this.
                role,
                inviteCode: role === 'management' ? inviteCode : undefined,
            }
        });

        return NextResponse.json({ success: true, userId: newUser.id });

    } catch (err) {
        console.error('Signup Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
