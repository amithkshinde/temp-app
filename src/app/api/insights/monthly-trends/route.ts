
import { NextResponse } from 'next/server';
import { MOCK_LEAVES } from '@/data/leaves';
import { eachMonthOfInterval, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const yearStr = searchParams.get('year') || new Date().getFullYear().toString();
    const year = parseInt(yearStr);

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    const months = eachMonthOfInterval({ start: startOfYear, end: endOfYear });

    const trends = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const count = MOCK_LEAVES.filter(l => {
            const d = new Date(l.startDate);
            return isWithinInterval(d, { start: monthStart, end: monthEnd });
        }).length;

        return {
            month: format(month, 'MMM'),
            leaves: count
        };
    });

    return NextResponse.json(trends);
}
