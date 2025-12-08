import { Card } from '@/components/ui/card';
import { Leave } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AuditTimelineProps {
    leaves: Leave[];
}

export function AuditTimeline({ leaves }: AuditTimelineProps) {
    // Sort leaves by latest first
    const sortedLeaves = [...leaves].sort((a, b) =>
        new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime()
    );

    return (
        <Card className="p-6 bg-white border-slate-100 shadow-sm mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Log</h3>

            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pl-6 py-2">
                {sortedLeaves.slice(0, 5).map((leave) => {
                    const statusConfig = {
                        approved: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-white' },
                        pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-white' },
                        rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-white' },
                    }[leave.status] || { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-white' };

                    const Icon = statusConfig.icon;

                    return (
                        <div key={leave.id} className="relative group">
                            {/* Dot on line */}
                            <div className={`absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 border-slate-100 ${statusConfig.bg} flex items-center justify-center`}>
                                <div className={`h-2 w-2 rounded-full ${statusConfig.color.replace('text-', 'bg-')}`} />
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                                    {format(parseISO(leave.createdAt || new Date().toISOString()), 'MMM d, h:mm a')}
                                </span>
                                <p className="text-sm font-semibold text-gray-900">
                                    Request {leave.status}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {leave.type} • {format(parseISO(leave.startDate), 'MMM d')} - {format(parseISO(leave.endDate), 'MMM d')}
                                </p>
                                {leave.status === 'rejected' && (
                                    <p className="text-xs text-red-500 mt-1 bg-red-50 p-2 rounded-lg inline-block">
                                        Manager: "Policy requirement not met."
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {sortedLeaves.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No recent activity.</p>
                )}
            </div>
            {sortedLeaves.length > 5 && (
                <button className="text-xs text-blue-600 font-medium hover:underline ml-6 mt-2">
                    View full history
                </button>
            )}
        </Card>
    );
}
