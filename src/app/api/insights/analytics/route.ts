
import { NextResponse } from 'next/server';
import { MOCK_LEAVES } from '@/data/leaves';
import { MOCK_USERS } from '@/data/users';
import { computeReliabilityScore } from '@/lib/analytics';
import { eachMonthOfInterval, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const departmentFilter = searchParams.get('department'); // Optional filter

        let employees = MOCK_USERS.filter(u => u.role === 'employee');
        if (departmentFilter && departmentFilter !== 'All') {
            employees = employees.filter(u => u.department === departmentFilter);
        }

        const employeeIds = employees.map(u => u.id);

        // Filter Leaves for relevant employees only
        const relevantLeaves = MOCK_LEAVES.filter(l => employeeIds.includes(l.userId));

        // 1. Reliability & Top Leavers
        const reliabilityTable = employees.map(user => {
            const userLeaves = relevantLeaves.filter(l => l.userId === user.id);
            const stats = computeReliabilityScore(user, userLeaves);
            return {
                ...stats,
                user: {
                    id: user.id,
                    name: user.name,
                    department: user.department,
                    employeeId: user.employeeId
                }
            };
        });

        const topLeavers = [...reliabilityTable]
            .sort((a, b) => b.leavesTaken - a.leavesTaken)
            .slice(0, 5)
            .map(r => ({ name: r.user.name, count: r.leavesTaken, department: r.user.department }));

        // 2. Department Stats (Distribution)
        const deptStats: Record<string, number> = {};
        MOCK_LEAVES.forEach(l => { // Global distribution for context, or filtered? Let's use filtered for consistency
            const user = MOCK_USERS.find(u => u.id === l.userId);
            if (user && user.department) {
                if (!deptStats[user.department]) deptStats[user.department] = 0;
                deptStats[user.department] += 1; // Count leaves or days? Simple count for now
            }
        });

        // 3. Trends (Monthly)
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        const months = eachMonthOfInterval({ start: startOfYear, end: endOfYear });

        const trends = months.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);

            // Usage of filtered leaves
            const count = relevantLeaves.filter(l => {
                const d = new Date(l.startDate);
                return isWithinInterval(d, { start: monthStart, end: monthEnd });
            }).length;

            return {
                month: format(month, 'MMM'),
                leaves: count
            };
        });

        // 4. Heatmap Data { "2025-01-01": 5, "2025-01-02": 2 ... }
        const heatmap: Record<string, number> = {};
        relevantLeaves.forEach(leave => {
            if (leave.status !== 'approved') return;
            // Expand range to days
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);

            // Simple loop for range
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = format(d, 'yyyy-MM-dd');
                heatmap[dateStr] = (heatmap[dateStr] || 0) + 1;
            }
        });

        // 5. Upcoming Long Leaves (> 3 days)
        const upcomingLongLeaves = relevantLeaves
            .filter(l => {
                const start = new Date(l.startDate);
                const end = new Date(l.endDate);
                const duration = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;
                return l.status === 'approved' && start > today && duration > 3;
            })
            .map(l => {
                const user = employees.find(u => u.id === l.userId);
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

        return NextResponse.json({
            reliabilityTable,
            deptStats,
            trends,
            heatmap,
            topLeavers,
            upcomingLongLeaves
        });

    } catch {
        console.error("Analytics Error");
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
