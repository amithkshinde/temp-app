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
            return NextResponse.json({ success: true, status: 'approved' });
        }

        const leave = await prisma.leave.findUnique({ where: { id } });
        if (!leave) {
            return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
        }

        // Update Status
        const updatedLeave = await prisma.leave.update({
            where: { id },
            data: { status: 'approved' }
        });

        // Notifications
        const user = await prisma.user.findUnique({ where: { id: leave.userId } });

        if (user) {
            // ... 

            // 1. Email
            const html = getEmployeeNotificationTemplate(updatedLeave as unknown as Leave, 'approved');
            await notifyEmployee(user.email, 'Leave Approved', html);

            // 2. In-App Notification
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: 'success',
                    message: `Your leave request for ${leave.startDate} has been approved.`,
                    read: false
                }
            });
        }

        return NextResponse.json({ success: true, status: 'approved' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
