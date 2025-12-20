import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEMO_USER_EMPLOYEE, DEMO_LEAVES, DEMO_HOLIDAYS, DEMO_HOLIDAY_SELECTIONS } from '@/lib/demo-data';
import { eachDayOfInterval, isWeekend, format, parseISO } from 'date-fns';

// Define minimal types to satisfy linter without depending on potentially stale generated types
interface Leave {
    startDate: string;
    endDate: string;
    status: string;
    type?: string;
}

interface Holiday {
    date: string;
    type: string;
}

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
    const dateParam = searchParams.get('date');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Dynamic Data Fetching (Supports Demo & Real)
    let userLeaves: any[] = [];
    let publicHolidays: any[] = [];
    let holidaySelections: any[] = [];

    try {
        const now = dateParam ? parseISO(dateParam) : new Date();
        const currentYear = now.getFullYear();

        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3); // 0, 1, 2, 3
        const currentQuarterEndMonth = (currentQuarter + 1) * 3;

        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && userId === DEMO_USER_EMPLOYEE.id) {
            userLeaves = DEMO_LEAVES;
            publicHolidays = DEMO_HOLIDAYS;
            // Mock Prisma selection format
            holidaySelections = DEMO_HOLIDAY_SELECTIONS.map(id => ({ userId, holidayId: id }));
        } else {
            [userLeaves, publicHolidays, holidaySelections] = await Promise.all([
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
        }

        const publicHolidayDates = publicHolidays.map((h: Holiday) => h.date);

        // Calculate Taken (Approved leaves in completed and current quarters)
        // User Requirement: "Sum of all approved leaves taken across completed and current quarters."
        // This implicitly excludes approved leaves in future quarters (e.g. if now is Q1, Q2 leaves are not in 'Taken')
        const takenCount = userLeaves.reduce((acc: number, leave: Leave) => {
            const l = leave as Leave;
            if (l.status === 'approved' && l.startDate.startsWith(String(currentYear))) {
                const leaveMonth = parseISO(l.startDate).getMonth();
                if (leaveMonth < currentQuarterEndMonth) {
                    return acc + getWorkingDays(l.startDate, l.endDate, publicHolidayDates);
                }
            }
            return acc;
        }, 0);

        const upcomingCount = userLeaves.filter((l: Leave) => {
            const start = new Date(l.startDate);
            return (l.status === 'approved' || l.status === 'pending') && start > now;
        }).length;

        // Calculate sick vs planned taken (Applying same quarter filter for consistency)
        const sickTaken = userLeaves.reduce((acc: number, leave: Leave) => {
            const l = leave as Leave;
            if (l.status === 'approved' && l.type === 'sick' && l.startDate.startsWith(String(currentYear))) {
                const leaveMonth = parseISO(l.startDate).getMonth();
                if (leaveMonth < currentQuarterEndMonth) {
                    return acc + getWorkingDays(l.startDate, l.endDate, publicHolidayDates);
                }
            }
            return acc;
        }, 0);

        const plannedTaken = takenCount - sickTaken;

        // Holidays
        const holidaysTaken = holidaySelections.length;

        // Quarterly Logic
        // (Using already defined currentMonth/currentQuarter from top)

        const QUARTER_ALLOCATION = 4;
        const MAX_CARRY = 2;

        let carryForward = 0; // Start with 0 for Q1
        let calcQuarterlyAvailable = 0;

        // Iterate from Q1 up to current quarter to determine valid carry-forward
        for (let q = 0; q <= currentQuarter; q++) {
            const qStartMonth = q * 3;
            const qEndMonth = qStartMonth + 3;

            // Calculate approved leaves taken specifically in this quarter `q`
            const takenInQ = userLeaves.reduce((acc: number, leave: Leave) => {
                const l = leave as Leave;
                if (l.status === 'approved' && l.startDate.startsWith(String(currentYear))) {
                    const leaveDate = parseISO(l.startDate);
                    const leaveMonth = leaveDate.getMonth();
                    if (leaveMonth >= qStartMonth && leaveMonth < qEndMonth) {
                        return acc + getWorkingDays(l.startDate, l.endDate, publicHolidayDates);
                    }
                }
                return acc;
            }, 0);

            const allocatedForQ = QUARTER_ALLOCATION;
            const totalAvailableInQ = allocatedForQ + carryForward;
            const remainingInQ = Math.max(0, totalAvailableInQ - takenInQ);

            if (q === currentQuarter) {
                // This is the current state
                calcQuarterlyAvailable = remainingInQ;
                break;
            }

            // Calculate carry to next quarter
            carryForward = Math.min(MAX_CARRY, remainingInQ);
        }

        const pendingCount = userLeaves.filter((l: Leave) => l.status === 'pending').length;

        // Adjust Annual Allocation to 16 (4 * 4)
        const TOTAL_ANNUAL_ALLOCATION = 16;

        return NextResponse.json({
            allocated: TOTAL_ANNUAL_ALLOCATION,
            taken: takenCount,
            remaining: calcQuarterlyAvailable, // Dashboard main display should reflect what is actually usable NOW
            carriedForward: carryForward,    // What came INTO this quarter
            quarterlyAvailable: calcQuarterlyAvailable,
            pending: pendingCount,
            upcoming: upcomingCount,
            sickTaken,
            plannedTaken,
            holidaysAllowed: HOLIDAY_LIMIT,
            holidaysTaken
        });

    } catch (e) {
        console.error("Balance Error:", e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
