
import { NextResponse } from 'next/server';
import { MOCK_LEAVES } from '@/data/leaves';
import { getMonth, parseISO } from 'date-fns';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const userLeaves = MOCK_LEAVES.filter(l =>
        l.userId === userId &&
        l.status === 'approved' &&
        l.startDate.startsWith(year.toString())
    );

    // Initialize Quarters
    const quarters = [
        { name: 'Q1 (Jan-Mar)', allocated: 5, taken: 0, carryForward: 0, remaining: 0 },
        { name: 'Q2 (Apr-Jun)', allocated: 5, taken: 0, carryForward: 0, remaining: 0 },
        { name: 'Q3 (Jul-Sep)', allocated: 5, taken: 0, carryForward: 0, remaining: 0 },
        { name: 'Q4 (Oct-Dec)', allocated: 5, taken: 0, carryForward: 0, remaining: 0 },
    ];

    // Calculate Taken per Quarter
    userLeaves.forEach(leave => {
        const date = parseISO(leave.startDate);
        const month = getMonth(date); // 0-11
        const qIndex = Math.floor(month / 3);

        // Simple duration calc (1 leave = 1 day for mock simplicity unless range logic reused)
        // Reusing logic from balance API would be better, but let's keep it simple: 
        // calculate days between start/end.
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (quarters[qIndex]) {
            quarters[qIndex].taken += days;
        }
    });

    // Calculate Rolling Balance (Carry Forward)
    // Rule: Carry forward 50% of remaining, max 5? Or simple simple accumulation?
    // Let's go with: Balance = Allocated + CarryForward - Taken.
    // CarryForward to next Q = (Balance > 0) ? Balance : 0.
    // Initial CarryForward Q1 = 0.

    let previousRemaining = 0;

    quarters.forEach((q, index) => {
        q.carryForward = index === 0 ? 0 : previousRemaining;
        // Logic: You get 5 NEW leaves each quarter. logic vary per company.
        // Let's assume: You get 5 per quarter. 
        // Available = Allocated (5) + CarryForward.
        const totalAvailable = q.allocated + q.carryForward;
        q.remaining = totalAvailable - q.taken;

        // Ensure non-negative remaining for logic sake, though taken could exceed allowance in some policies
        if (q.remaining < 0) q.remaining = 0;

        // Set carry forward for NEXT quarter
        // Simple rule: Carry forward all remaining.
        previousRemaining = q.remaining;
    });

    const totalTaken = quarters.reduce((sum, q) => sum + q.taken, 0);

    // Public Holidays Used (Mock fetch check or param?)
    // This endpoint should ideally check the holiday-selection endpoint or data.
    // We can't import `MOCK_USER_HOLIDAYS` if it doesn't exist exported.
    // For now, let's mock headers "holidays-used" or similar if client passes it, 
    // OR we can't easily get it without reading the user-selections file/api.
    // We will return 0 or rely on client to pass it / fetch separately if needed.
    // BUT requirements asked for "Total holidays used out of 10 allowed" in the summary.
    // Let's check `src/data/holidays.ts` or where selection is stored.
    // It seems `src/app/api/users/[id]/holiday-selection` handles it via a separate mock store.

    // We will omit holidaysUsed here and let the frontend fetch it from the existing endpoint to compose the UI.

    return NextResponse.json({
        year,
        totalTaken,
        quarters
    });
}
