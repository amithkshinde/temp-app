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

    updateLeaveStatus(id, 'approved');

    updateLeaveStatus(id, 'approved');

    // Notification
    const { sendEmail, getDecisionTemplate } = await import('@/lib/notifications');
    const { addNotification } = await import('@/data/notifications'); // Direct Mock DB access since we are server-side

    // 1. Email
    const html = getDecisionTemplate(leave, 'approved');
    await sendEmail({
        to: `${leave.userId}@example.com`,
        subject: 'Leave Approved',
        html
    });

    // 2. In-App Notification
    addNotification({
        id: Math.random().toString(36).substr(2, 9),
        userId: leave.userId,
        type: 'success',
        message: 'Your leave request has been approved.',
        read: false,
        createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, status: 'approved' });
}
