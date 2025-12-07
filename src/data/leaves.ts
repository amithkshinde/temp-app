import { Leave, LeaveStatus } from '@/lib/types';

export const MOCK_LEAVES: Leave[] = [
    {
        id: 'leave-001',
        userId: 'emp-001',
        startDate: '2025-01-15',
        endDate: '2025-01-16',
        reason: 'Personal Appointment',
        status: 'approved',
        createdAt: '2025-01-01T10:00:00Z'
    },
    {
        id: 'leave-002',
        userId: 'emp-001',
        startDate: '2025-02-10',
        endDate: '2025-02-14',
        reason: 'Vacation',
        status: 'pending',
        createdAt: '2025-02-01T10:00:00Z'
    },
    {
        id: 'leave-003',
        userId: 'emp-002', // Another employee (mock)
        startDate: '2025-02-12',
        endDate: '2025-02-12',
        reason: 'Sick Leave',
        status: 'pending',
        createdAt: '2025-02-11T20:00:00Z' // Last minute example (<24 hours before 00:00 of 12th)
    },
    {
        id: 'leave-004',
        userId: 'emp-003',
        startDate: '2025-02-13',
        endDate: '2025-02-15',
        reason: 'Wedding',
        status: 'approved',
        createdAt: '2025-01-10T10:00:00Z'
    }
];


export const addLeave = (leave: Leave) => {
    MOCK_LEAVES.push(leave);
};

export const removeLeave = (id: string) => {
    const index = MOCK_LEAVES.findIndex(l => l.id === id);
    if (index !== -1) {
        MOCK_LEAVES.splice(index, 1);
    }
};

export function updateLeaveStatus(id: string, status: LeaveStatus) {
    const leave = MOCK_LEAVES.find(l => l.id === id);
    if (leave) {
        leave.status = status;
    }
}

export const updateLeave = (updatedLeave: Leave) => {
    const index = MOCK_LEAVES.findIndex(l => l.id === updatedLeave.id);
    if (index !== -1) {
        MOCK_LEAVES[index] = updatedLeave;
    }
};
