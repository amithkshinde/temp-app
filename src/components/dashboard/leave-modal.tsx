import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { differenceInCalendarDays, startOfToday, parseISO, isWithinInterval, format } from 'date-fns';
import { Select } from '@/components/ui/select';
import { PublicHoliday } from '@/lib/types';

interface LeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { startDate: string; endDate: string; reason: string }) => Promise<void>;
    onRemove: () => Promise<void>;
    initialStartDate?: string;
    initialEndDate?: string;
    existingLeaveId?: string;
    isDemo?: boolean;
    holidays?: PublicHoliday[];
}

const REASONS = [
    { value: 'Sick', label: 'Sick Leave', placeholder: 'Briefly describe (e.g. Fever, Migraine)' },
    { value: 'Personal', label: 'Personal Leave', placeholder: 'e.g. Renewing passport, Bank appointment' },
    { value: 'Emergency', label: 'Emergency', placeholder: 'e.g. Family emergency, Urgent repairs' },
    { value: 'Other', label: 'Other', placeholder: 'e.g. Friend’s wedding, Family event' },
];

export function LeaveModal({
    isOpen, onClose, onSubmit, onRemove,
    initialStartDate = '', initialEndDate = '',
    existingLeaveId, isDemo, holidays = []
}: LeaveModalProps) {
    // Mode State
    // Detect range mode if editing existing leave with diff dates
    const initialIsRange = !!(initialEndDate && initialEndDate !== initialStartDate);
    const [isRangeMode, setIsRangeMode] = useState(initialIsRange);

    // Form State
    const [startDate, setStartDate] = useState(initialStartDate);

    // Auto-sync EndDate on init: if not range mode, EndDate = StartDate
    const derivedInitialEndDate = initialIsRange ? (initialEndDate || initialStartDate) : initialStartDate;

    const [endDate, setEndDate] = useState(derivedInitialEndDate);
    const [reasonType, setReasonType] = useState('Personal');
    const [reasonDetails, setReasonDetails] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Sync EndDate when StartDate changes in Single Mode
    // We use an explicit handler for StartDate change instead of effect to avoid cascade
    const handleStartDateChange = (val: string) => {
        setStartDate(val);
        if (!isRangeMode) {
            setEndDate(val);
        }
    };

    if (!isOpen) return null;

    // --- Validation Logic ---
    const today = startOfToday();
    const startObj = startDate ? parseISO(startDate) : null;
    const endObj = endDate ? parseISO(endDate) : null;

    // Sick Leave Validation: Only allowed for Today or Tomorrow
    // Logic: If user selects Sick, check dates. Or restrict Sick option based on dates.
    // Spec: "Ensure sick leave appears only for today or today+1"
    const canSelectSick = startObj && differenceInCalendarDays(startObj, today) <= 1;

    // Filter Reasons
    const availableReasons = REASONS.filter(r => r.value !== 'Sick' || canSelectSick);

    // Holiday Overlap Check
    const overlappingHoliday = (startObj && endObj) ? holidays.find(h => {
        const hDate = parseISO(h.date);
        return isWithinInterval(hDate, { start: startObj, end: endObj });
    }) : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (isDemo) {
            alert('This is a demo. Actions are disabled.');
            setIsLoading(false);
            return;
        }

        // Final payload construction
        const finalDetails = reasonType === 'Other'
            ? reasonDetails
            : `${reasonType}: ${reasonDetails} `;

        await onSubmit({
            startDate,
            endDate: isRangeMode ? endDate : startDate,
            reason: finalDetails
        });

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
    const currentReasonConfig = REASONS.find(r => r.value === reasonType) || REASONS[1];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[var(--radius-xl)] shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isExisting ? 'Manage Leave' : 'New Request'}
                        </h2>
                        <p className="text-sm text-gray-500">Select dates and reason</p>
                    </div>
                    {isExisting && (
                        <div className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wide">
                            Editing
                        </div>
                    )}
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Mode Toggle */}
                        {!isExisting && (
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setIsRangeMode(false)}
                                    className={`flex - 1 text - sm font - medium py - 1.5 rounded - md transition - all ${!isRangeMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'} `}
                                >
                                    Single Day
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsRangeMode(true)}
                                    className={`flex - 1 text - sm font - medium py - 1.5 rounded - md transition - all ${isRangeMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'} `}
                                >
                                    Date Range
                                </button>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={isRangeMode ? "" : "col-span-2"}>
                                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Start Date</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="font-medium"
                                />
                            </div>
                            {isRangeMode && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">End Date</label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                        min={startDate}
                                        disabled={isLoading}
                                        className="font-medium"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Reason Selection */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Choose a Reason</label>
                                <Select
                                    value={reasonType}
                                    onChange={(e) => setReasonType(e.target.value)}
                                    options={availableReasons}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                                    Details {reasonType !== 'Other' && '(Optional)'}
                                </label>
                                <textarea
                                    className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-pink)] disabled:cursor-not-allowed disabled:opacity-50 resize-none border-slate-200"
                                    rows={3}
                                    value={reasonDetails}
                                    onChange={(e) => setReasonDetails(e.target.value)}
                                    placeholder={currentReasonConfig.placeholder}
                                    required={reasonType === 'Other'}
                                />
                            </div>
                        </div>

                        {/* Warnings */}
                        {overlappingHoliday && (
                            <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                <span>📅</span>
                                <div>
                                    <span className="font-bold block mb-0.5">Holiday Overlap</span>
                                    Your selection overlaps with {overlappingHoliday.name} ({format(parseISO(overlappingHoliday.date), 'MMM d')}).
                                </div>
                            </div>
                        )}

                        {reasonType === 'Sick' && (
                            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                <span>ℹ️</span>
                                <div>
                                    <span className="font-bold block mb-0.5">Auto-Approval</span>
                                    Sick leave for today/tomorrow is automatically approved.
                                </div>
                            </div>
                        )}

                        {isExisting && (
                            <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                <span>⚠️</span>
                                Note: Editing a leave request will reset its status to &apos;Pending&apos;.
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            {isExisting && (
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
                                    Cancel Request
                                </Button>
                            )}

                            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                                Close
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="bg-[#f0216a] hover:bg-[#d61b5c] text-white border-none min-w-[100px]"
                            >
                                {isExisting ? 'Update' : 'Confirm'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
