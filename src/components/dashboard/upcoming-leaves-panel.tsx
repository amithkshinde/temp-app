import { Leave } from '@/lib/types';
import { format, parseISO, isAfter, startOfToday } from 'date-fns';
import { ScrollContainer } from '@/components/ui/scroll-container';
import { PublicHoliday } from '@/data/holiday-data';

interface UpcomingLeavesPanelProps {
    leaves: Leave[];
    holidays?: PublicHoliday[]; // Kept for interface compatibility if needed later
    className?: string;
    onEdit?: (leave: Leave) => void;
}

export function UpcomingLeavesPanel({ leaves, holidays = [], className, onEdit }: UpcomingLeavesPanelProps) {
    const today = startOfToday();

    // Upcoming Approved Leaves (Exhaustive)
    const upcomingLeaves = leaves
        .filter(l => {
            const start = parseISO(l.startDate);
            // Show all future approved leaves
            return (isAfter(start, today) || start.getTime() === today.getTime()) && l.status === 'approved';
        })
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return (
        <div className={`w-full bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-4 flex flex-col h-full flex-1 min-h-[400px] ${className}`}>
            <h3 className="text-sm text-gray-900 font-semibold tracking-tight mb-3 shrink-0">
                Upcoming Leaves
            </h3>

            <ScrollContainer className="flex-1 min-h-0" contentClassName="pr-2 space-y-3">
                {upcomingLeaves.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs">
                        No upcoming approved leaves.
                    </div>
                ) : (
                    upcomingLeaves.map(leave => (
                        <div
                            key={leave.id}
                            className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                            onClick={() => onEdit?.(leave)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-gray-900 text-xs">
                                    {format(parseISO(leave.startDate), 'MMM d')} – {format(parseISO(leave.endDate), 'MMM d, yyyy')}
                                </span>
                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                    Approved
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-xs text-gray-600 line-clamp-1">{leave.reason}</p>
                                <span className="text-[10px] text-brand-pink font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                    Edit
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </ScrollContainer>
        </div>
    );
}
