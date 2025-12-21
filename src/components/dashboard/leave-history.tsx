import React from 'react';
import { Leave } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ScrollContainer } from '@/components/ui/scroll-container';

interface LeaveHistoryProps {
    leaves: Leave[];
    isLoading: boolean;
}

export function LeaveHistory({ leaves, isLoading }: LeaveHistoryProps) {
    if (isLoading) {
        return <div className="w-full h-40 animate-pulse bg-slate-50 rounded-xl"></div>;
    }

    // Mock recent history if leaves are empty or just show actual recent ones
    // We will show the last 5 leaves regardless of date (past/future) as "History" usually implies log
    const historyLeaves = [...leaves].sort((a, b) => new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime()).slice(0, 5);

    return (
        <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-4 flex flex-col h-full flex-1 min-h-[250px]">
            <h3 className="text-sm text-gray-900 font-semibold tracking-tight mb-3 shrink-0">Recent Activity</h3>

            {historyLeaves.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">No recent activity.</div>
            ) : (
                <ScrollContainer className="flex-1 min-h-0" contentClassName="pr-2 space-y-3">
                    {historyLeaves.map((leave) => (
                        <div key={leave.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-colors">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate">
                                    {leave.reason || 'Leave Request'}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                    {format(parseISO(leave.startDate), 'MMM d, yyyy')}
                                </p>
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border 
                                ${leave.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    leave.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                {leave.status}
                            </span>
                        </div>
                    ))}
                </ScrollContainer>
            )}
        </div>
    );
}
