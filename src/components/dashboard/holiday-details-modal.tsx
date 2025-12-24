import { PublicHoliday } from '@/data/holiday-data';
import { format, parseISO, startOfToday, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface HolidayDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    holiday: PublicHoliday | null;
    onRemove: (holiday: PublicHoliday) => void;
}

export function HolidayDetailsModal({
    isOpen,
    onClose,
    holiday,
    onRemove
}: HolidayDetailsModalProps) {
    if (!isOpen || !holiday) return null;

    const dateObj = parseISO(holiday.date);
    const today = startOfToday();
    // Assuming holidays are full day, compare start of day. 
    // "Past public holidays: Removal action is disabled"
    const isPast = isBefore(dateObj, today);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[var(--radius-xl)] shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 pb-2">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Holiday Details</h2>
                    <p className="text-sm text-gray-500">Public holiday information</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Name */}
                    <div className="relative">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                            Holiday Name
                        </label>
                        <div className="font-medium text-gray-900 border border-transparent py-2 flex items-center gap-2">
                            {holiday.name}
                        </div>
                    </div>

                    {/* Date */}
                    <div className="relative">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                            Date
                        </label>
                        <div className="font-medium text-gray-900 border border-transparent py-2 flex items-center gap-2">
                            {format(dateObj, 'EEEE, MMMM d, yyyy')}
                            <Calendar className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="relative">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                            Status
                        </label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Accepted
                        </span>
                    </div>

                    {isPast && (
                        <div className="bg-slate-50 text-slate-600 text-xs p-3 rounded-lg flex items-start gap-2 italic">
                            <span>ℹ️</span>
                            Cannot remove past holidays.
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex flex-col items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="w-full"
                    >
                        Close
                    </Button>

                    <button
                        type="button"
                        disabled={isPast}
                        onClick={() => onRemove(holiday)}
                        className="text-sm font-medium text-slate-500 hover:text-slate-800 hover:underline transition-all py-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
                    >
                        Remove holiday
                    </button>
                </div>
            </div>
        </div>
    );
}
