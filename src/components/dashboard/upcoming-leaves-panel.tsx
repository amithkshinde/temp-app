import { Leave } from '@/lib/types';
import { getLeaveVisualStatus, getVisualConfig } from '@/lib/leave-utils';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, isWithinInterval, isBefore, startOfToday } from 'date-fns';
import { ScrollContainer } from '@/components/ui/scroll-container';
import { DateCard } from '@/components/ui/date-card';
import { PublicHoliday } from '@/data/holiday-data';

interface UpcomingLeavesPanelProps {
    leaves: Leave[];
    holidays?: PublicHoliday[];
    selectedHolidayIds?: string[];
    onHolidayClick?: (id: string) => void;
    currentMonth?: Date;
    isLoading: boolean;
    onLeaveClick?: (leave: Leave) => void;
    className?: string;
}

export function UpcomingLeavesPanel({
    leaves,
    holidays = [],
    selectedHolidayIds = [],
    onHolidayClick,
    currentMonth = new Date(),
    isLoading,
    onLeaveClick,
    className
}: UpcomingLeavesPanelProps) {
    if (isLoading) {
        return <div className={`w-80 h-64 animate-pulse bg-slate-50 rounded-xl shrink-0 ${className}`}></div>;
    }

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // 1. Filter Leaves in this month
    const monthLeaves = leaves.filter(l => {
        const start = parseISO(l.startDate);
        // Check overlap with month? Or just start in month?
        // Usually visual calendar shows if it overlaps. simpler: start date in month.
        return isWithinInterval(start, { start: monthStart, end: monthEnd });
    });

    // 2. Filter Holidays in this month
    const monthHolidays = holidays.filter(h => {
        const d = parseISO(h.date);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
    });

    // 3. Combine & Sort
    const combinedEvents = [
        ...monthLeaves.map(l => ({ type: 'leave' as const, date: parseISO(l.startDate), data: l })),
        ...monthHolidays.map(h => ({ type: 'holiday' as const, date: parseISO(h.date), data: h }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());


    return (
        <div className={`w-full bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-4 flex flex-col ${className}`}>
            <h3 className="text-sm text-gray-900 font-semibold tracking-tight mb-3 shrink-0">
                {format(currentMonth, 'MMMM yyyy')}
            </h3>

            {combinedEvents.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                    No events this month.
                </div>
            ) : (
                <ScrollContainer className="flex-1 min-h-0" contentClassName="pr-4 space-y-3">
                    {combinedEvents.map((event) => {
                        if (event.type === 'leave') {
                            const leave = event.data as Leave;
                            const startDate = parseISO(leave.startDate);
                            const endDate = parseISO(leave.endDate);
                            const singleDay = isSameDay(startDate, endDate);
                            const dateString = singleDay
                                ? format(startDate, 'MMM d')
                                : `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`;

                            const type = leave.type || (leave.status === 'approved' ? 'Sick' : 'Planned');
                            const isSick = type === 'sick' || type === 'Sick';
                            const visualStatus = getLeaveVisualStatus(leave);
                            const config = getVisualConfig(visualStatus);

                            return (
                                <DateCard
                                    key={`leave-${leave.id}`}
                                    title={dateString}
                                    borderColor={config.border}
                                    rightElement={
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${config.bg} ${config.text} ${config.border}`}>
                                            {visualStatus === 'past' ? 'Past' : leave.status}
                                        </span>
                                    }
                                    bottomElement={
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isSick ? 'bg-white text-gray-700 border-gray-300' : 'bg-gray-100 text-gray-900 border-gray-200'
                                                    }`}>
                                                    {isSick ? 'Sick Leave' : 'Planned Leave'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-[#f0216a] opacity-0 group-hover:opacity-100 transition-opacity font-bold hover:underline">
                                                Edit
                                            </span>
                                        </>
                                    }
                                    onClick={() => onLeaveClick?.(leave)}
                                />
                            );
                        } else {
                            // HOLIDAY
                            const holiday = event.data as PublicHoliday;
                            const isSelected = selectedHolidayIds.includes(holiday.id);
                            const dateString = format(parseISO(holiday.date), 'MMM d, yyyy');

                            const isLimitReached = selectedHolidayIds.length >= 10;
                            const today = startOfToday();
                            const holidayDate = parseISO(holiday.date);
                            const isPast = isBefore(holidayDate, today);
                            const isDisabled = isPast || (!isSelected && isLimitReached);

                            // Config for Holiday Visuals
                            const bg = isSelected ? 'bg-amber-50' : 'bg-white';
                            // const border = isSelected ? 'border-amber-400 ring-1 ring-amber-100' : 'border-slate-200';
                            // DateCard handles border via borderColor prop if string, or className.
                            // Let's use custom styling.

                            return (
                                <DateCard
                                    key={`holiday-${holiday.id}`}
                                    title={holiday.name}
                                    className={`${bg} ${isSelected ? 'border-amber-400' : 'border-slate-200'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    rightElement={
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${isSelected
                                            ? 'bg-amber-500 border-amber-500 text-white'
                                            : 'bg-transparent border-slate-300 text-transparent hover:border-amber-400'
                                            }`}>
                                            <span className="text-[10px] font-bold">✓</span>
                                        </div>
                                    }
                                    bottomElement={
                                        <span className={`text-[10px] font-medium ${isSelected ? 'text-amber-700' : 'text-gray-400'}`}>
                                            {dateString} • Public Holiday
                                        </span>
                                    }
                                    onClick={() => {
                                        if (!isDisabled) {
                                            onHolidayClick?.(holiday.id);
                                        }
                                    }}
                                />
                            );
                        }
                    })}
                </ScrollContainer>
            )}
        </div>
    );
}
