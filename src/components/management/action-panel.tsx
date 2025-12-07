import { Leave } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ActionPanelProps {
    date: Date | null;
    leaves: Leave[]; // Leaves for this specific date
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string) => Promise<void>;
    isLoading: boolean;
}

export function ActionPanel({ date, leaves, onApprove, onReject, isLoading }: ActionPanelProps) {
    if (!date) {
        return (
            <div className="h-full bg-slate-50 border-l border-slate-200 p-6 flex items-center justify-center text-slate-400 text-sm">
                Select a date to view details
            </div>
        );
    }

    const pendingLeaves = leaves.filter(l => l.status === 'pending');

    return (
        <div className="h-full bg-white border-l border-slate-200 flex flex-col w-full max-w-sm">
            <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900">{format(date, 'EEEE, MMM d')}</h3>
                <p className="text-sm text-slate-500">{leaves.length} people on leave</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {leaves.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No leaves for this date.</p>
                )}

                {leaves.map((leave) => (
                    <div key={leave.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="text-sm font-bold text-slate-900 block">{leave.userName}</span>
                                <span className="text-xs text-slate-500 capitalize">{leave.reason}</span>
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full 
                           ${leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    leave.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'}`}>
                                {leave.status}
                            </span>
                        </div>
                        <div className="text-xs text-slate-400 mb-4">
                            {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                        </div>

                        {leave.status === 'pending' && (
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-xs"
                                    onClick={() => onApprove(leave.id)}
                                    isLoading={isLoading}
                                >
                                    Approve
                                </Button>
                                <Button
                                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 h-8 text-xs font-normal"
                                    variant="secondary"
                                    onClick={() => onReject(leave.id)}
                                    isLoading={isLoading}
                                >
                                    Reject
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
