
import { NextResponse } from 'next/server';
import { MOCK_LEAVES } from '@/data/leaves';
import { MOCK_USERS } from '@/data/users';

export async function GET() {
    const today = new Date();

    const upcoming = MOCK_LEAVES
        .filter(l => {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            const duration = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;
            // "Long leaves" > 3 days per requirement in analytics, but generic upcoming here
            return l.status === 'approved' && start > today && duration > 2;
        })
        .map(l => {
            const user = MOCK_USERS.find(u => u.id === l.userId);
            return {
                id: l.id,
                employeeName: user?.name,
                department: user?.department,
                startDate: l.startDate,
                endDate: l.endDate,
                duration: Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 3600 * 24) + 1)
            };
        })
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return NextResponse.json(upcoming);
}
