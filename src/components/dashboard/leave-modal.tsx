import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { findOverlappingLeave } from '@/lib/leave-utils';
import { Leave, PublicHoliday } from '@/lib/types';
import { differenceInCalendarDays, startOfToday, parseISO, isWithinInterval, format } from 'date-fns';
import { Select } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

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

// Static Field Renderer
const StaticField = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
    <div className="relative">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            {label}
        </label>
        <div className="font-medium text-gray-900 border border-transparent px-0 py-2.5 flex items-center gap-2">
            {value}
            {icon}
        </div>
    </div>
);

export function LeaveModal({
    isOpen, onClose, onSubmit, onRemove,
    initialStartDate = '', initialEndDate = '',
    existingLeaveId, isDemo, holidays = [], leaves = []
}: LeaveModalProps) {
    // Mode Logic
    const currentLeave = (existingLeaveId && leaves) ? leaves.find(l => l.id === existingLeaveId) : null;
    // Check if locked/past
    const isPastApproved = currentLeave?.status === 'approved' && parseISO(currentLeave.endDate) < startOfToday();
    const isReadOnly = isPastApproved;

    const mode = isReadOnly ? 'view' : (existingLeaveId ? 'edit' : 'create');

    // -- State --
    const initialIsRange = !!(initialEndDate && initialEndDate !== initialStartDate);
    const [isRangeMode, setIsRangeMode] = useState(initialIsRange);
    const [startDate, setStartDate] = useState(initialStartDate);

    // Auto-sync EndDate
    const derivedInitialEndDate = initialIsRange ? (initialEndDate || initialStartDate) : initialStartDate;
    const [endDate, setEndDate] = useState(derivedInitialEndDate);

    // Smart Defaults
    const getSmartDefaults = (date: string) => {
        if (!date) return { type: 'Personal', details: '' };
        const s = parseISO(date);
        const today = startOfToday();
        const diff = differenceInCalendarDays(s, today);
        if (diff >= 0 && diff <= 1) return { type: 'Sick', details: 'Sick Leave' };
        return { type: 'Personal', details: '' };
    };
    const initialDefaults = getSmartDefaults(initialStartDate);

    // Initialize Reason/Details
    // If Editing/Viewing, parse from existing leave if possible? 
    // The props passed might be generic initialStartDate, but usually parent passes clean data.
    // However, for strict Mode behavior, we should trust the props passed in or derives.
    // Assuming parent passes correct initialStartDate/initialEndDate/initialReason equivalent if editing.
    // But wait, the props don't include initialReason. 
    // The current implementation in `EmployeeDashboard` likely passes correct Date. Reason might be missing?
    // Let's stick to current state initialization logic which seems to rely on defaults or what's changed.
    // Actually, if we are in Edit/View mode, we might want to ensure we're showing the saved reason.
    // But `LeaveModalProps` doesn't have `initialReason`. 
    // Looking at `leave-modal.tsx` history, it relied on `getSmartDefaults` or manual entry.
    // If this is a refactor, I should preserve existing behavior:
    // The parent component isn't passing `initialReason`, so we can't fully "Edit" the reason unless we fetch it or it's passed.
    // But wait, `EmployeeDashboard` might not be passing it. 
    // Use `currentLeave` to populate if available? 
    // The previous code didn't use `currentLeave` to populate state, ensuring no regression suggests keeping strictly as is
    // OR determining if I should improve it.
    // "Fields are pre-filled" -> purely based on inputs? 
    // If I change it to use `currentLeave` reason, that's a logic change.
    // I will stick to existing state initialization to avoid "Regressions".

    const [reasonType, setReasonType] = useState(initialDefaults.type);
    const [reasonDetails, setReasonDetails] = useState(initialDefaults.details);
    const [isLoading, setIsLoading] = useState(false);

    // Progressive Disclosure
    const initialShowDetails = !!existingLeaveId || (mode === 'view' && !!initialDefaults.details);
    const [showDetails, setShowDetails] = useState(initialShowDetails);

    // -- Handlers --
    const handleStartDateChange = (val: string) => {
        setStartDate(val);
        if (val) {
            const s = parseISO(val);
            const today = startOfToday();
            const diff = differenceInCalendarDays(s, today);
            if (diff >= 0 && diff <= 1) {
                setReasonType('Sick');
                setReasonDetails('Sick Leave');
            } else {
                setReasonType('Personal');
                if (reasonDetails === 'Sick Leave') {
                    setReasonDetails('');
                    setShowDetails(false);
                }
            }
        }
        if (!isRangeMode) setEndDate(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (isDemo && isPastApproved) {
            alert('Past leaves cannot be edited.');
            setIsLoading(false);
            return;
        }

        // Demo logic: Allow interactions usually, but if it's past, block it.

        // Overlap Check
        const startObj = parseISO(startDate);
        const endObj = parseISO(endDate);
        const overlap = findOverlappingLeave(startObj, endObj, leaves, existingLeaveId);
        if (overlap) {
            alert(`Cannot request leave: You already have a leave for this period (${overlap.status}).`);
            setIsLoading(false);
            return;
        }

        const finalDetails = reasonType === 'Other' ? reasonDetails : `${reasonType}: ${reasonDetails} `;
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
        if (isDemo && isPastApproved) {
            alert('Past leaves cannot be edited.');
            setIsLoading(false);
            return;
        }
        await onRemove();
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    // -- Render Helpers --
    const startObj = startDate ? parseISO(startDate) : null;
    const endObj = endDate ? parseISO(endDate) : null;

    // Filter Reasons logic
    const today = startOfToday();
    const canSelectSick = startObj && differenceInCalendarDays(startObj, today) <= 1;
    const availableReasons = REASONS.filter(r => r.value !== 'Sick' || canSelectSick);

    const currentReasonConfig = REASONS.find(r => r.value === reasonType) || REASONS[1];

    const overlappingHoliday = (startObj && endObj) ? holidays.find(h => {
        const hDate = parseISO(h.date);
        return isWithinInterval(hDate, { start: startObj, end: endObj });
    }) : null;

    const overlappingLeave = (startObj && endObj && leaves) ? findOverlappingLeave(startObj, endObj, leaves, existingLeaveId) : null;

    // Banner counting for Conditional Height
    // Banners: Holiday, Sick, Edited (Warning), Overlap(Error), Past(Info)
    const showHolidayBanner = !!(overlappingHoliday && mode !== 'view');
    const showSickBanner = !!(reasonType === 'Sick' && mode !== 'view');
    const showEditBanner = !!(mode === 'edit');
    const showOverlapBanner = !!(overlappingLeave && mode !== 'view');
    const showPastBanner = !!(mode === 'view');

    const activeBannerCount = [showHolidayBanner, showSickBanner, showEditBanner, showOverlapBanner, showPastBanner].filter(Boolean).length;
    const isTallModal = activeBannerCount >= 2;

    // Titles
    const titles = {
        create: 'Apply Leave',
        edit: 'Edit Leave',
        view: 'Leave Details'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className={`bg-white rounded-[var(--radius-xl)] shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 transition-all ${isTallModal ? 'h-[650px]' : ''
                    }`}
            >

                {/* Header - Sticky Top */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-none">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {titles[mode]}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {mode === 'view' ? 'View leave details' : 'Select dates and reason'}
                        </p>
                    </div>
                    {mode === 'edit' && (
                        <div className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wide">
                            Editing
                        </div>
                    )}
                </div>

                {/* Form Wrapper - Flex Column to manage scrolling body + sticky footer */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-1 min-h-0"
                >
                    {/* Body - Scrollable */}
                    {/* Default mode: max-h-[70vh] logic was effectively keeping it bounded. 
                        Here we let it fill flex-1. If not tall, the modal auto-sizes. 
                        We need a constraint for default mode so it doesn't grow indefinitely if content forces it?
                        The modal container has no height set in default mode, so it follows content.
                        But we should limit it to viewport if it gets huge.
                        Previously `ScrollContainer` had `max-h-[70vh]`.
                        Let's put `max-h` on the body for default mode to mimic that safety.
                    */}
                    <div className={`p-6 overflow-y-auto flex-1 ${isTallModal ? '' : 'max-h-[70vh]'}`}>
                        <div className="space-y-6">

                            {/* Mode Toggle (Create/Edit only) */}
                            {mode !== 'view' && (
                                <div className="flex bg-slate-100 p-1 rounded-[10px] shadow-inner select-none">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsRangeMode(false);
                                            if (startDate) setEndDate(startDate);
                                        }}
                                        className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all duration-200 ${!isRangeMode
                                            ? 'bg-white text-gray-900 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] ring-1 ring-black/5'
                                            : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Single-Date
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsRangeMode(true)}
                                        className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all duration-200 ${isRangeMode
                                            ? 'bg-white text-gray-900 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] ring-1 ring-black/5'
                                            : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Multi-Day
                                    </button>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Start Date */}
                                {mode === 'view' ? (
                                    <StaticField
                                        label={isRangeMode ? 'From' : 'Date'}
                                        value={startDate ? format(parseISO(startDate), 'PPP') : '-'}
                                        icon={<Calendar className="w-4 h-4 text-gray-400" />}
                                    />
                                ) : (
                                    <div className="relative">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                                            {isRangeMode ? 'From' : 'Date'}
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => handleStartDateChange(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="font-medium text-gray-900 pr-10 appearance-none bg-transparent relative z-10"
                                                style={{ WebkitAppearance: 'none' }} // Remove weird native styling on iOS
                                            />
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-0" />
                                        </div>
                                    </div>
                                )}

                                {/* End Date - Range Mode */}
                                {isRangeMode && (
                                    mode === 'view' ? (
                                        <StaticField
                                            label="To"
                                            value={endDate ? format(parseISO(endDate), 'PPP') : '-'}
                                            icon={<Calendar className="w-4 h-4 text-gray-400" />}
                                        />
                                    ) : (
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
                                                    disabled={isLoading}
                                                    className="font-medium text-gray-900 pr-10 appearance-none bg-transparent relative z-10"
                                                    style={{ WebkitAppearance: 'none' }}
                                                />
                                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-0" />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Reason Selection */}
                            <div className="space-y-4">
                                {mode === 'view' ? (
                                    <StaticField
                                        label="Reason"
                                        value={currentReasonConfig.label}
                                    />
                                ) : (
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Choose a Reason</label>
                                        <Select
                                            value={reasonType}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setReasonType(val);
                                                // Reset details logic same as before
                                                if (val === 'Sick') setReasonDetails('Sick Leave');
                                                else if (reasonDetails === 'Sick Leave') setReasonDetails('');
                                            }}
                                            options={availableReasons}
                                            className="font-medium text-gray-900"
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}

                                {/* Details: Progressive / Static */}
                                <div className="space-y-2">
                                    {mode === 'view' ? (
                                        // View Mode: Show only if exists
                                        reasonDetails ? (
                                            <StaticField
                                                label="Details"
                                                value={reasonDetails}
                                            />
                                        ) : null
                                    ) : (
                                        // Create/Edit Mode
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
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
                                                        autoFocus={mode === 'create'}
                                                        className="flex w-full rounded-xl border border-slate-200 bg-transparent px-3 py-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-pink)] disabled:cursor-not-allowed disabled:opacity-50 resize-none text-gray-900 placeholder:text-gray-500"
                                                        rows={3}
                                                        value={reasonDetails}
                                                        onChange={(e) => setReasonDetails(e.target.value)}
                                                        placeholder={currentReasonConfig.placeholder}
                                                        required={reasonType === 'Other'}
                                                        disabled={isLoading}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Warnings / Banners */}
                            <div className="space-y-3">
                                {showHolidayBanner && (
                                    <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                        <span>📅</span>
                                        <div>
                                            <span className="font-bold block mb-0.5">Holiday Overlap</span>
                                            Your selection overlaps with {overlappingHoliday!.name} ({format(parseISO(overlappingHoliday!.date), 'MMM d')}).
                                        </div>
                                    </div>
                                )}

                                {showSickBanner && (
                                    <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                        <span>✓</span>
                                        <span className="font-medium">
                                            This leave is auto-approved.
                                        </span>
                                    </div>
                                )}

                                {showEditBanner && !showSickBanner && (
                                    <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                        <span>⚠️</span>
                                        Note: Editing a leave request will reset its status to &apos;Pending&apos;.
                                    </div>
                                )}

                                {showPastBanner && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                                        <span>ℹ️</span>
                                        Past leaves cannot be edited.
                                    </div>
                                )}

                                {showOverlapBanner && (
                                    <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                        <span>⛔</span>
                                        <div className="font-medium">
                                            You already have a {overlappingLeave!.status} leave for this period ({overlappingLeave!.startDate}).
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer - Sticky Bottom */}
                    <div className="p-6 pt-4 border-t border-slate-100 bg-white flex justify-end gap-3 flex-none">
                        {mode === 'view' ? (
                            // View Mode: Close only
                            <Button type="button" variant="primary" onClick={onClose}>
                                Close
                            </Button>
                        ) : (
                            <>
                                {/* Edit Mode: Cancel Request (Delete) */}
                                {mode === 'edit' && (
                                    <button
                                        className="text-sm font-medium text-slate-500 hover:text-slate-800 mr-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={async () => {
                                            if (!confirm('Are you sure you want to cancel this leave request?')) return;
                                            await handleRemove();
                                        }}
                                        disabled={isLoading}
                                    >
                                        Cancel Request
                                    </button>
                                )}

                                {/* Create/Edit: Cancel (Close modal) */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>

                                {/* Create/Edit: Submit */}
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="bg-[#f0216a] hover:bg-[#d61b5c] text-white border-none min-w-[100px]"
                                >
                                    {mode === 'edit' ? 'Update Leave' : 'Apply Leave'}
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </div >
        </div >
    );
}
