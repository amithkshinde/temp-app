import { NextResponse } from 'next/server';
import { updateLeaveStatus, MOCK_LEAVES } from '@/data/leaves';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const id = params.id;
    const leave = MOCK_LEAVES.find(l => l.id === id);

    if (!leave) {
        return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
    }

    updateLeaveStatus(id, 'rejected');

    // Notification
    const { sendEmail, getDecisionTemplate } = await import('@/lib/notifications');
    const { addNotification } = await import('@/data/notifications');

    // 1. Email
    const html = getDecisionTemplate(leave, 'rejected');
    await sendEmail({
        to: `${leave.userId}@example.com`,
        subject: 'Leave Rejected',
        html
    });

    // 2. In-App Notification
    addNotification({
        id: Math.random().toString(36).substr(2, 9),
        userId: leave.userId,
        type: 'error', // Red for rejection
        message: 'Your leave request has been rejected.',
        read: false,
        createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, status: 'rejected' });
}
