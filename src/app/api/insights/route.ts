import { NextResponse } from 'next/server';
import { MOCK_LEAVES } from '@/data/leaves';

export async function GET() {
    // Simple summary stats

    const totalRequests = MOCK_LEAVES.length;
    const pendingCount = MOCK_LEAVES.filter(l => l.status === 'pending').length;

    // Active today
    const activeTodayCount = MOCK_LEAVES.filter(l => {
        if (l.status !== 'approved') return false;
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today >= start && today <= end;
    }).length;

    return NextResponse.json({
        activeToday: activeTodayCount,
        pending: pendingCount,
        totalRequests,
        topLeavers: [
            { name: 'Alice Employee', days: 12 },
            { name: 'Bob Colleague', days: 8 }
        ] // Mocked top list
    });
}
