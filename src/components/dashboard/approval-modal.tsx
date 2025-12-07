
import { useState } from 'react';
import { Leave } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { format, parseISO, differenceInDays } from 'date-fns';
import { X, Check } from 'lucide-react';

interface ApprovalModalProps {
    leave: Leave;
    onClose: () => void;
    onApprove: (id: string, note: string) => Promise<void>;
    onReject: (id: string, note: string) => Promise<void>;
}

export function ApprovalModal({ leave, onClose, onApprove, onReject }: ApprovalModalProps) {
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const startDate = parseISO(leave.startDate);
    const endDate = parseISO(leave.endDate);
    const duration = differenceInDays(endDate, startDate) + 1;
    const isRange = duration > 1;

    const handleAction = async (action: 'approve' | 'reject') => {
        setIsSubmitting(true);
        try {
            if (action === 'approve') {
                await onApprove(leave.id, note);
            } else {
                await onReject(leave.id, note);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[var(--radius-xl)] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            Leave Request
                        </h3>
                        <p className="text-sm text-gray-500">
                            Review request details
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* User Info (Mock Name if not present) */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                            {leave.userName?.[0] || leave.userId[0].toUpperCase()}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">{leave.userName || leave.userId}</div>
                            <div className="text-xs text-gray-500 capitalize">{leave.reason} • {duration} Day{duration > 1 ? 's' : ''}</div>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="text-sm font-medium text-gray-700 mb-1">Requested Dates</div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-mono bg-white px-2 py-1 rounded border shadow-sm">
                                {format(startDate, 'MMM d, yyyy')}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="font-mono bg-white px-2 py-1 rounded border shadow-sm">
                                {format(endDate, 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>

                    {/* Note Input */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                            Manager Note (Optional)
                        </label>
                        <textarea
                            className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] resize-none"
                            placeholder="Add a reason or note..."
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleAction('reject')}
                        disabled={isSubmitting}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                    >
                        Reject{isRange ? ' All' : ''}
                    </Button>
                    <Button
                        onClick={() => handleAction('approve')}
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        variant="primary"
                    >
                        Approve{isRange ? ' All' : ''}
                    </Button>
                </div>
            </div>
        </div>
    );
}
