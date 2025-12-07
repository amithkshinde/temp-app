
import { NextResponse } from 'next/server';
import { MOCK_LEAVES, updateLeave, removeLeave } from '@/data/leaves';
import { Leave } from '@/lib/types';

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = params.id;
        const body = await request.json();
        const { startDate, endDate, reason } = body;

        const existingLeave = MOCK_LEAVES.find(l => l.id === id);
        if (!existingLeave) {
            return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
        }

        // Logic: Updates
        // If it’s planned leave, the approval status resets to Pending
        // If it’s sick leave, no approval is required (remain approved if date is still valid sick range, else might need re-eval? 
        // User says: "If it’s sick leave, no approval is required". 
        // We will assume editing a sick leave keeps it sick/approved unless they move it to future? 
        // Actually, easiest is to re-evaluate type based on New Date? 
        // User says: "If it’s planned leave... If it’s sick leave..." 
        // Let's re-run the classification logic for safety, OR just modify fields.
        // Simple approach: Use same logic as creation for Type/Status.

        const start = new Date(startDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isSickLeave = diffDays >= 0 && diffDays <= 1;

        const type: 'sick' | 'planned' = isSickLeave ? 'sick' : 'planned';
        const status = isSickLeave ? 'approved' : 'pending';

        const updatedLeave: Leave = {
            ...existingLeave,
            startDate,
            endDate,
            reason,
            type, // Update type based on new date
            status: type === 'planned' ? 'pending' : 'approved' // Reset status if planned
        };

        updateLeave(updatedLeave);

        // Notify Manager of Update
        const { notifyManagement } = await import('@/lib/notifications');
        const { addNotification } = await import('@/data/notifications');
        const { MOCK_USERS } = await import('@/data/users');

        if (status === 'pending') {
            await notifyManagement(`Leave Updated (Planned): ${updatedLeave.userId}`, `<p>${updatedLeave.userId} updated their leave to ${startDate}. Please review.</p>`);
            // In-app
            const managers = MOCK_USERS.filter(u => u.role === 'management');
            managers.forEach(manager => {
                if (manager.id !== updatedLeave.userId) {
                    addNotification({
                        id: Math.random().toString(36).substr(2, 9),
                        userId: manager.id,
                        type: 'info',
                        message: `Leave updated by ${updatedLeave.userId}`,
                        read: false,
                        createdAt: new Date().toISOString()
                    });
                }
            });
        }

        return NextResponse.json(updatedLeave);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = params.id;
        const leave = MOCK_LEAVES.find(l => l.id === id);

        if (!leave) {
            return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
        }

        // Logic: Employee can cancel if date has not passed
        // (Assuming frontend checks too, but backend validation is good)
        const start = new Date(leave.startDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (start < now) {
            return NextResponse.json({ error: 'Cannot cancel past leaves' }, { status: 403 });
        }

        removeLeave(id);

        // Notify Manager
        const { notifyManagement } = await import('@/lib/notifications');
        const { addNotification } = await import('@/data/notifications');
        const { MOCK_USERS } = await import('@/data/users');

        if (leave.type === 'planned' || leave.status === 'pending') {
            await notifyManagement(`Leave Cancelled: ${leave.userId}`, `<p>${leave.userId} cancelled their leave for ${leave.startDate}.</p>`);
        }

        const managers = MOCK_USERS.filter(u => u.role === 'management');
        managers.forEach(manager => {
            if (manager.id !== leave.userId) {
                addNotification({
                    id: Math.random().toString(36).substr(2, 9),
                    userId: manager.id,
                    type: 'info',
                    message: `Leave cancelled by ${leave.userId}`,
                    read: false,
                    createdAt: new Date().toISOString()
                });
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
