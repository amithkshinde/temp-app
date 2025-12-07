
import { Leave, User } from '@/lib/types';
import { format, parseISO, isAfter, startOfToday } from 'date-fns';
// import { cn } from '@/lib/utils'; // Unused

interface TeamUpcomingPanelProps {
    leaves: Leave[];
    users: User[];
    isLoading: boolean;
}

export function TeamUpcomingPanel({ leaves, users, isLoading }: TeamUpcomingPanelProps) {
    if (isLoading) {
        return <div className="w-80 h-full animate-pulse bg-slate-50 rounded-xl"></div>;
    }

    const today = startOfToday();

    // Filter for future leaves (approved usually, but user said "Scheduled", 
    // and if Pending is in another panel, we might exclude pending here or show all?)
    // Request: "Pending Panel... Then Upcoming Leaves panel moves below... Order (1) Pending (2) Upcoming"
    // This implies Upcoming mostly contains Approved. 
    // And "Status (Approved)" in example. 
    // I will filter for Approved leaves that are in the future.
    // Or maybe "Scheduled" means "Approved".
    const upcomingLeaves = leaves
        .filter(l => {
            const startDate = parseISO(l.startDate);
            return (isAfter(startDate, today) || startDate.getTime() === today.getTime()) && l.status === 'approved';
        })
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return (
        <div className="w-80 bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-100 p-6 h-fit shrink-0">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Leaves</h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                {upcomingLeaves.map(leave => {
                    const user = users.find(u => u.id === leave.userId);

                    return (
                        <div key={leave.id} className="p-4 rounded-[var(--radius-xl)] bg-slate-50 border border-slate-100">
                            <div className="font-bold text-gray-900 text-sm mb-1">
                                {user?.name || leave.userId}
                            </div>
                            <div className="text-sm font-medium text-gray-700 mb-1">
                                {format(parseISO(leave.startDate), 'MMM d')} – {format(parseISO(leave.endDate), 'MMM d')}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                <span className="font-semibold text-emerald-600">Approved</span>
                                <span>•</span>
                                <span>{leave.reason}</span>
                            </div>
                        </div>
                    );
                })}

                {upcomingLeaves.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No upcoming approved leaves.
                    </div>
                )}
            </div>
        </div>
    );
}
