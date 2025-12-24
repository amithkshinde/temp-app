
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

        // Demo Mode Interception for PUT
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && id.startsWith('demo-')) {
            // Mock success
            return NextResponse.json({
                id,
                userId: 'demo-emp',
                startDate,
                endDate,
                reason,
                status: reason.toLowerCase().startsWith('sick') ? 'approved' : 'pending',
                type: reason.toLowerCase().startsWith('sick') ? 'sick' : 'planned',
                updatedAt: new Date().toISOString()
            });
        }

        const existingLeave = await prisma.leave.findUnique({ where: { id } });
        if (!existingLeave) {
            return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
        }

        // Prevent editing past leaves
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const existingStart = new Date(existingLeave.startDate);
        existingStart.setHours(0, 0, 0, 0);

        if (existingStart < now) {
            return NextResponse.json({ error: 'Cannot edit past leaves' }, { status: 403 });
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        // Prevent moving leave to past
        if (start < now) {
            return NextResponse.json({ error: 'Cannot move leave to past dates' }, { status: 403 });
        }

        const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Sick Logic: Reason + Date
        const isReasonSick = reason.toLowerCase().startsWith('sick');
        const isSickLeave = isReasonSick && (diffDays >= 0 && diffDays <= 1);

        const type: 'sick' | 'planned' = isSickLeave ? 'sick' : 'planned';
        const status = isSickLeave ? 'approved' : 'pending';

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
            await notifyManagement(`Leave Updated (Planned): ${user?.name}`, `<p>Updated leave request to ${startDate}. Reason: ${reason}</p>`);

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
        } else {
            // Sick Leave Updated (Auto Approved)
            const user = await prisma.user.findUnique({ where: { id: existingLeave.userId } });
            await notifyManagement(`Sick Leave Update: ${user?.name}`, `<p>${user?.name} updated sick leave to ${startDate}. Auto-approved.</p>`);

            const managers = await prisma.user.findMany({ where: { role: 'management' } });
            for (const manager of managers) {
                if (manager.id !== existingLeave.userId) {
                    await prisma.notification.create({
                        data: {
                            userId: manager.id,
                            type: 'warning',
                            message: `${user?.name || existingLeave.userId} updated Sick Leave (${startDate})`,
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

        // Demo Mode Interception for DELETE
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && id.startsWith('demo-')) {
            return NextResponse.json({ success: true });
        }

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

        // Notify Manager for ALL cancellations
        const user = await prisma.user.findUnique({ where: { id: leave.userId } });
        await notifyManagement(
            `Leave Cancelled: ${user?.name}`,
            `<p>${user?.name} has cancelled their leave request for ${leave.startDate} to ${leave.endDate}.</p>`
        );


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
