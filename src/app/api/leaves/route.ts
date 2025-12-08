
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Leave } from '@/lib/types';
import { getLeaveRequestTemplate, notifyManagement } from '@/lib/notifications';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = searchParams.get('year');
    const scope = searchParams.get('scope'); // 'team'
    const date = searchParams.get('date'); // 'YYYY-MM-DD'

    let whereClause: any = {};

    if (scope !== 'team') {
        if (!userId) {
            return NextResponse.json([]);
        }
        whereClause.userId = userId;
    }

    if (year) {
        whereClause.startDate = {
            startsWith: year
        };
    }

    // Prisma doesn't support generic filtering in memory like Array.filter for custom logic easily
    // But for date range check: 
    // If user asks for specific date `date`, we need leaves where startDate <= date <= endDate

    // We will fetch based on userId/Year first, then filter date in memory if needed for complex overlaps, 
    // OR allow Prisma to fetch all and filter.
    // For `date` query (Manager Dashboard click):
    if (date) {
        // Query leaves that overlap with this date
        // startDate <= targetDate AND endDate >= targetDate
        // String comparison works for ISO dates YYYY-MM-DD
        whereClause = {
            ...whereClause,
            startDate: { lte: date },
            endDate: { gte: date }
        };
    }

    try {
        const leaves = await prisma.leave.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        const enrichedLeaves = leaves.map((l: any) => ({
            ...l,
            userName: l.user?.name || 'Unknown'
        }));

        return NextResponse.json(enrichedLeaves);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, startDate, endDate, reason } = body;

        if (!userId || !startDate || !endDate || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const start = new Date(startDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isSickLeave = diffDays >= 0 && diffDays <= 1;

        const type: 'sick' | 'planned' = isSickLeave ? 'sick' : 'planned';
        const status = isSickLeave ? 'approved' : 'pending';

        const newLeave = await prisma.leave.create({
            data: {
                userId,
                startDate,
                endDate,
                reason,
                type,
                status
            }
        });

        // Notifications
        if (status === 'pending') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            // Mock email
            // const html = getLeaveRequestTemplate(newLeave, userId); // Requires Leave type compat
            // Casting newLeave to any to avoid strict type mismatch with mock template helper for now
            await notifyManagement(`New Planned Leave Request from ${user?.name}`, `<p>New request</p>`);

            const managers = await prisma.user.findMany({ where: { role: 'management' } });

            for (const manager of managers) {
                if (manager.id !== userId) {
                    await prisma.notification.create({
                        data: {
                            userId: manager.id,
                            type: 'info',
                            message: `New planned leave request from ${user?.name || userId}`,
                            read: false
                        }
                    });
                }
            }
        } else {
            // Sick Leave
            const user = await prisma.user.findUnique({ where: { id: userId } });
            await notifyManagement(`Sick Leave Report: ${user?.name}`, `<p>${user?.name} has reported sick for ${startDate}. Auto-approved.</p>`);

            const managers = await prisma.user.findMany({ where: { role: 'management' } });
            for (const manager of managers) {
                if (manager.id !== userId) {
                    await prisma.notification.create({
                        data: {
                            userId: manager.id,
                            type: 'warning',
                            message: `${user?.name || userId} is on Sick Leave (${startDate})`,
                            read: false
                        }
                    });
                }
            }
        }

        return NextResponse.json(newLeave);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

