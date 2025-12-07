
import { NextResponse } from 'next/server';
import { markAllAsRead } from '@/data/notifications';

export async function POST(request: Request) {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    markAllAsRead(userId);
    return NextResponse.json({ success: true });
}
