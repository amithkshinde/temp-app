import { NextResponse } from 'next/server';
import { MOCK_USERS, addUser } from '@/data/users';
import { Role, User } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role, employeeId, department, inviteCode } = body;

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
        if (MOCK_USERS.find(u => u.email === email)) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Role specific validation
        if (role === 'employee') {
            if (!employeeId || !department) {
                return NextResponse.json({ error: 'Employee ID and Department are required' }, { status: 400 });
            }
            if (MOCK_USERS.find(u => u.employeeId === employeeId)) {
                return NextResponse.json({ error: 'Employee ID already exists' }, { status: 400 });
            }
        } else if (role === 'management') {
            // Mock Invite Code Check
            if (inviteCode !== 'ADMIN-INVITE-2025') {
                return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 });
            }
        } else {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Create User
        const newUser: User & { password: string } = {
            id: crypto.randomUUID(), // Native crypto
            name,
            email,
            role: role as Role,
            password,
            ...(role === 'employee' ? { employeeId, department } : {})
        };

        addUser(newUser);

        return NextResponse.json({ success: true, userId: newUser.id });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
