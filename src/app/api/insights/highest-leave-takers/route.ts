
import { NextResponse } from 'next/server';
import { MOCK_LEAVES } from '@/data/leaves';
import { MOCK_USERS } from '@/data/users';
import { computeReliabilityScore } from '@/lib/analytics';

export async function GET() {
    const employees = MOCK_USERS.filter(u => u.role === 'employee');

    const stats = employees.map(user => {
        const userLeaves = MOCK_LEAVES.filter(l => l.userId === user.id);
        const { leavesTaken } = computeReliabilityScore(user, userLeaves);
        return {
            name: user.name,
            count: leavesTaken,
            department: user.department
        };
    });

    const topLeavers = stats.sort((a, b) => b.count - a.count).slice(0, 10);
    return NextResponse.json(topLeavers);
}
