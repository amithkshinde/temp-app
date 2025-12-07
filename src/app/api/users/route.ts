import { NextResponse } from 'next/server';
import { MOCK_USERS } from '@/data/users';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const department = searchParams.get('department');

    let users = MOCK_USERS;

    // Security: In a real app, ensure caller is management or authorized
    // Here we just return safe public info (no passwords)

    if (role) {
        users = users.filter(u => u.role === role);
    }

    if (department && department !== 'All') {
        users = users.filter(u => u.department === department);
    }

    // Sanitize
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const safeUsers = users.map(({ password, ...u }) => u);

    return NextResponse.json(safeUsers);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Mock creation logic
        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            ...body,
            createdAt: new Date().toISOString()
        };
        MOCK_USERS.push(newUser);

        // Remove password from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...safeUser } = newUser;
        return NextResponse.json(safeUser);
    } catch {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
