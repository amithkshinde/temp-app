import { NextResponse } from 'next/server';
import { MOCK_LEAVES } from '@/data/leaves';
import { LeaveBalance } from '@/lib/types';

const ANNUAL_ALLOCATION = 20;

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
    // Simple check: if start date is in current year
    const takenCount = userLeaves.reduce((acc, leave) => {
        if (leave.status === 'approved' && leave.startDate.startsWith(String(currentYear))) {
            // Calculate duration in days?
            // Requirement implies "Total Leaves Allocated" -> "Leaves Taken". usually days.
            // For simple mock, let's assume 1 leave entry = duration in days.
            // But we have startDate/endDate. We should calc days.
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return acc + diffDays;
        }
        return acc;
    }, 0);

    const pendingCount = userLeaves.filter(l => l.status === 'pending').length;

    const upcomingCount = userLeaves.filter(l => {
        const start = new Date(l.startDate);
        return l.status === 'approved' && start > now;
    }).length;

    // Calculate sick vs planned taken
    const sickTaken = userLeaves.reduce((acc, leave) => {
        if (leave.status === 'approved' && leave.type === 'sick' && leave.startDate.startsWith(String(currentYear))) {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return acc + diffDays;
        }
        return acc;
    }, 0);

    const plannedTaken = takenCount - sickTaken; // Assuming strict dichotomy based on existing logic

    const balance: LeaveBalance = {
        allocated: ANNUAL_ALLOCATION,
        taken: takenCount,
        remaining: ANNUAL_ALLOCATION - takenCount,
        carriedForward: 0,
        pending: pendingCount,
        upcoming: upcomingCount,
        sickTaken,
        plannedTaken
    };

    return NextResponse.json(balance);
}
