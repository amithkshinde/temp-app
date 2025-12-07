
import { NextResponse } from 'next/server';
import { MOCK_LEAVES, addLeave } from '@/data/leaves';
import { Leave } from '@/lib/types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = searchParams.get('year');
    const scope = searchParams.get('scope'); // 'team'
    const date = searchParams.get('date'); // 'YYYY-MM-DD'

    let leaves = MOCK_LEAVES;

    if (scope !== 'team') {
        // Default to user filter if not team scope, or require userId
        // Requirements imply Employee dash passes userId.
        if (userId) {
            leaves = leaves.filter(l => l.userId === userId);
        }
    }

    if (year) {
        leaves = leaves.filter(l => l.startDate.startsWith(year));
    }

    if (date) {
        // Filter for specific date (is within range)
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        leaves = leaves.filter(l => {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return targetDate >= start && targetDate <= end;
        });
    }

    // Populate user details if team scope? Mock data doesn't have names in Leave object, 
    // but frontend might need it. We can map userId to names if we had a user store accessible.
    // For now, let's assume frontend does a lookup or we enrich it.
    // Let's enrich it with mock names for simple demo.
    const enrichedLeaves = leaves.map(l => {
        // Very simple mock lookup
        const name = l.userId === 'emp-001' ? 'Alice Employee' :
            l.userId === 'emp-002' ? 'Bob Colleague' :
                l.userId === 'emp-003' ? 'Charlie New' : 'Unknown';
        return { ...l, userName: name };
    });

    return NextResponse.json(enrichedLeaves);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, startDate, endDate, reason } = body;

        if (!userId || !startDate || !endDate || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Logic: Future -> Pending, Past/Present -> Approved
        // Logic: Phase 8 - Sick vs Planned
        const start = new Date(startDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);

        // Check if start date is today or tomorrow for Sick Leave
        const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isSickLeave = diffDays >= 0 && diffDays <= 1; // 0 = Today, 1 = Tomorrow

        const type: 'sick' | 'planned' = isSickLeave ? 'sick' : 'planned';
        // Sick -> Approved, Planned -> Pending
        // (Unless date is in past? Requirement says: "For any other date: Leave type is automatically Planned Leave... Pending")
        // We stick to the rule: Sick = Approved, Planned = Pending.
        const status = isSickLeave ? 'approved' : 'pending';

        const newLeave: Leave = {
            id: crypto.randomUUID(),
            userId,
            startDate,
            endDate,
            reason,
            status,
            type,
            createdAt: new Date().toISOString()
        };

        addLeave(newLeave);

        // Notifications
        const { notifyManagement, getLeaveRequestTemplate } = await import('@/lib/notifications');
        const { addNotification } = await import('@/data/notifications');
        const { MOCK_USERS } = await import('@/data/users');

        if (status === 'pending') {
            // Notifications
            // Requirement 4: "This message must be sent ONLY to the manager."
            const html = getLeaveRequestTemplate(newLeave, userId);
            await notifyManagement(`New Planned Leave Request from ${userId}`, html);

            // In-app notifications for Managers
            const managers = MOCK_USERS.filter(u => u.role === 'management');
            managers.forEach(manager => {
                // Explicitly exclude the sender (even if they are a manager applying for leave)
                if (manager.id !== userId) {
                    addNotification({
                        id: Math.random().toString(36).substr(2, 9),
                        userId: manager.id,
                        type: 'info',
                        message: `New planned leave request from ${userId}`,
                        read: false,
                        createdAt: new Date().toISOString()
                    });
                }
            });
            // NO notification sent to the employee here. 
            // The frontend will show a toast "Leave request submitted".
            // The email system (notifyManagement) only emails the hardcoded manager address.

        } else {
            // Sick Leave -> Info Only to Manager
            await notifyManagement(`Sick Leave Report: ${userId}`, `<p>${userId} has reported sick for ${startDate}. Auto-approved.</p>`);

            // In-App for Manager
            const managers = MOCK_USERS.filter(u => u.role === 'management');
            managers.forEach(manager => {
                if (manager.id !== userId) {
                    addNotification({
                        id: Math.random().toString(36).substr(2, 9),
                        userId: manager.id,
                        type: 'warning',
                        message: `${userId} is on Sick Leave (${startDate})`,
                        read: false,
                        createdAt: new Date().toISOString()
                    });
                }
            });
            // NO notification to employee here. Frontend handles "Sick Leave Recorded" toast/ribbon.
        }

        return NextResponse.json(newLeave);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

