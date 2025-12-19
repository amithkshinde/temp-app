import { Leave } from '@/lib/types';
import { getLeaveVisualStatus, getVisualConfig } from '@/lib/leave-utils';
import { format, parseISO, isSameDay } from 'date-fns';
import { ScrollContainer } from '@/components/ui/scroll-container';
import { DateCard } from '@/components/ui/date-card';

interface UpcomingLeavesPanelProps {
    leaves: Leave[];
    isLoading: boolean;
    onLeaveClick?: (leave: Leave) => void;
    className?: string;
}

export function UpcomingLeavesPanel({ leaves, isLoading, onLeaveClick, className }: UpcomingLeavesPanelProps) {
    if (isLoading) {
        return <div className={`w-80 h-64 animate-pulse bg-slate-50 rounded-xl shrink-0 ${className}`}></div>;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingLeaves = leaves
        .filter(l => new Date(l.startDate) >= today && l.status !== 'cancelled')
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return (
        <div className={`w-80 bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-4 flex flex-col ${className}`}>
            <h3 className="text-sm text-gray-900 font-semibold tracking-tight mb-3 shrink-0">
                Upcoming Leaves
            </h3>

            {upcomingLeaves.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                    No upcoming leaves scheduled.
                </div>
            ) : (
                <ScrollContainer className="flex-1 min-h-0" contentClassName="pr-4 space-y-3">
                    {upcomingLeaves.map(leave => {
                        const startDate = parseISO(leave.startDate);
                        const endDate = parseISO(leave.endDate);
                        const singleDay = isSameDay(startDate, endDate);

                        // Date Format: "Dec 25 – Dec 26, 2025"
                        const dateString = singleDay
                            ? format(startDate, 'MMM d, yyyy')
                            : `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`;


                        // Fallback type if legacy data missing it
                        const type = leave.type || (leave.status === 'approved' ? 'Sick' : 'Planned');
                        const isSick = type === 'sick' || type === 'Sick';

                        const visualStatus = getLeaveVisualStatus(leave);
                        const config = getVisualConfig(visualStatus);

                        return (
                            <DateCard
                                key={leave.id}
                                title={dateString}
                                borderColor={config.border}
                                rightElement={
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${config.bg} ${config.text} ${config.border}`}>
                                        {visualStatus === 'past' ? 'Past' : leave.status}
                                    </span>
                                }
                                bottomElement={
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isSick ? 'bg-white text-gray-700 border-gray-300' : 'bg-gray-100 text-gray-900 border-gray-200'
                                                }`}>
                                                {isSick ? 'Sick Leave' : 'Planned Leave'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-[#f0216a] opacity-0 group-hover:opacity-100 transition-opacity font-bold hover:underline">
                                            Edit
                                        </span>
                                    </>
                                }
                                onClick={() => onLeaveClick?.(leave)}
                            />
                        );
                    })}
                </ScrollContainer>
            )}
        </div>
    );
}
