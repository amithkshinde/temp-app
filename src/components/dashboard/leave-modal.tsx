
import { useState } from 'react';
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

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setStartDate(initialStartDate);
            setEndDate(initialEndDate || initialStartDate);
            setReason('');
        }
    }

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

    // Logic: Auto-detect Type
    const getLeaveDetails = () => {
        if (!startDate) return { type: 'Unknown', status: 'Unknown', className: '', isSick: false };
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
            className: isSick
                ? 'text-gray-900 border border-gray-300 bg-gray-50'
                : 'text-gray-900 border border-gray-300 bg-white',
            isSick
        };
    };

    const details = getLeaveDetails();

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white rounded-t-[var(--radius-xl)] md:rounded-[var(--radius-xl)] shadow-xl w-full md:max-w-md overflow-hidden flex flex-col max-h-[85vh] md:max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">

                <div className="p-6 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {isExisting ? 'Manage Leave' : (details.isSick ? 'Mark Sick Leave' : 'Request Leave')}
                            </h2>
                            {details.isSick && !isExisting && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Sick leave for today/tomorrow is auto-approved.
                                </p>
                            )}
                        </div>
                        {startDate && (
                            <div className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wide ${details.className}`}>
                                {isExisting ? 'Editing' : details.status}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Start Date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                disabled={isLoading}
                                className="font-medium"
                            />
                            <Input
                                label="End Date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                disabled={isLoading}
                                className="font-medium"
                            />
                        </div>

                        {/* Quick Template */}
                        {!isExisting && (
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-900 block">
                                    {details.isSick ? 'Quick Sick Reasons' : 'Quick Presets'}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(details.isSick
                                        ? ['Viral Fever', 'Stomach Bug', 'Migraine', 'Personal Emergency']
                                        : ['Vacation - Family', 'Personal Works', 'Casual Leave', 'Doctor Appointment']
                                    ).map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setReason(opt)}
                                            className={`text-xs p-2 rounded-lg border transition-all font-medium ${reason === opt ? 'bg-[#f0216a] text-white border-[#f0216a]' : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-semibold text-gray-900 block mb-2">
                                {details.isSick ? 'Reason (Optional)' : 'Reason for Leave'}
                            </label>
                            <textarea
                                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f0216a]/20 focus:border-[#f0216a] transition-all resize-none text-[#1A1A1A]"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder={details.isSick ? "Not feeling well..." : "Please describe your leave..."}
                                required
                            />
                        </div>

                        {isExisting && (
                            <div className="p-3 bg-gray-50 border border-gray-100 text-gray-600 rounded-lg text-xs flex items-center gap-2">
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
                                    <Button type="submit" isLoading={isLoading} className="bg-[#f0216a] hover:bg-[#d61b5c] text-white">
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
                                        className="bg-[#f0216a] hover:bg-[#d61b5c] text-white border-none"
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

