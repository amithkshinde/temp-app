
import { NextResponse } from 'next/server';
import { MOCK_LEAVES } from '@/data/leaves';
import { MOCK_USERS } from '@/data/users';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    // const format = searchParams.get('format'); // 'csv' - unused for now as we only support csv

    // Only CSV supported for now
    const headers = ["Employee", "Department", "Start Date", "End Date", "Status", "Reason"];
    const rows = MOCK_LEAVES.map(l => {
        const user = MOCK_USERS.find(u => u.id === l.userId);
        return [
            user?.name || 'Unknown',
            user?.department || '',
            l.startDate,
            l.endDate,
            l.status,
            `"${l.reason.replace(/"/g, '""')}"` // CSV escape
        ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");

    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="insights-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
    });
}
