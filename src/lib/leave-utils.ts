import { Leave } from "@/lib/types";
import { eachDayOfInterval, parseISO, areIntervalsOverlapping, format } from "date-fns";

/**
 * Deduplicates leaves to enforce one effective leave status per date.
 * Priority: Approved > Pending > Rejected > Cancelled
 * Tie-breaker: Latest Created At or Updated At (if available, otherwise random/stable sort)
 * 
 * Strategy:
 * 1. Expand all leaves into [Date, Leave] pairs.
 * 2. Group by Date.
 * 3. Pick winner for each date.
 * 4. Reconstruct clean leaves (Optional) or just return the winning leaves.
 *    - Reconstructing range objects is complex. 
 *    - Simplification: Return a list of leaves that are "valid". 
 *    - Issue: If a leave is valid on Mon-Wed but blocked on Tue by a higher priority leave, what do we do?
 *    - If we just filter out entire leaves, we might lose valid days.
 *    - However, typical use case: User applied for Mon-Fri (Pending). Then Manager approved Mon-Tue (Approved).
 *    - We want to see Approved Mon-Tue. Wed-Fri might still be Pending.
 *    - BUT, standard systems usually SPLIT the request or update status. 
 *    - If we have TWO objects: Leave A (Mon-Fri, Pending) and Leave B (Mon-Fri, Approved), usually Leave B replaces A.
 *    - If we have Leave A (Mon-Tue, Approved) and Leave B (Mon-Wed, Pending), likely Leave B is the 'old' one or 'duplicate'.
 * 
 *    For this specific task "Duplicate leaves for the SAME date", let's assume entire objects are redundant or one is the master.
 *    We will filter out leaves that are *completely shadowed* by higher priority leaves.
 *    If a leave is partially shadowed, we will keep it but relying on Calendar to render the winner on top.
 *    
 *    WAIT. The user requirement: "Deduplicate leaves before rendering... Prefer showing the latest or highest-priority".
 *    "An employee can have ONLY ONE leave per date."
 *    
 *    Implementation: 
 *    We will return a subset of the input leaves.
 *    A leave is kept if it has AT LEAST ONE day that is "winning" over other leaves.
 *    (Actually, the Calendar rendering logic I saw earlier renders ALL leaves for a date. That causes the visual clutter.)
 *    
 *    So we must ensure that for any given date, only ONE leave is associated with it in the view?
 *    Or we just pass a list of "winning" leaves to the Calendar?
 *    
 *    Let's refine `deduplicateLeaves` to:
 *    1. Create a map of Date -> WinningLeaveID.
 *    2. Return all leaves that are referenced in this map.
 *    *NOTE*: If a leave is "Winning" on Monday but "Losing" on Tuesday to another leave, and we return the whole leave, the Calendar will currently render it on Tuesday too (as a loser, maybe "under" the winner).
 *    *Fix*: The Calendar component needs to be smart OR `deduplicateLeaves` needs to potentially effectively "split" or "mask" leaves.
 *    
 *    Given we can't easily change the Leave ID structure or data models without backend changes, 
 *    Client-side fix: 
 *    We will return the original leaves, but we might rely on the `CalendarView` to only pick one per day.
 *    
 *    Actually, let's create a helper `getEffectiveLeaves` that returns `leaves` but filters out "Bad" ones.
 *    If `Leave A` (Pending) is the same range as `Leave B` (Approved), we discard A.
 */

const PRIORITY = {
    'approved': 4,
    'pending': 3,
    'rejected': 2,
    'cancelled': 1
};

export function deduplicateLeaves(leaves: Leave[]): Leave[] {
    if (!leaves || leaves.length === 0) return [];

    // Sort leaves by Priority DESC, then CreatedAt DESC
    const sorted = [...leaves].sort((a, b) => {
        const pA = PRIORITY[a.status] || 0;
        const pB = PRIORITY[b.status] || 0;
        if (pA !== pB) return pB - pA;
        // Tie-breaker: Latest first
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
    });

    const dateMap = new Map<string, string>(); // DateStr -> LeaveId
    const winningLeaveIds = new Set<string>();

    for (const leave of sorted) {
        // Expand days
        let days: Date[] = [];
        try {
            days = eachDayOfInterval({
                start: parseISO(leave.startDate),
                end: parseISO(leave.endDate)
            });
        } catch {
            console.warn("Invalid leave range", leave);
            continue;
        }

        let hasWinningDay = false;

        for (const day of days) {
            const dKey = format(day, 'yyyy-MM-dd');
            if (!dateMap.has(dKey)) {
                // This leave claims this day
                dateMap.set(dKey, leave.id);
                hasWinningDay = true;
            } else {
                // Day already claimed by a higher/equal priority leave (since we sorted)
                // Do nothing
            }
        }

        if (hasWinningDay) {
            winningLeaveIds.add(leave.id);
        }
    }

    // Return the leaves that won at least one day.
    // Note: This still allows a low-priority leave to exist if it has ONE non-overlapping day.
    // However, on the overlapping days, it will still exist in the returned array.
    // The CalendarView `getLeavesForDate` iterates ALL leaves. 
    // So "Losing" days will still be rendered potentially.
    //
    // To strictly fix visual: The Calendar View usage of `getLeavesForDate` must also respect priority.
    // OR we transform the data.
    //
    // Given the constraints: "Update the relevant data handling...".
    // 
    // I'll implement `deduplicateLeaves` to filter out COMPLETELY shadowed leaves logic as a safe baseline.
    // AND I will update `CalendarView` to pick the BEST leave for a specific date, ignoring others.

    return leaves.filter(l => winningLeaveIds.has(l.id));
}

/**
 * Validates if a new leave request overlaps with existing valid leaves.
 * Returns null if valid, or the overlapping leave if invalid.
 */
export function findOverlappingLeave(
    newStart: Date,
    newEnd: Date,
    existingLeaves: Leave[],
    ignoreLeaveId?: string
): Leave | undefined {
    // We only care about Approved or Pending overlaps usually. 
    // Rejected/Cancelled don't block.
    const activeLeaves = existingLeaves.filter(l =>
        l.status !== 'rejected' &&
        l.status !== 'cancelled' &&
        l.id !== ignoreLeaveId
    );

    return activeLeaves.find(l => {
        const lStart = parseISO(l.startDate);
        const lEnd = parseISO(l.endDate);
        return areIntervalsOverlapping(
            { start: newStart, end: newEnd },
            { start: lStart, end: lEnd },
            { inclusive: true }
        );
    });
}

/**
 * Determines the visual status of a leave.
 * Priority: 
 * 1. Past (endDate < today) -> 'past'
 * 2. Status (approved/pending/rejected)
 */
export function getLeaveVisualStatus(leave: Leave): 'past' | 'approved' | 'pending' | 'rejected' | 'cancelled' {
    if (leave.status === 'cancelled') return 'cancelled';

    // Check if past
    const end = parseISO(leave.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (end < today) {
        return 'past';
    }

    return leave.status;
}

/**
 * Returns Tailwind classes for a given visual status.
 */
export function getVisualConfig(status: 'past' | 'approved' | 'pending' | 'rejected' | 'cancelled') {
    switch (status) {
        case 'past':
            return {
                bg: 'bg-slate-100',
                border: 'border-slate-300',
                text: 'text-gray-500',
                indicator: 'bg-gray-400',
                label: 'Past Leave'
            };
        case 'approved':
            return {
                bg: 'bg-green-600',
                border: 'border-green-600',
                text: 'text-white font-medium',
                indicator: 'bg-green-600',
                label: 'Approved'
            };
        case 'pending':
            return {
                bg: 'bg-amber-100',
                border: 'border-amber-400 border-dashed',
                text: 'text-amber-900 font-medium',
                indicator: 'bg-amber-400',
                label: 'Pending'
            };
        case 'rejected':
            return {
                bg: 'bg-red-50',
                border: 'border-red-300',
                text: 'text-red-900',
                indicator: 'bg-red-400',
                label: 'Rejected'
            };
        case 'cancelled':
        default:
            return {
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                text: 'text-gray-400',
                indicator: 'bg-gray-300',
                label: 'Cancelled'
            };
    }
}
// ... existing methods ...

/**
 * Calculates leave balance including STRICT quarterly carry-forward rules.
 * 
 * Rules:
 * - 4 Holidays per Quarter
 * - User can pick max 10 total
 * 
 * Carry Forward Logic (to NEXT quarter only):
 * Used 0 -> Carry 2
 * Used 1-2 -> Carry (2 minus Used) ?? Wait, Prompt says "If 1-2 holidays used -> remaining holidays carry (max 2)"
 *   Actually: "If 1-2 holidays used -> remaining holidays carry (max 2)"
 *   "If 3 holidays used -> 1 carries forward"
 *   "If 4 holidays used -> none carry forward"
 * 
 *   Re-reading strict logic:
 *   Base: 4 available
 *   
 *   Used 0: Remaining 4. Carry max 2? Yes. -> Carry 2.
 *   Used 1: Remaining 3. Carry max 2? Yes -> Carry 2.
 *   Used 2: Remaining 2. Carry 2.
 *   Used 3: Remaining 1. Carry 1.
 *   Used 4: Remaining 0. Carry 0.
 *   
 *   Formula: Math.min(2, 4 - used)
 */
export function calculateQuarterlyBalance(
    holidaysTakenDetails: { date: Date }[], // Dates of taken holidays
    currentDate: Date = new Date()
) {
    const currentYear = currentDate.getFullYear();
    const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3);

    let carriedOver = 0;
    const quarterStats = [];

    // Iterate through quarters 1 to current
    for (let q = 1; q <= 4; q++) {
        // 1. Base Pool
        const basePool = 4;

        // 2. Available this quarter
        const available = basePool + carriedOver;

        // 3. Find taken this quarter
        const qStartMonth = (q - 1) * 3; // 0, 3, 6, 9
        const qEndMonth = qStartMonth + 3;

        const takenCount = holidaysTakenDetails.filter(h => {
            const d = new Date(h.date);
            return d.getFullYear() === currentYear &&
                d.getMonth() >= qStartMonth && d.getMonth() < qEndMonth;
        }).length;

        // 4. Calculate Carry Forward for NEXT quarter
        // Rule: Max 2 can be carried.
        // Base unused = 4 - takenCount (Carry logic applies to BASE allocation usually, or total available? 
        // Prompt says: "If 0 holidays used in a quarter -> 2 carry forward". Implies logic is based on Usage count against the base 4.
        // "If 3 holidays used -> 1 carries forward" (4-3 = 1).

        // Let's assume logic applies to the *unused balance*, capped at 2.
        const unused = Math.max(0, available - takenCount);

        // "Carry forward applies only to the immediately next quarter."
        // "Any unused balance older than one quarter is forfeited."
        // This implies we don't just accumulate. We calculate what moves to Q+1.

        // Logic interpretation:
        // You have 4 base.
        // If you used 0, you have 4 left. Max 2 carry. So 2 moves to next.
        // If you used 1, you have 3 left. Max 2 carry. So 2 moves to next.
        // If you used 3, you have 1 left. Max 2 carry (but only 1 avail). So 1 moves.
        // This suggests: carriedOver_Next = Math.min(2, Math.max(0, available - takenCount));

        const nextCarry = Math.min(2, unused);

        quarterStats.push({
            quarter: q,
            base: basePool,
            carriedIn: carriedOver,
            totalAvailable: available,
            taken: takenCount,
            remaining: unused,
            carriedOut: nextCarry
        });

        // Setup for next loop
        carriedOver = nextCarry;
    }

    return {
        currentQ: quarterStats[currentQuarter - 1],
        allQuarters: quarterStats
    };
}
