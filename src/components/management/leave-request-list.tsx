
import { Leave, User } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface LeaveRequestListProps {
    leaves: Leave[];
    users: User[];
    onApprove: (id: string, note: string) => void;
    onReject: (id: string, note: string) => void;
}

export function LeaveRequestList({ leaves, users, onApprove, onReject }: LeaveRequestListProps) {
    const sortedLeaves = [...leaves].sort((a, b) => new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime());

    return (
        <div className="bg-white rounded-[var(--radius-xl)] border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Dates</th>
                        <th className="px-6 py-4">Type/Reason</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {sortedLeaves.map(leave => {
                        const user = users.find(u => u.id === leave.userId);
                        return (
                            <tr key={leave.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {user?.name || leave.userId}
                                    <div className="text-xs text-slate-400 font-normal">{user?.department}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {format(parseISO(leave.startDate), 'MMM d')} - {format(parseISO(leave.endDate), 'MMM d')}
                                    <div className="text-xs text-slate-400">
                                        {Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 3600 * 24) + 1)} days
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="block text-slate-900 line-clamp-1">{leave.reason}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                        leave.status === 'approved' && "bg-emerald-100 text-emerald-700",
                                        leave.status === 'pending' && "bg-amber-100 text-amber-700",
                                        leave.status === 'rejected' && "bg-red-100 text-red-700",
                                        leave.status === 'cancelled' && "bg-gray-100 text-gray-700"
                                    )}>
                                        {leave.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {leave.status === 'pending' ? (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                                onClick={() => {
                                                    const note = prompt("Add approval note (optional):") || "";
                                                    onApprove(leave.id, note);
                                                }}
                                                title="Approve"
                                            >
                                                <Check size={14} />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                onClick={() => {
                                                    const note = prompt("Add rejection note (optional):") || "";
                                                    onReject(leave.id, note);
                                                }}
                                                title="Reject"
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400">Completed</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {sortedLeaves.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No leave requests found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
