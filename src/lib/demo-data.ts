import { User, Leave, LeaveBalance, PublicHoliday } from './types';

export const DEMO_USER_EMPLOYEE: User = {
    id: 'demo-emp',
    name: 'Demo Employee',
    email: 'demo.employee@example.com',
    role: 'employee',
    demo: true,
    department: 'Engineering',
    employeeId: 'DEMO-001'
};

export const DEMO_USER_MANAGER: User = {
    id: 'demo-mgr',
    name: 'Demo Manager',
    email: 'demo.manager@example.com',
    role: 'management',
    demo: true,
    department: 'Engineering',
    employeeId: 'DEMO-999'
};

const currentYear = new Date().getFullYear();

// Static mock leaves relative to current year
export const DEMO_LEAVES: Leave[] = [
    {
        id: 'demo-leave-1',
        userId: 'demo-emp',
        startDate: `${currentYear}-01-15`, // Past Approved
        endDate: `${currentYear}-01-16`,
        reason: 'Personal: Visiting family',
        status: 'approved',
        createdAt: `${currentYear}-01-01T10:00:00Z`,
        type: 'planned',
        userName: 'Demo Employee'
    },
    {
        id: 'demo-leave-2',
        userId: 'demo-emp',
        startDate: `${currentYear}-03-10`, // Sick Past
        endDate: `${currentYear}-03-10`,
        reason: 'Sick: Food poisoning',
        status: 'approved',
        createdAt: `${currentYear}-03-10T08:00:00Z`,
        type: 'sick',
        userName: 'Demo Employee'
    },
    {
        id: 'demo-leave-3',
        userId: 'demo-emp',
        startDate: `${currentYear}-12-24`, // Future Pending
        endDate: `${currentYear}-12-26`,
        reason: 'Personal: Christmas Trip',
        status: 'pending',
        createdAt: `${currentYear}-11-01T09:00:00Z`,
        type: 'planned',
        userName: 'Demo Employee'
    },
    {
        id: 'demo-leave-4',
        userId: 'demo-emp',
        startDate: `${currentYear}-08-15`, // Rejected
        endDate: `${currentYear}-08-15`,
        reason: 'Personal: Long weekend',
        status: 'rejected',
        createdAt: `${currentYear}-08-01T10:00:00Z`,
        type: 'planned',
        userName: 'Demo Employee'
    }
];

export const DEMO_BALANCE: LeaveBalance = {
    allocated: 30,
    taken: 3,
    remaining: 27,
    carriedForward: 5,
    pending: 3,
    upcoming: 3,
    sickTaken: 1,
    plannedTaken: 2,
    holidaysAllowed: 10,
    holidaysTaken: 4,
    quarterlyAvailable: 7.5
};

export const DEMO_HOLIDAY_SELECTIONS = ['hol-01', 'hol-05', 'hol-08', 'hol-12'];
