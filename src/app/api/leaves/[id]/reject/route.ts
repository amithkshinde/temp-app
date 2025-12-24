import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyEmployee, getEmployeeNotificationTemplate } from '@/lib/notifications';
import { Leave } from '@/lib/types';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = params.id;

        // Demo Mode Interception
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && id.startsWith('demo-')) {
            return NextResponse.json({ success: true, status: 'rejected' });
        }

        const leave = await prisma.leave.findUnique({ where: { id } });
        if (!leave) {
            return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
        }

        // Block Rejection of Sick Leave
        const isSick = leave.type === 'sick' || leave.reason.toLowerCase().startsWith('sick');
        if (isSick) {
            return NextResponse.json({ error: 'Sick leave cannot be rejected as it is auto-approved.' }, { status: 400 });
        }
        // Update Status
        const updatedLeave = await prisma.leave.update({
            where: { id },
            data: { status: 'rejected' }
        });

        // Notifications
        const user = await prisma.user.findUnique({ where: { id: leave.userId } });

        if (user) {
            // ...

            // 1. Email
            const html = getEmployeeNotificationTemplate(updatedLeave as unknown as Leave, 'rejected');
            await notifyEmployee(user.email, 'Leave Rejected', html);

            // 2. In-App Notification
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: 'error',
                    message: `Your leave request for ${leave.startDate} has been rejected.`,
                    read: false
                }
            });
        }

        return NextResponse.json({ success: true, status: 'rejected' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
