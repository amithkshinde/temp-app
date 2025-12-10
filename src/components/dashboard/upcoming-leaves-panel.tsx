import { Leave } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';

interface UpcomingLeavesPanelProps {
    leaves: Leave[];
    isLoading: boolean;
    onLeaveClick?: (leave: Leave) => void;
}

export function UpcomingLeavesPanel({ leaves, isLoading, onLeaveClick }: UpcomingLeavesPanelProps) {
    if (isLoading) {
        return <div className="w-80 h-64 animate-pulse bg-slate-50 rounded-xl shrink-0"></div>;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingLeaves = leaves
        .filter(l => new Date(l.startDate) >= today && l.status !== 'cancelled')
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return (
        <div className="w-80 bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-4 h-fit shrink-0">
            <h3 className="text-xs text-gray-500 font-medium tracking-wide uppercase mb-1">
                Upcoming Leaves
            </h3>

            {upcomingLeaves.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                    No upcoming leaves scheduled.
                </div>
            ) : (
                <div className="space-y-3">
                    {upcomingLeaves.map(leave => {
                        const startDate = parseISO(leave.startDate);
                        const endDate = parseISO(leave.endDate);


                        // Fallback type if legacy data missing it
                        const type = leave.type || (leave.status === 'approved' ? 'Sick' : 'Planned');
                        const isSick = type === 'sick' || type === 'Sick';

                        return (
                            <div
                                key={leave.id}
                                className="p-3 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                                onClick={() => onLeaveClick?.(leave)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 text-sm">
                                            {format(startDate, 'MMM d, yyyy')}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-medium">
                                            {leave.startDate !== leave.endDate ? `Until ${format(endDate, 'MMM d')} ` : 'Single Day'}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${leave.status === 'approved'
                                        ? 'bg-gray-50 text-gray-700 border-gray-200'
                                        : leave.status === 'rejected'
                                            ? 'bg-gray-50 text-gray-400 border-gray-200 line-through'
                                            : 'bg-white text-gray-600 border-dashed border-gray-300'
                                        }`}>
                                        {leave.status}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isSick ? 'bg-white text-gray-700 border-gray-300' : 'bg-gray-100 text-gray-900 border-gray-200'
                                            }`}>
                                            {isSick ? 'Sick Leave' : 'Planned Leave'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-[#f0216a] opacity-0 group-hover:opacity-100 transition-opacity font-bold hover:underline">
                                        Edit
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
