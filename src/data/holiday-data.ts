import { PublicHoliday } from '@/lib/types';

export type { PublicHoliday };

export const PUBLIC_HOLIDAYS_2026: PublicHoliday[] = [
    // Q1 (Jan-Mar)
    { id: 'h-1', date: '2026-01-01', name: "New Year's Day", type: 'public' },
    { id: 'h-2', date: '2026-01-14', name: "Pongal / Makar Sankranti", type: 'public' },
    { id: 'h-3', date: '2026-01-26', name: "Republic Day", type: 'public' },
    { id: 'h-4', date: '2026-03-04', name: "Holi", type: 'public' },

    // Q2 (Apr-Jun)
    { id: 'h-5', date: '2026-03-20', name: "Eid ul-Fitr", type: 'public' }, // Late March/Early April usually
    { id: 'h-6', date: '2026-04-03', name: "Good Friday", type: 'public' },
    { id: 'h-7', date: '2026-04-14', name: "Vishu / Tamil New Year", type: 'public' },
    { id: 'h-8', date: '2026-05-01', name: "Labour Day", type: 'public' },

    // Q3 (Jul-Sep)
    { id: 'h-9', date: '2026-08-15', name: "Independence Day", type: 'public' },
    { id: 'h-10', date: '2026-08-26', name: "Onam", type: 'public' },
    { id: 'h-11', date: '2026-08-30', name: "Raksha Bandhan", type: 'public' },
    { id: 'h-12', date: '2026-09-14', name: "Ganesh Chaturthi", type: 'public' },

    // Q4 (Oct-Dec)
    { id: 'h-13', date: '2026-10-02', name: "Gandhi Jayanti", type: 'public' },
    { id: 'h-14', date: '2026-10-20', name: "Dussehra", type: 'public' },
    { id: 'h-15', date: '2026-11-08', name: "Diwali", type: 'public' },
    { id: 'h-16', date: '2026-12-25', name: "Christmas", type: 'public' },
];

// In-memory store for demo purposes (initialized with 2026 data + Dec 2025)
export let MOCK_HOLIDAYS: PublicHoliday[] = [...PUBLIC_HOLIDAYS_2026];

// Helper functions (Pseudo-backend logic)
export const getPublicHolidays = async () => {
    return MOCK_HOLIDAYS;
};

export const addHoliday = (holiday: PublicHoliday) => {
    MOCK_HOLIDAYS.push(holiday);
};

export const removeHoliday = (id: string) => {
    MOCK_HOLIDAYS = MOCK_HOLIDAYS.filter(h => h.id !== id);
};

export const updateHoliday = (id: string, updates: Partial<PublicHoliday>) => {
    const index = MOCK_HOLIDAYS.findIndex(h => h.id === id);
    if (index !== -1) {
        MOCK_HOLIDAYS[index] = { ...MOCK_HOLIDAYS[index], ...updates };
    }
};

// Mock User Selections Store
export const USER_HOLIDAY_SELECTIONS: Record<string, string[]> = {};

export const toggleUserSelection = (userId: string, holidayId: string) => {
    if (!USER_HOLIDAY_SELECTIONS[userId]) {
        USER_HOLIDAY_SELECTIONS[userId] = [];
    }
    const index = USER_HOLIDAY_SELECTIONS[userId].indexOf(holidayId);
    if (index === -1) {
        USER_HOLIDAY_SELECTIONS[userId].push(holidayId);
    } else {
        USER_HOLIDAY_SELECTIONS[userId].splice(index, 1);
    }
};
