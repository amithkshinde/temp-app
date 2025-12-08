import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Role specific validation
        if (role === 'employee') {
            if (!employeeId || !department) {
                return NextResponse.json({ error: 'Employee ID and Department are required' }, { status: 400 });
            }
            // Check for duplicate employee ID
            const existingEmpId = await prisma.user.findFirst({ where: { employeeId } });
            if (existingEmpId) {
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
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password, // Note: Storing plain text as per previous MVP. Recommendation: Hash this.
                role,
                employeeId: role === 'employee' ? employeeId : undefined,
                department: role === 'employee' ? department : undefined,
                inviteCode: role === 'management' ? inviteCode : undefined,
            }
        });

        return NextResponse.json({ success: true, userId: newUser.id });

    } catch (err) {
        console.error('Signup Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
