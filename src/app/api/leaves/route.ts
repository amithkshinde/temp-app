
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyManagement } from '@/lib/notifications';
import { DEMO_USER_EMPLOYEE, DEMO_LEAVES } from '@/lib/demo-data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = searchParams.get('year');
    const scope = searchParams.get('scope'); // 'team'
    const date = searchParams.get('date'); // 'YYYY-MM-DD'

    console.log('[DEBUG API] /api/leaves hit');
    console.log('[DEBUG API] NEXT_PUBLIC_DEMO_MODE:', process.env.NEXT_PUBLIC_DEMO_MODE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let whereClause: any = {};

    if (scope !== 'team') {
        if (!userId) {
            return NextResponse.json([]);
        }

        // Demo Mode Interception
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && userId === DEMO_USER_EMPLOYEE.id) {
            return NextResponse.json(DEMO_LEAVES);
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        // Demo Mode Interception for POST
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && userId === DEMO_USER_EMPLOYEE.id) {
            // Mock success for create
            const newLeave = {
                id: `demo-new-${Date.now()}`,
                userId,
                startDate,
                endDate,
                reason,
                status: 'pending',
                type: reason.toLowerCase().startsWith('sick') ? 'sick' : 'planned',
                createdAt: new Date().toISOString()
            };
            // If sick, auto-approve mock
            if (newLeave.type === 'sick') newLeave.status = 'approved';

            return NextResponse.json(newLeave);
        }

        // 1. Duplicate Check
        const overlappingLeave = await prisma.leave.findFirst({
            where: {
                userId,
                status: { not: 'cancelled' },
                OR: [
                    {
                        startDate: { lte: endDate },
                        endDate: { gte: startDate }
                    }
                ]
            }
        });

        if (overlappingLeave) {
            return NextResponse.json(
                { error: 'You already have a leave request for this period.' },
                { status: 409 }
            );
        }

        // 2. Logic for Sick Leave vs Planned
        const start = new Date(startDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Check if explicitly marked as Sick in reason AND within allowed window (Today/Tomorrow)
        // Note: Frontend formats reason as "Sick: ..." or just "Sick"
        const isReasonSick = reason.toLowerCase().startsWith('sick');
        // User Requirement: "today or today+1". 
        // Strict adherence: diffDays >= 0 && diffDays <= 1.

        const isSickLeave = isReasonSick && (diffDays >= 0 && diffDays <= 1);

        const type: 'sick' | 'planned' = isSickLeave ? 'sick' : 'planned';
        // Sick = Auto Approved. Others = Pending.
        const status = isSickLeave ? 'approved' : 'pending';

        const newLeave = await prisma.leave.create({
            data: {
                userId,
                startDate,
                endDate,
                reason, // "Sick: Fever" or "Personal: Wedding"
                type,
                status
            }
        });

        // --- Auto-Apply Public Holidays Logic ---
        // Rule: If a public holiday date lies within the start and end date, automatically include (select) it.
        try {
            const holidaysInRange = await prisma.holiday.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            for (const h of holidaysInRange) {
                // Upsert selection to ensure it's "Accepted" (Selected)
                await prisma.holidaySelection.upsert({
                    where: {
                        userId_holidayId: {
                            userId,
                            holidayId: h.id
                        }
                    },
                    update: {}, // Already selected, do nothing
                    create: {
                        userId,
                        holidayId: h.id
                    }
                });
            }
        } catch (hErr) {
            console.error("Failed to auto-apply public holidays:", hErr);
            // Don't fail the leave creation if this fails, just log.
        }
        // ----------------------------------------

        // Notifications
        if (status === 'pending') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            // Notify Management Only
            await notifyManagement(`New Planned Leave Request from ${user?.name}`, `<p>New request from ${user?.name} for ${startDate} to ${endDate}. Reason: ${reason}</p>`);

            const managers = await prisma.user.findMany({ where: { role: 'management' } });
            for (const manager of managers) {
                // Ensure we don't notify the employee themselves (if they were a manager, edge case)
                if (manager.id !== userId) {
                    await prisma.notification.create({
                        data: {
                            userId: manager.id,
                            type: 'info',
                            message: `New leave request from ${user?.name || userId}`,
                            read: false
                        }
                    });
                }
            }
        } else {
            // Sick Leave (Auto Approved) -> Notify Management
            const user = await prisma.user.findUnique({ where: { id: userId } });
            await notifyManagement(`Sick Leave User: ${user?.name}`, `<p>${user?.name} is on Sick Leave on ${startDate}. Auto-approved.</p>`);

            const managers = await prisma.user.findMany({ where: { role: 'management' } });
            for (const manager of managers) {
                if (manager.id !== userId) {
                    await prisma.notification.create({
                        data: {
                            userId: manager.id,
                            type: 'warning',
                            message: `${user?.name || userId} is on Sick Leave on ${startDate}`,
                            read: false
                        }
                    });
                }
            }
            // NO notification created for the employee themselves here, 
            // frontend handles "Sick Leave Recorded" toast locally as per requirement.
        }

        return NextResponse.json(newLeave);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

