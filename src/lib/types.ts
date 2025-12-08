export type Role = 'employee' | 'management';

export enum Department {
    Engineering = 'Engineering',
    HR = 'HR',
    Sales = 'Sales',
    Design = 'Design',
    Marketing = 'Marketing',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    demo?: boolean;
    department?: Department | string;
    employeeId?: string;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Leave {
    id: string;
    userId: string;
    startDate: string; // ISO Date "YYYY-MM-DD"
    endDate: string; // ISO Date "YYYY-MM-DD"
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    createdAt?: string; // ISO Date "YYYY-MM-DDTHH:mm:ss.sssZ"
    userName?: string; // Enriched field for UI display
    // Requirement says "shows days with states (..., public holiday, personal holiday chosen)"
    // API says: POST body includes `isPublicHolidaySelections`. 
    // I'll add `type` or keep simple. Let's assume Leaves are personal, pub holidays are separate or a property.
    type?: 'sick' | 'planned'; // Added for Phase 8
}

export interface LeaveBalance {
    allocated: number;
    taken: number;
    remaining: number;
    carriedForward: number;
    pending: number;
    upcoming: number;
    sickTaken: number;
    plannedTaken?: number;
    holidaysAllowed?: number;
    holidaysTaken?: number;
    quarterlyAvailable?: number;
}

export interface AuthResponse {
    user?: User;
    token?: string;
    error?: string;
}

export interface PublicHoliday {
    id: string;
    date: string;
    name: string;
    type: 'public' | 'optional';
}

export interface ReliabilityReport {
    user: {
        id: string;
        name: string;
        department: string;
        employeeId: string;
        role: string;
    };
    leavesTaken: number;
    lastMinuteLeaves: number;
    rejectionRatio: number;
    score: number;
    grade: string;
}
