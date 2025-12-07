
import { NextResponse } from 'next/server';
import { MOCK_NOTIFICATIONS, addNotification } from '@/data/notifications';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const userNotifs = MOCK_NOTIFICATIONS.filter(n => n.userId === userId);
    return NextResponse.json(userNotifs);
}

// POST to create notification (internal use mostly, or for testing)
export async function POST(request: Request) {
    const body = await request.json();
    const { message, type, userId } = body;

    const newNotif = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString()
    };

    addNotification(newNotif);
    return NextResponse.json(newNotif);
}
