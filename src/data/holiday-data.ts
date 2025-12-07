
import { PublicHoliday } from "@/lib/types";

// Public Holidays 2025 (Hardcoded)
export const PUBLIC_HOLIDAYS_2025: PublicHoliday[] = [
    { id: 'h1', date: '2025-01-01', name: "New Year's Day", type: 'public' },
    { id: 'h2', date: '2025-01-14', name: "Pongal", type: 'public' },
    { id: 'h3', date: '2025-03-14', name: "Holi", type: 'public' },
    { id: 'h4', date: '2025-03-31', name: "Eid ul-Fitr", type: 'public' },
    { id: 'h5', date: '2025-04-14', name: "Vishu / Tamil New Year", type: 'public' },
    { id: 'h6', date: '2025-04-18', name: "Good Friday", type: 'public' },
    { id: 'h7', date: '2025-05-01', name: "Labour Day", type: 'public' },
    { id: 'h8', date: '2025-08-15', name: "Independence Day", type: 'public' },
    { id: 'h9', date: '2025-08-27', name: "Ganesh Chaturthi", type: 'public' },
    { id: 'h10', date: '2025-09-04', name: "Onam", type: 'public' },
    { id: 'h11', date: '2025-09-05', name: "Eid E Milad", type: 'public' },
    { id: 'h12', date: '2025-10-02', name: "Gandhi Jayanti / Dussehra", type: 'public' },
    { id: 'h13', date: '2025-10-20', name: "Diwali", type: 'public' },
    { id: 'h14', date: '2025-12-25', name: "Christmas", type: 'public' },
];

export type { PublicHoliday } from "@/lib/types";

export function getPublicHolidays() {
    return PUBLIC_HOLIDAYS_2025;
}

export const MOCK_HOLIDAYS = PUBLIC_HOLIDAYS_2025;

export function addHoliday(holiday: PublicHoliday) {
    PUBLIC_HOLIDAYS_2025.push(holiday);
}

// Mock User Selections: { userId: [holidayId1, holidayId2] }
export const USER_HOLIDAY_SELECTIONS: Record<string, string[]> = {};

export function toggleUserSelection(userId: string, holidayId: string) {
    if (!USER_HOLIDAY_SELECTIONS[userId]) {
        USER_HOLIDAY_SELECTIONS[userId] = [];
    }

    const current = USER_HOLIDAY_SELECTIONS[userId];
    if (current.includes(holidayId)) {
        USER_HOLIDAY_SELECTIONS[userId] = current.filter(id => id !== holidayId);
    } else {
        USER_HOLIDAY_SELECTIONS[userId] = [...current, holidayId];
    }
}
