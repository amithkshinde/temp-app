
import { NextResponse } from 'next/server';
import { MOCK_LEAVES } from '@/data/leaves';
import { format } from 'date-fns';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year'); // Optional

    const heatmap: Record<string, number> = {};

    MOCK_LEAVES.forEach(leave => {
        if (leave.status !== 'approved') return;
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);

        if (year && start.getFullYear().toString() !== year) return;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = format(d, 'yyyy-MM-dd');
            heatmap[dateStr] = (heatmap[dateStr] || 0) + 1;
        }
    });

    return NextResponse.json(heatmap);
}
