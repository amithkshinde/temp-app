
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
    const safeUsers = users.map(({ password, ...u }) => u);

    return NextResponse.json(safeUsers);
}
