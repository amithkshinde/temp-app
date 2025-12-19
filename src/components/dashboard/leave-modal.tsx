import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { findOverlappingLeave } from '@/lib/leave-utils';
import { Leave, PublicHoliday } from '@/lib/types';
import { differenceInCalendarDays, startOfToday, parseISO, isWithinInterval, format } from 'date-fns';
import { Select } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { ScrollContainer } from '@/components/ui/scroll-container';

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
    leaves?: Leave[];
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
    existingLeaveId, isDemo, holidays = [], leaves = []
}: LeaveModalProps) {
    // Mode State
    // Detect range mode if editing existing leave with diff dates
    const initialIsRange = !!(initialEndDate && initialEndDate !== initialStartDate);
    const [isRangeMode, setIsRangeMode] = useState(initialIsRange);

    // Form State
    const [startDate, setStartDate] = useState(initialStartDate);

    // Auto-sync EndDate on init: if not range mode, EndDate = StartDate
    const derivedInitialEndDate = initialIsRange ? (initialEndDate || initialStartDate) : initialStartDate;

    // Helper for Smart Defaults
    const getSmartDefaults = (date: string) => {
        if (!date) return { type: 'Personal', details: '' };
        const s = parseISO(date);
        const today = startOfToday();
        const diff = differenceInCalendarDays(s, today);
        if (diff >= 0 && diff <= 1) return { type: 'Sick', details: 'Sick Leave' };
        return { type: 'Personal', details: '' };
    };

    const initialDefaults = getSmartDefaults(initialStartDate);

    const [endDate, setEndDate] = useState(derivedInitialEndDate);
    const [reasonType, setReasonType] = useState(initialDefaults.type);
    const [reasonDetails, setReasonDetails] = useState(initialDefaults.details);
    const [isLoading, setIsLoading] = useState(false);

    // Progressive Disclosure State
    // Details are hidden by default for new requests, but shown for:
    // 1. Existing leaves (Edit mode)
    const initialShowDetails = !!existingLeaveId;
    const [showDetails, setShowDetails] = useState(initialShowDetails);

    // Sync EndDate when StartDate changes in Single Mode
    // Also update Reason default based on date distance
    const handleStartDateChange = (val: string) => {
        setStartDate(val);

        // Smart Default Logic
        if (val) {
            const s = parseISO(val);
            const today = startOfToday();
            const diff = differenceInCalendarDays(s, today);
            // "For today and today + 1, set the default reason = Sick Leave."
            if (diff >= 0 && diff <= 1) {
                setReasonType('Sick');
                setReasonDetails('Sick Leave');
                // Don't auto-show details, let it be hidden but pre-filled
            } else {
                setReasonType('Personal');
                if (reasonDetails === 'Sick Leave') {
                    setReasonDetails('');
                    setShowDetails(false); // Hide details again if reverting from Sick default
                }
            }
        }

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

    // Existing Leave Overlap Check
    const overlappingLeave = (startObj && endObj && leaves) ? findOverlappingLeave(startObj, endObj, leaves, existingLeaveId) : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (isDemo) {
            alert('This is a demo. Actions are disabled.');
            setIsLoading(false);
            return;
        }

        if (overlappingLeave) {
            alert(`Cannot request leave: You already have a leave for this period (${overlappingLeave.status}).`);
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

    // Read-Only Logic for Past Approved Leaves (All Modes)
    const currentLeave = (isExisting && leaves) ? leaves.find(l => l.id === existingLeaveId) : null;
    const isPastApproved = currentLeave?.status === 'approved' && parseISO(currentLeave.endDate) < startOfToday();
    const isReadOnly = isPastApproved;

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

                <ScrollContainer className="max-h-[70vh]" contentClassName="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Mode Toggle - Segmented Control */}
                        {!isExisting && (
                            <div className="flex bg-slate-100 p-1 rounded-[10px] shadow-inner select-none">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRangeMode(false);
                                        // Reset end date to start date when switching to single
                                        if (startDate) setEndDate(startDate);
                                    }}
                                    className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all duration-200 ${!isRangeMode
                                        ? 'bg-white text-gray-900 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-900'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isReadOnly}
                                >
                                    Single-Date
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsRangeMode(true)}
                                    className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all duration-200 ${isRangeMode
                                        ? 'bg-white text-gray-900 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-900'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isReadOnly}
                                >
                                    Multi-Day
                                </button>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div className="relative">
                                {/* Label based on mode */}
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                                    {isRangeMode ? 'From' : 'Date'}
                                </label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                        required
                                        disabled={isLoading || isReadOnly}
                                        className="font-medium text-gray-900 pr-9" // Padding for icon
                                    />
                                    {/* Calendar Icon Absolute Right */}
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* End Date - Only in Range Mode */}
                            {isRangeMode && (
                                <div className="relative">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                                        To
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            required
                                            min={startDate}
                                            disabled={isLoading || isReadOnly}
                                            className="font-medium text-gray-900 pr-9"
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reason Selection */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Choose a Reason</label>
                                <Select
                                    value={reasonType}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setReasonType(val);
                                        if (val === 'Sick') {
                                            setReasonDetails('Sick Leave');
                                        } else if (reasonDetails === 'Sick Leave') {
                                            setReasonDetails('');
                                        }
                                    }}
                                    options={availableReasons}
                                    className="font-medium text-gray-900"
                                    disabled={isReadOnly}
                                />
                            </div>

                            {/* Details: Progressive Disclosure */}
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
                                {!showDetails ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDetails(true)}
                                        className="text-xs font-semibold text-gray-500 hover:text-gray-900 hover:underline transition-colors flex items-center gap-1"
                                    >
                                        + Add details
                                    </button>
                                ) : (
                                    <>
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                                            Details {reasonType !== 'Other' && '(Optional)'}
                                        </label>
                                        <textarea
                                            autoFocus={!isExisting && !isReadOnly} // Auto-focus when revealed in create mode
                                            className="flex w-full rounded-xl border border-slate-200 bg-transparent px-3 py-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-pink)] disabled:cursor-not-allowed disabled:opacity-50 resize-none text-gray-900 placeholder:text-gray-500"
                                            rows={3}
                                            value={reasonDetails}
                                            onChange={(e) => setReasonDetails(e.target.value)}
                                            placeholder={currentReasonConfig.placeholder}
                                            required={reasonType === 'Other'}
                                            disabled={isReadOnly}
                                        />
                                    </>
                                )}
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
                                <span className="font-medium">
                                    Sick leave is automatically approved.
                                </span>
                            </div>
                        )}

                        {isExisting && !isReadOnly && (
                            <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                <span>⚠️</span>
                                Note: Editing a leave request will reset its status to &apos;Pending&apos;.
                            </div>
                        )}

                        {overlappingLeave && (
                            <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                <span>⛔</span>
                                <div className="font-medium">
                                    You already have a {overlappingLeave.status} leave for this period ({overlappingLeave.startDate}).
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            {isReadOnly ? (
                                <div className="flex items-center gap-4 w-full">
                                    <span className="text-xs text-gray-500 italic mr-auto">
                                        Past leaves cannot be edited.
                                    </span>
                                    <Button type="button" variant="ghost" onClick={onClose}>
                                        Close
                                    </Button>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    </form>
            </div>
        </div >
        </div >
    );
}
