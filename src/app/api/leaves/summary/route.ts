import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMonth, parseISO, eachDayOfInterval, isWeekend, format } from 'date-fns';

// Helper to calculate working days (same as in leave-balance)
// We need to fetch holidays to be accurate.
async function getWorkingDays(startStr: string, endStr: string, publicHolidays: string[]) {
    const start = parseISO(startStr);
    const end = parseISO(endStr);

    if (start > end) return 0;

    const days = eachDayOfInterval({ start, end });
    let workingDays = 0;

    for (const day of days) {
        if (isWeekend(day)) continue;
        const formatted = format(day, 'yyyy-MM-dd');
        if (publicHolidays.includes(formatted)) continue;
        workingDays++;
    }
    return workingDays;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        const [userLeaves, holidays] = await Promise.all([
            prisma.leave.findMany({
                where: {
                    userId,
                    status: 'approved',
                    startDate: { startsWith: year.toString() }
                }
            }),
            prisma.holiday.findMany({ where: { type: 'public' } })
        ]);

        const publicHolidayDates = holidays.map((h: any) => h.date);

        // Initialize Quarters
        // Requirement: 24 Annual Leaves => 6 per Quarter.
        const ALLOCATED_PER_QUARTER = 6;

        const quarters = [
            { name: 'Q1 (Jan-Mar)', allocated: ALLOCATED_PER_QUARTER, taken: 0, carryForward: 0, remaining: 0 },
            { name: 'Q2 (Apr-Jun)', allocated: ALLOCATED_PER_QUARTER, taken: 0, carryForward: 0, remaining: 0 },
            { name: 'Q3 (Jul-Sep)', allocated: ALLOCATED_PER_QUARTER, taken: 0, carryForward: 0, remaining: 0 },
            { name: 'Q4 (Oct-Dec)', allocated: ALLOCATED_PER_QUARTER, taken: 0, carryForward: 0, remaining: 0 },
        ];

        // Calculate Taken per Quarter properly using working days
        // Note: A leave might span across quarters. 
        // For MVP simplicity, we assign the cost to the start month's quarter.
        // A more complex implementation would split the days per quarter.
        // Let's stick to start-date based attribution for now to match current complexity limits,
        // unless we want to do the detailed split. 
        // Given we have `getWorkingDays`, let's just do it simple: Iterate leaves.

        for (const leave of userLeaves) {
            const days = await getWorkingDays(leave.startDate, leave.endDate, publicHolidayDates);

            const month = getMonth(parseISO(leave.startDate));
            const qIndex = Math.floor(month / 3);

            if (quarters[qIndex]) {
                quarters[qIndex].taken += days;
            }
        }

        // Calculate Rolling Balance (Carry Forward)
        // Rule: Max 2 Carry Forward from previous quarter.
        let previousRemaining = 0;

        quarters.forEach((q, index) => {
            // Carry forward logic: Math.min(2, previousRemaining)
            // But wait, "Carry Forward" usually means what you brought INTO this quarter.
            // If Q1, carry forward is 0 (start of year).
            // If Q2, carry forward is min(2, Q1.remaining).

            q.carryForward = index === 0 ? 0 : Math.min(2, previousRemaining);

            const totalAvailable = q.allocated + q.carryForward;
            q.remaining = Math.max(0, totalAvailable - q.taken);

            previousRemaining = q.remaining;
        });

        const totalTaken = quarters.reduce((sum, q) => sum + q.taken, 0);

        return NextResponse.json({
            year,
            totalTaken,
            quarters
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
