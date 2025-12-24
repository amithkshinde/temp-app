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

// 1. Past Approved (-5 days)
// 2. Future Approved (+2 days)
// 3. Pending (+5 days)
// 4. Rejected (+8 days)

export const DEMO_LEAVES: Leave[] = [
    {
        id: 'demo-past-approved',
        userId: 'demo-emp',
        startDate: getRelativeDate(-5),
        endDate: getRelativeDate(-5),
        reason: 'Personal: Recovering from project',
        status: 'approved',
        createdAt: getRelativeDate(-10),
        type: 'planned',
        userName: 'Demo Employee'
    },
    {
        id: 'demo-future-approved',
        userId: 'demo-emp',
        startDate: getRelativeDate(2),
        endDate: getRelativeDate(2),
        reason: 'Personal: Dentist Appointment',
        status: 'approved',
        createdAt: getRelativeDate(-2),
        type: 'planned',
        userName: 'Demo Employee'
    },
    {
        id: 'demo-leave-sick',
        userId: DEMO_USER_EMPLOYEE.id,
        startDate: getRelativeDate(2), // 2 days from now (Sick/Upcoming)
        endDate: getRelativeDate(3),
        type: 'sick',
        status: 'approved', // Auto-approved
        reason: 'Sick: Viral Fever',
        createdAt: new Date().toISOString(),
        userName: 'Demo Employee'
    },
    {
        id: 'demo-future-pending',
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
        id: 'demo-future-rejected',
        userId: 'demo-emp',
        startDate: getRelativeDate(8),
        endDate: getRelativeDate(8),
        reason: 'Personal: Long Weekend',
        status: 'rejected',
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
