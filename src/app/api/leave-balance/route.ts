import { NextResponse } from 'next/server';
import { MOCK_LEAVES } from '@/data/leaves';
import { LeaveBalance } from '@/lib/types';
import { USER_HOLIDAY_SELECTIONS, PUBLIC_HOLIDAYS_2025 } from '@/data/holiday-data';
import { eachDayOfInterval, isWeekend, format, parseISO } from 'date-fns';

const ANNUAL_ALLOCATION = 24; // Updated per requirement
const HOLIDAY_LIMIT = 10;

function getWorkingDays(startStr: string, endStr: string) {
    const start = parseISO(startStr);
    const end = parseISO(endStr);

    // Safety check
    if (start > end) return 0;

    const days = eachDayOfInterval({ start, end });
    let workingDays = 0;

    for (const day of days) {
        if (isWeekend(day)) continue;
        const formatted = format(day, 'yyyy-MM-dd');
        if (PUBLIC_HOLIDAYS_2025.some(h => h.date === formatted)) continue;
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

    const now = new Date();
    const currentYear = now.getFullYear();

    const userLeaves = MOCK_LEAVES.filter(l => l.userId === userId);

    // Calculate Taken (Approved leaves in current year)
    const takenCount = userLeaves.reduce((acc, leave) => {
        if (leave.status === 'approved' && leave.startDate.startsWith(String(currentYear))) {
            return acc + getWorkingDays(leave.startDate, leave.endDate);
        }
        return acc;
    }, 0);

    const pendingCount = userLeaves.filter(l => l.status === 'pending').length;

    const upcomingCount = userLeaves.filter(l => {
        const start = new Date(l.startDate);
        return (l.status === 'approved' || l.status === 'pending') && start > now;
    }).length;

    // Calculate sick vs planned taken
    const sickTaken = userLeaves.reduce((acc, leave) => {
        if (leave.status === 'approved' && leave.type === 'sick' && leave.startDate.startsWith(String(currentYear))) {
            return acc + getWorkingDays(leave.startDate, leave.endDate);
        }
        return acc;
    }, 0);

    const plannedTaken = takenCount - sickTaken;

    // Holidays
    const holidaysTaken = (USER_HOLIDAY_SELECTIONS[userId] || []).length;

    const balance: LeaveBalance = {
        allocated: ANNUAL_ALLOCATION,
        taken: takenCount,
        remaining: ANNUAL_ALLOCATION - takenCount,
        carriedForward: 0,
        pending: pendingCount,
        upcoming: upcomingCount,
        sickTaken,
        plannedTaken,
        holidaysAllowed: HOLIDAY_LIMIT,
        holidaysTaken
    };

    return NextResponse.json(balance);
}
