import { Leave } from "@/lib/types";
import { eachDayOfInterval, parseISO, areIntervalsOverlapping, isSameDay, format } from "date-fns";

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
        } catch (e) {
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

    // Also we might want to ensure we don't overlap with "Pending" or "Approved" leaves.
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
