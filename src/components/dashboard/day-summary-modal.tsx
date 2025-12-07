
import { Leave, User } from '@/lib/types';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { Button } from '@/components/ui/button';
import { X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DaySummaryModalProps {
    date: Date | null;
    leaves: Leave[];
    users: User[];
    onClose: () => void;
}

export function DaySummaryModal({ date, leaves, users, onClose }: DaySummaryModalProps) {
    if (!date) return null;

    // Filter leaves active on this date
    const leavesOnDate = leaves.filter(l => {
        if (l.status === 'rejected' || l.status === 'cancelled') return false;
        const start = parseISO(l.startDate);
        const end = parseISO(l.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return isWithinInterval(d, { start, end });
    });

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[var(--radius-xl)] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Employees on Leave
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">
                                {format(date, 'MMMM d, yyyy')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {leavesOnDate.length > 0 ? (
                        <div className="space-y-3">
                            {leavesOnDate.map((leave, i) => {
                                const user = users.find(u => u.id === leave.userId);
                                return (
                                    <div key={leave.id} className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="font-mono text-xs text-gray-400 mt-1 w-4">{i + 1}.</div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-gray-900">{user?.name || leave.userId}</div>
                                                <span className={cn(
                                                    "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                                    leave.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {leave.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 mt-0.5">
                                                {leave.reason}
                                                <span className="text-gray-400 mx-1">•</span>
                                                <span className="text-xs font-mono">
                                                    {format(parseISO(leave.startDate), 'MMM d')} – {format(parseISO(leave.endDate), 'MMM d')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 italic">No employees are on leave for this date.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
