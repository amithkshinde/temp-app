
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyManagement } from '@/lib/notifications';

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = params.id;
        const body = await request.json();
        const { startDate, endDate, reason } = body;

        const existingLeave = await prisma.leave.findUnique({ where: { id } });
        if (!existingLeave) {
            return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
        }

        const start = new Date(startDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isSickLeave = diffDays >= 0 && diffDays <= 1;

        const type: 'sick' | 'planned' = isSickLeave ? 'sick' : 'planned';
        // Reset status to pending if planned, approved if sick
        const status = type === 'planned' ? 'pending' : 'approved';

        const updatedLeave = await prisma.leave.update({
            where: { id },
            data: {
                startDate,
                endDate,
                reason,
                type,
                status
            }
        });

        // Notifications
        if (status === 'pending') {
            const user = await prisma.user.findUnique({ where: { id: existingLeave.userId } });
            await notifyManagement(`Leave Updated (Planned): ${user?.name}`, `<p>Updated leave request.</p>`);

            const managers = await prisma.user.findMany({ where: { role: 'management' } });
            for (const manager of managers) {
                if (manager.id !== existingLeave.userId) {
                    await prisma.notification.create({
                        data: {
                            userId: manager.id,
                            type: 'info',
                            message: `Leave updated by ${user?.name || existingLeave.userId}`,
                            read: false
                        }
                    });
                }
            }
        }

        return NextResponse.json(updatedLeave);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = params.id;

        const leave = await prisma.leave.findUnique({ where: { id } });

        if (!leave) {
            return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
        }

        const start = new Date(leave.startDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (start < now) {
            return NextResponse.json({ error: 'Cannot cancel past leaves' }, { status: 403 });
        }

        await prisma.leave.delete({ where: { id } });

        // Notify Manager
        if (leave.type === 'planned' || leave.status === 'pending') {
            const user = await prisma.user.findUnique({ where: { id: leave.userId } });
            await notifyManagement(`Leave Cancelled: ${user?.name}`, `<p>Cancelled.</p>`);
        }

        const user = await prisma.user.findUnique({ where: { id: leave.userId } });
        const managers = await prisma.user.findMany({ where: { role: 'management' } });
        for (const manager of managers) {
            if (manager.id !== leave.userId) {
                await prisma.notification.create({
                    data: {
                        userId: manager.id,
                        type: 'info',
                        message: `Leave cancelled by ${user?.name || leave.userId}`,
                        read: false
                    }
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
