
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { startDate: string; endDate: string; reason: string }) => Promise<void>;
    onRemove: () => Promise<void>;
    initialStartDate?: string;
    initialEndDate?: string;
    existingLeaveId?: string;
    isDemo?: boolean;
}

export function LeaveModal({
    isOpen, onClose, onSubmit, onRemove,
    initialStartDate = '', initialEndDate = '',
    existingLeaveId, isDemo
}: LeaveModalProps) {
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStartDate(initialStartDate);
            setEndDate(initialEndDate || initialStartDate);
            setReason('');
        }
    }, [isOpen, initialStartDate, initialEndDate]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (isDemo) {
            alert('This is a demo. Actions are disabled.');
            setIsLoading(false);
            return;
        }
        await onSubmit({ startDate, endDate, reason });
        setIsLoading(false);
        onClose();
    };

    const handleRemove = async () => {
        setIsLoading(true);
        if (isDemo) {
            alert('This is a demo. Actions are disabled.');
            setIsLoading(false);
            return;
        }
        await onRemove();
        setIsLoading(false);
        onClose();
    };

    const isExisting = !!existingLeaveId;
    const isFuture = new Date(startDate) > new Date();

    // Logic: Auto-detect Type
    const getLeaveDetails = () => {
        if (!startDate) return { type: 'Unknown', status: 'Unknown', color: '', isSick: false };
        const start = new Date(startDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const startMidnight = new Date(start);
        startMidnight.setHours(0, 0, 0, 0);

        const diffTime = startMidnight.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 0 = Today, 1 = Tomorrow
        const isSick = diffDays >= 0 && diffDays <= 1;

        return {
            type: isSick ? 'Sick Leave' : 'Planned Leave',
            status: isSick ? 'Auto Approved' : 'Pending Approval',
            color: isSick ? 'text-orange-700 bg-orange-50 ring-1 ring-orange-100' : 'text-blue-700 bg-blue-50 ring-1 ring-blue-100',
            isSick
        };
    };

    const details = getLeaveDetails();

    // Auto-set reason if Sick and no reason yet (or force it?)
    // User says: "Leave type auto-set to Sick Leave". 
    // "Reason field" is still shown in user request diagram ("Date... Leave type... Reason field").
    // So we just default it perhaps, or let them type. 
    // "No Quick Template for Today... Instead... Reason field".

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[var(--radius-xl)] shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header Pattern */}
                <div className={`h-2 w-full ${details.isSick ? 'bg-orange-500' : 'bg-blue-500'}`} />

                <div className="p-6 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {isExisting ? 'Manage Leave' : (details.isSick ? 'Mark Sick Leave' : 'Request Leave')}
                            </h2>
                            {details.isSick && !isExisting && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Take care! sick leave is auto-approved.
                                </p>
                            )}
                        </div>
                        {startDate && (
                            <div className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wide ${details.color}`}>
                                {isExisting ? 'Editing' : details.status}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Start Date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <Input
                                label="End Date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Quick Template: Hide if Sick (Today/Tomorrow) */}
                        {!isExisting && !details.isSick && (
                            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Select</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Personal Emergency', 'Vacation', 'Casual Leave', 'Appointments'].map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setReason(opt)}
                                            className={`text-xs p-2 rounded-lg border transition-all ${reason === opt ? 'bg-brand-pink text-white border-brand-pink' : 'bg-white border-slate-200 hover:border-brand-pink text-slate-600'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium block mb-1.5 text-gray-700">
                                {details.isSick ? 'Reason (Optional)' : 'Reason for Leave'}
                            </label>
                            <textarea
                                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)]/20 focus:border-[var(--color-brand-pink)] transition-all resize-none"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder={details.isSick ? "Not feeling well..." : "Please describe your leave..."}
                                required
                            />
                        </div>

                        {isExisting && (
                            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs flex items-center gap-2">
                                <span>ℹ️</span>
                                Updating a leave will reset its status to Pending.
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            {isExisting ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 mr-auto"
                                        onClick={async () => {
                                            if (!confirm('Are you sure you want to cancel this leave?')) return;
                                            await handleRemove();
                                        }}
                                        disabled={isLoading}
                                    >
                                        Cancel Leave
                                    </Button>
                                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                                        Close
                                    </Button>
                                    <Button type="submit" isLoading={isLoading}>
                                        Update Leave
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={isLoading}
                                        className={details.isSick ? "bg-orange-600 hover:bg-orange-700 text-white border-none" : "bg-brand-pink hover:bg-brand-pink/90 text-white border-none"}
                                    >
                                        {details.isSick ? 'Confirm Sick Leave' : 'Submit Request'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

