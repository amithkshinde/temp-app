import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeaveBalance } from '@/lib/types';
import { eachDayOfInterval, isWeekend, format, parseISO } from 'date-fns';

const ANNUAL_ALLOCATION = 24;
const HOLIDAY_LIMIT = 10;

// Helper to calculate working days excluding weekends and public holidays
function getWorkingDays(startStr: string, endStr: string, publicHolidays: string[]) {
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

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        const now = new Date();
        const currentYear = now.getFullYear();

        // Fetch Data in Parallel
        const [userLeaves, publicHolidays, holidaySelections] = await Promise.all([
            prisma.leave.findMany({
                where: { userId }
            }),
            prisma.holiday.findMany({
                where: { type: 'public' }
            }),
            prisma.holidaySelection.findMany({
                where: { userId }
            })
        ]);

        const publicHolidayDates = publicHolidays.map((h: any) => h.date);

        // Calculate Taken (Approved leaves in current year)
        const takenCount = userLeaves.reduce((acc: number, leave: any) => {
            if (leave.status === 'approved' && leave.startDate.startsWith(String(currentYear))) {
                return acc + getWorkingDays(leave.startDate, leave.endDate, publicHolidayDates);
            }
            return acc;
        }, 0);

        const pendingCount = userLeaves.filter((l: any) => l.status === 'pending').length;

        const upcomingCount = userLeaves.filter((l: any) => {
            const start = new Date(l.startDate);
            return (l.status === 'approved' || l.status === 'pending') && start > now;
        }).length;

        // Calculate sick vs planned taken
        const sickTaken = userLeaves.reduce((acc: number, leave: any) => {
            if (leave.status === 'approved' && leave.type === 'sick' && leave.startDate.startsWith(String(currentYear))) {
                return acc + getWorkingDays(leave.startDate, leave.endDate, publicHolidayDates);
            }
            return acc;
        }, 0);

        const plannedTaken = takenCount - sickTaken;

        // Holidays
        const holidaysTaken = holidaySelections.length;

        // Quarterly Logic
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3); // 0, 1, 2, 3
        const quarterStartMonth = currentQuarter * 3;
        const quarterEndMonth = quarterStartMonth + 3; // Exclusive

        const takenInQuarter = userLeaves.reduce((acc: number, leave: any) => {
            if (leave.status === 'approved' && leave.startDate.startsWith(String(currentYear))) {
                const leaveDate = parseISO(leave.startDate);
                const leaveMonth = leaveDate.getMonth();
                if (leaveMonth >= quarterStartMonth && leaveMonth < quarterEndMonth) {
                    return acc + getWorkingDays(leave.startDate, leave.endDate, publicHolidayDates);
                }
            }
            return acc;
        }, 0);

        // Simulated Carry Forward (Fixed at 2 for MVP/Demo as per previous logic)
        const simulatedCarryForward = 2;
        const quarterlyAllocation = 6;
        const quarterlyTotal = quarterlyAllocation + simulatedCarryForward;
        const quarterlyAvailable = Math.max(0, quarterlyTotal - takenInQuarter);


        const balance: LeaveBalance = {
            allocated: ANNUAL_ALLOCATION,
            taken: takenCount,
            remaining: ANNUAL_ALLOCATION - takenCount,
            carriedForward: simulatedCarryForward,
            quarterlyAvailable,
            pending: pendingCount,
            upcoming: upcomingCount,
            sickTaken,
            plannedTaken,
            holidaysAllowed: HOLIDAY_LIMIT,
            holidaysTaken
        };

        return NextResponse.json(balance);

    } catch (e) {
        console.error("Balance Error:", e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
