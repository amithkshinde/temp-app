
import { Leave, User } from '@/lib/types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PendingApprovalsPanelProps {
    leaves: Leave[];
    users: User[];
    onApprove: (id: string, note: string) => Promise<void>;
    onReject: (id: string, note: string) => Promise<void>;
    isLoading: boolean;
}

export function PendingApprovalsPanel({ leaves, users, onApprove, onReject, isLoading }: PendingApprovalsPanelProps) {
    if (isLoading) {
        return <div className="w-80 h-40 animate-pulse bg-slate-50 rounded-xl shrink-0 mb-6"></div>;
    }

    // Persistent Empty State
    if (leaves.length === 0) {
        return (
            <div className="w-80 bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-100 p-6 h-fit shrink-0 mb-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <Check size={20} className="text-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">All Caught Up</h3>
                <p className="text-xs text-gray-500 mt-1">No pending leave requests.</p>
            </div>
        );
    }

    return (
        <div className="w-80 bg-white rounded-[var(--radius-xl)] shadow-sm border border-amber-100 p-6 h-fit shrink-0 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Pending Approvals</h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {leaves.length}
                </span>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {leaves.map(leave => {
                    const user = users.find(u => u.id === leave.userId);
                    const startDate = parseISO(leave.startDate);
                    const endDate = parseISO(leave.endDate);
                    const days = differenceInDays(endDate, startDate) + 1;

                    return (
                        <div key={leave.id} className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-900 text-sm">
                                    {user?.name || leave.userId}
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase font-semibold">
                                    {days} Day{days > 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="text-xs text-gray-600 mb-2">
                                {format(startDate, 'MMM d')} {days > 1 ? `– ${format(endDate, 'MMM d')}` : ''}
                                <span className="mx-1">•</span>
                                {leave.reason}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => onApprove(leave.id, '')}
                                >
                                    Approve Leave
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => onReject(leave.id, '')}
                                >
                                    Reject Leave
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
