
import { Leave } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface LeaveHistoryProps {
    leaves: Leave[];
}

export function LeaveHistory({ leaves }: LeaveHistoryProps) {
    if (leaves.length === 0) {
        return (
            <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-8 text-center">
                <p className="text-gray-500 text-sm">No leave history found.</p>
            </div>
        );
    }

    // Sort by date desc
    const sortedLeaves = [...leaves].sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    return (
        <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-gray-900">Leave History</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                            <th className="px-6 py-3">Dates</th>
                            <th className="px-6 py-3">Type / Reason</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedLeaves.map((leave) => {
                            const isSingleDay = leave.startDate === leave.endDate;
                            // Parsing reason to show simplified type if possible
                            // Reason format "Type: Details" or just "Details"
                            const reasonText = leave.reason;

                            let statusColor = "bg-slate-100 text-slate-700";
                            if (leave.status === 'approved') statusColor = "bg-green-100 text-green-800";
                            if (leave.status === 'pending') statusColor = "bg-yellow-100 text-yellow-800";
                            if (leave.status === 'rejected') statusColor = "bg-red-100 text-red-800";
                            if (leave.status === 'cancelled') statusColor = "bg-gray-100 text-gray-500 line-through";

                            return (
                                <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {format(parseISO(leave.startDate), 'MMM d, yyyy')}
                                        {!isSingleDay && ` - ${format(parseISO(leave.endDate), 'MMM d, yyyy')}`}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate text-gray-600">
                                        {reasonText}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide", statusColor)}>
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
