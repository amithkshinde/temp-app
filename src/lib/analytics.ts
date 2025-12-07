
import { Leave, User } from '@/lib/types';
import { parseISO, subHours } from 'date-fns';

export interface ReliabilityDetails {
    leavesTaken: number;
    lastMinuteLeaves: number;
    rejectionRatio: number; // 0-1
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface EmployeeStats extends ReliabilityDetails {
    user: User;
    totalDays: number;
}

export const computeReliabilityScore = (user: User, userLeaves: Leave[]): ReliabilityDetails => {
    // 1. Leaves Taken (Normalized impact)
    // We assume 20 days is "normal full usage". Penalize slightly? No, leave is a right.
    // However, if we are measuring "Reliability" in a specific "Availability" context? 
    // Requirement says "leavesTakenNormalized" is part of it.
    // Let's assume excessive leave might lower score slightly in this heuristic if > normal allowance?
    // Or simpler: Score starts at 100.

    // Heuristic Weights
    const W_LAST_MINUTE = 15; // Highest penalty for last minute
    const W_REJECTED = 10; // Penalty for rejected leaves (spamming?)

    // Let's define "leavesTakenNormalized" as ratio to allowance?
    // If taken > allowance (20), penalize.

    const allowance = 20; // Hardcoded allowance for demo
    const takenCount = userLeaves.filter(l => l.status === 'approved').length;

    // Last Minute Check: Created < 24h before Start Date (00:00)
    let lastMinuteCount = 0;
    userLeaves.forEach(l => {
        if (!l.createdAt) return;
        const start = parseISO(l.startDate);
        // Reset start to midnight
        start.setHours(0, 0, 0, 0);

        const created = parseISO(l.createdAt);
        const threshold = subHours(start, 24);

        if (created > threshold) {
            lastMinuteCount++;
        }
    });

    const lastMinuteRatio = userLeaves.length > 0 ? lastMinuteCount / userLeaves.length : 0;

    // Approval/Rejection Ratio
    const rejectedCount = userLeaves.filter(l => l.status === 'rejected').length;
    const rejectionRatio = userLeaves.length > 0 ? rejectedCount / userLeaves.length : 0;

    // Penalty Calculation
    let penalty = 0;

    // 1. Last Minute Penalty: Scale from 0 to 20 based on ratio
    penalty += (lastMinuteRatio * W_LAST_MINUTE * 2); // Example usage

    // 2. Rejection Penalty: Scale from 0 to 10
    penalty += (rejectionRatio * W_REJECTED * 2);

    // 3. Usage Penalty (Soft): If near limit or over
    if (takenCount > allowance) {
        penalty += (takenCount - allowance) * 2;
    }

    let score = 100 - penalty;
    score = Math.max(0, Math.min(100, Math.round(score)));

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
    if (score < 60) grade = 'F';
    else if (score < 70) grade = 'D';
    else if (score < 80) grade = 'C';
    else if (score < 90) grade = 'B';

    return {
        leavesTaken: takenCount,
        lastMinuteLeaves: lastMinuteCount,
        rejectionRatio,
        score,
        grade
    };
};
