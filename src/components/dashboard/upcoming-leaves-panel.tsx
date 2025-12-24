import { Leave } from '@/lib/types';
import { getLeaveVisualStatus, getVisualConfig } from '@/lib/leave-utils';
import { format, parseISO, isSameDay, startOfToday, isAfter, isSameDay as isSameDate } from 'date-fns';
import { ScrollContainer } from '@/components/ui/scroll-container';
import { DateCard } from '@/components/ui/date-card';
import { PublicHoliday } from '@/data/holiday-data';

interface UpcomingLeavesPanelProps {
    leaves: Leave[];
    holidays?: PublicHoliday[];
    selectedHolidayIds?: string[];
    isLoading: boolean;
    onLeaveClick?: (leave: Leave) => void;
    className?: string; // e.g. h-[600px]
}

export function UpcomingLeavesPanel({
    leaves,
    holidays = [],
    selectedHolidayIds = [],
    isLoading,
    onLeaveClick,
    className
}: UpcomingLeavesPanelProps) {
    if (isLoading) {
        return <div className={`w-80 h-64 animate-pulse bg-slate-50 rounded-xl shrink-0 ${className}`}></div>;
    }

    const today = startOfToday();

    // 1. Filter Leaves
    const activeLeaves = leaves.filter(l => {
        const start = parseISO(l.startDate);
        const end = parseISO(l.endDate);
        return l.status !== 'cancelled' && (isAfter(end, today) || isSameDate(end, today));
    });

    // 2. Filter Holidays (Selected & Upcoming)
    const upcomingHolidays = holidays.filter(h => {
        const d = parseISO(h.date);
        return isAfter(d, today) || isSameDate(d, today);
        // Only show SELECTED holidays?? 
        // Prompt rule 5: "Public holidays must appear in the upcoming leaves panel... styled distinctively". 
        // Typically user wants to see "Days Off", which includes Selected Holidays.
        // Assuming we only show selected ones as "Leaves".
    }).filter(h => selectedHolidayIds.includes(h.id));

    // 3. Merge & Sort
    type Item = { type: 'leave', data: Leave } | { type: 'holiday', data: PublicHoliday };

    const items: Item[] = [
        ...activeLeaves.map(l => ({ type: 'leave' as const, data: l })),
        ...upcomingHolidays.map(h => ({ type: 'holiday' as const, data: h }))
    ].sort((a, b) => {
        const dateA = a.type === 'leave' ? parseISO(a.data.startDate) : parseISO(a.data.date);
        const dateB = b.type === 'leave' ? parseISO(b.data.startDate) : parseISO(b.data.date);
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <div className={`w-full bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-4 flex flex-col ${className}`}>
            <h3 className="text-sm text-gray-900 font-semibold tracking-tight mb-3 shrink-0">
                Upcoming Leaves & Holidays
            </h3>

            {items.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                    No upcoming leaves.
                </div>
            ) : (
                <ScrollContainer className="flex-1 min-h-0" contentClassName="pr-4 space-y-4">
                    {items.map((item) => {
                        if (item.type === 'leave') {
                            const leave = item.data;
                            const startDate = parseISO(leave.startDate);
                            const endDate = parseISO(leave.endDate);
                            const singleDay = isSameDay(startDate, endDate);
                            const dateString = singleDay
                                ? format(startDate, 'MMM d, yyyy')
                                : `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`;

                            const lType = leave.type || (leave.status === 'approved' ? 'Sick' : 'Planned');
                            const isSick = lType.toLowerCase() === 'sick';
                            const visualStatus = getLeaveVisualStatus(leave);
                            const config = getVisualConfig(visualStatus);

                            return (
                                <DateCard
                                    key={`leave-${leave.id}`}
                                    title={dateString}
                                    borderColor="border-slate-100"
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
                            // Holiday Logic
                            const holiday = item.data;
                            return (
                                <DateCard
                                    key={`holiday-${holiday.id}`}
                                    title={format(parseISO(holiday.date), 'MMM d, yyyy')}
                                    borderColor="border-amber-200 bg-amber-50/50" // Distinctive style
                                    rightElement={
                                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border bg-amber-100 text-amber-900 border-amber-200">
                                            Holiday
                                        </span>
                                    }
                                    bottomElement={
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-gray-800">
                                                {holiday.name}
                                            </span>
                                        </div>
                                    }
                                    // Holiday click could open details or deselect? Prompt doesn't specify action in panel.
                                    // Make non-clickable for now? Or pass handler?
                                    // For now, no click handler passed.
                                    onClick={undefined}
                                />
                            );
                        }
                    })}
                </ScrollContainer>
            )}
        </div>
    );
}
