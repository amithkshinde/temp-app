import { User, Leave, LeaveBalance, PublicHoliday } from './types';

export const DEMO_USER_EMPLOYEE: User = {
    id: 'demo-emp',
    name: 'Demo Employee',
    email: 'amith@twistopen.in',
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

const today = new Date();
const currentYear = today.getFullYear();

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

// Helper helpers to get relative dates
const getRelativeDate = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return formatDate(d);
};

// 1. Future Approved (+2 days)
// 2. Future Pending (+5 days)
// 3. Future Rejected (+8 days)
// 4. Past Approved (-5 days)

export const DEMO_LEAVES: Leave[] = [
    // Q1 Leaves (Feb) - 3 Days (Scenario: Took 3, Carry 1)
    {
        id: 'demo-leave-q1-1',
        userId: 'demo-emp',
        startDate: `${currentYear}-02-10`,
        endDate: `${currentYear}-02-12`,
        reason: 'Personal: Winter Break',
        status: 'approved',
        createdAt: `${currentYear}-01-15`,
        type: 'planned',
        userName: 'Demo Employee'
    },
    {
        id: 'demo-leave-past-approved',
        userId: 'demo-emp',
        startDate: getRelativeDate(-5),
        endDate: getRelativeDate(-5),
        reason: 'Personal: Post-project recovery',
        status: 'approved',
        createdAt: getRelativeDate(-10),
        type: 'planned',
        userName: 'Demo Employee'
    },
    {
        id: 'demo-leave-future-approved',
        userId: 'demo-emp',
        startDate: getRelativeDate(2),
        endDate: getRelativeDate(2),
        reason: 'Personal: Dentist Appointment',
        status: 'approved',
        createdAt: getRelativeDate(-1),
        type: 'planned',
        userName: 'Demo Employee'
    },
    {
        id: 'demo-leave-future-pending',
        userId: 'demo-emp',
        startDate: getRelativeDate(5),
        endDate: getRelativeDate(5),
        reason: 'Sick: Doctor checkup',
        status: 'pending',
        createdAt: getRelativeDate(0),
        type: 'sick',
        userName: 'Demo Employee'
    },
    {
        id: 'demo-leave-future-rejected',
        userId: 'demo-emp',
        startDate: getRelativeDate(8),
        endDate: getRelativeDate(8),
        reason: 'Personal: Long Weekend',
        status: 'rejected',
        createdAt: getRelativeDate(-2),
        type: 'planned',
        userName: 'Demo Employee'
    },
    // Keep some original static ones if needed for other months, but the request focuses on Current Month.
    // Adding one far future one just in case.
    {
        id: 'demo-leave-dec-static',
        userId: 'demo-emp',
        startDate: `${currentYear}-12-25`,
        endDate: `${currentYear}-12-26`,
        reason: 'Christmas Break',
        status: 'approved',
        createdAt: `${currentYear}-11-01`,
        type: 'planned',
        userName: 'Demo Employee'
    },
    // New Requested Leaves
    {
        id: 'demo-leave-rejected-new',
        userId: 'demo-emp',
        startDate: getRelativeDate(10),
        endDate: getRelativeDate(10),
        reason: 'Personal: Day trip',
        status: 'rejected',
        createdAt: getRelativeDate(-1),
        type: 'planned',
        userName: 'Demo Employee'
    },
    {
        id: 'demo-leave-jan-new',
        userId: 'demo-emp',
        startDate: `${currentYear + 1}-01-08`,
        endDate: `${currentYear + 1}-01-08`,
        reason: 'Planned: Family Visit',
        status: 'approved',
        createdAt: `${currentYear}-12-15`,
        type: 'planned',
        userName: 'Demo Employee'
    },
    {
        id: 'demo-leave-pending-new',
        userId: 'demo-emp',
        startDate: getRelativeDate(15),
        endDate: getRelativeDate(16),
        reason: 'Planned: Family Vacation',
        status: 'pending',
        createdAt: getRelativeDate(-1),
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

// 2026 Holidays + Dec 2025 + One Dynamic "Demo Holiday" for Current Month
export const DEMO_HOLIDAYS: PublicHoliday[] = [
    { id: 'h-2025-xmas', date: '2025-12-25', name: "Christmas", type: 'public' },
    { id: 'h-1', date: '2026-01-01', name: "New Year's Day", type: 'public' },
    { id: 'h-2', date: '2026-01-14', name: "Pongal / Makar Sankranti", type: 'public' },
    { id: 'h-3', date: '2026-03-04', name: "Holi", type: 'public' },
    { id: 'h-4', date: '2026-03-20', name: "Eid ul-Fitr", type: 'public' },
    { id: 'h-5', date: '2026-04-03', name: "Good Friday", type: 'public' },
    { id: 'h-6', date: '2026-04-14', name: "Vishu", type: 'public' },
    { id: 'h-7', date: '2026-05-01', name: "Labour Day", type: 'public' },
    { id: 'h-8', date: '2026-08-15', name: "Independence Day", type: 'public' },
    { id: 'h-9', date: '2026-08-25', name: "Eid-e-Milad", type: 'public' },
    { id: 'h-10', date: '2026-08-26', name: "Onam", type: 'public' },
    { id: 'h-11', date: '2026-09-14', name: "Ganesh Chaturthi", type: 'public' },
    { id: 'h-12', date: '2026-10-02', name: "Gandhi Jayanti", type: 'public' },
    { id: 'h-13', date: '2026-10-20', name: "Dussehra / Vijayadashami", type: 'public' },
    { id: 'h-14', date: '2026-11-08', name: "Diwali / Deepavali", type: 'public' },
    { id: 'h-15', date: '2026-12-25', name: "Christmas", type: 'public' },

    // Dynamic Holiday: 10 days from now, ensuring visible "Holiday" state in current/near month
    { id: 'h-demo-dynamic', date: getRelativeDate(12), name: "Demo Public Holiday", type: 'public' }
];

export const DEMO_HOLIDAY_SELECTIONS = ['h-2025-xmas', 'h-1', 'h-8', 'h-demo-dynamic']; // Select the dynamic one to show it

import { InAppNotification } from './notifications';

export const DEMO_NOTIFICATIONS: InAppNotification[] = [
    {
        id: 'notif-rejected-1',
        userId: 'demo-emp',
        message: 'Your leave request for ' + getRelativeDate(8) + ' has been rejected.',
        type: 'error',
        read: false,
        createdAt: new Date().toISOString() // NOW
    }
];
