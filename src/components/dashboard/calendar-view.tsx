import { useState, useEffect } from 'react';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isToday, isWeekend, addMonths, subMonths,
    startOfWeek, endOfWeek, isWithinInterval, parseISO,
    isBefore, startOfToday
} from 'date-fns';
import { Leave } from '@/lib/types';
import { getLeaveVisualStatus, getVisualConfig } from '@/lib/leave-utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PublicHoliday } from '@/data/holiday-data';
import { AlertCircle } from 'lucide-react';

interface CalendarViewProps {
    leaves: Leave[];
    holidays?: PublicHoliday[];
    selectedHolidayIds?: string[];
    onDateClick: (date: Date, existingLeave?: Leave) => void;
    onHolidayClick?: (holidayId: string) => void;
    mode?: 'personal' | 'team';
    onLeaveClick?: (leave: Leave) => void; // For Manager to approve
}

export function CalendarView({
    leaves,
    holidays = [],
    selectedHolidayIds = [],
    onDateClick,
    onHolidayClick,
    mode = 'personal',
    onLeaveClick,
}: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const today = startOfToday();

    // Filter leaves
    useEffect(() => {
        console.log(`[CalendarView Debug] Holidays Loaded: ${holidays.length}`);
    }, [holidays]);

    const getLeavesForDate = (date: Date) => {
        return leaves.filter(leave => {
            const start = parseISO(leave.startDate);
            const end = parseISO(leave.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return isWithinInterval(d, { start, end }) && leave.status !== 'cancelled';
        });
    };

    const getHolidayForDate = (date: Date) => {
        const dStr = format(date, 'yyyy-MM-dd');
        return holidays.find(h => h.date === dStr);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-4">
            <div className="relative flex items-center justify-center mb-6">
                <Button variant="ghost" onClick={prevMonth} size="sm" className="absolute left-0">←</Button>
                <h2 className="text-base text-gray-700 font-bold tracking-wide uppercase">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <Button variant="ghost" onClick={nextMonth} size="sm" className="absolute right-0">→</Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-xs font-semibold text-gray-400 uppercase tracking-widest py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day: Date) => {
                    const dayLeaves = getLeavesForDate(day);
                    const holiday = getHolidayForDate(day);
                    const isSelectedHoliday = holiday && selectedHolidayIds.includes(holiday.id);
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const isPast = isBefore(day, today);
                    const isWknd = isWeekend(day);

                    // Heatmap Logic
                    let bgClass = "bg-white"; // Default working day
                    let borderClass = "border-slate-200";
                    let textClass = "text-gray-900";



                    // Prioritize Leaves over "Past" or "Weekend"
                    if (dayLeaves.length > 0) {
                        // Determine "Dominant" leave for this day
                        // Priority: Approved > Pending > Rejected
                        // But wait, user requirement says: "Holiday > Past > Approved..."
                        // Let's check status of the leaves.

                        // We need to check if ANY leave on this day is in a state that dictates color.
                        // If multiple leaves, which one wins? 
                        // Typically we said "Deduplication" earlier, but here we just render classes.
                        // Let's pick the "best" one to represent the day.
                        // Sort by priority: Approved > Pending > Rejected
                        const visualPriorities = { 'approved': 3, 'pending': 2, 'rejected': 1, 'past': 4 }; // Past overrides all? Wait. 
                        // User Rule: "Past Leave (grey, overrides Approved color)"

                        // So effectively, we should look at the visual status of the leaves.
                        // If any leave is 'past' (which it is if endDate < today), it overrides? 
                        // Wait, if I have a PAST approved leave, it is 'past'.
                        // If I have a FUTURE approved leave, it is 'approved'.

                        // Let's map leaves to visual statuses first.
                        // Since `getLeaveVisualStatus` uses the LEAVE's date, it works for the whole leave.
                        // But here we are on a specific DAY. 
                        // If a leave started 5 days ago and ends tomorrow, and today is today.
                        // The leave "status" is Pending. 
                        // Is it "past"? No, end > today. So it's Pending.
                        // So the whole leave is colored Pending.

                        // What if we have multiple leaves? (Shouldn't happen with dedup, but let's be safe).
                        // Let's take the first one found by our filter.
                        const dominantLeave = dayLeaves[0]; // Simplified as usually 1 per day

                        // Check Visual Status
                        // We need to import the helper first. But this file is huge.
                        // I'll assume I can import it. I'll add the import in a separate step or assume it works if I add it to top.
                        // Actually I need to add the import. I'll do that in a previous step to be safe? 
                        // No, I can't. 
                        // I will rely on the fact that I can edit the file.

                        // Wait, I am editing the logic block.
                        // I will use a simplified logic here if I can't easily import, OR I will add the import.
                        // I will add the import at the top of the file in a separate call to be clean.
                        // For now, let's assuming I can access `getLeaveVisualStatus` if I import it.

                        // RE-READING: "Holiday (highest priority)"
                        // So Holiday check comes first.
                    }

                    if (holiday) {
                        // Holidays also high priority
                        bgClass = "bg-amber-100";
                        borderClass = "border-amber-300 border-dashed";
                        textClass = "text-amber-900 font-bold";
                    }
                    else if (dayLeaves.length > 0) {
                        // Import assumption: `getLeaveVisualStatus` and `getVisualConfig` are available.
                        // I will add the import in the next tool call to be safe, or I can try to add it here but it's far away.
                        // Let's write the logic invoking the function, and I'll add the import in a subsequent edit or PREVIOUS?
                        // I should have added the import first. 
                        // I will abort this edit, add import, then come back? 
                        // No, I can do it in order. I will add import first.

                        // Wait, I am in the middle of a `replace_file_content`.
                        // I will CANCEL this tool call effectively by returning a different thought? 
                        // No, I must complete the tool call. 
                        // I will write the code assuming the import exists, and then add the import.

                        const dominantLeave = dayLeaves[0];
                        const visualStatus = getLeaveVisualStatus(dominantLeave);
                        const config = getVisualConfig(visualStatus);

                        bgClass = config.bg;
                        borderClass = config.border;
                        textClass = config.text;
                    }
                    else if (!isCurrentMonth) {
                        bgClass = "bg-[#FAFAFA]";
                        borderClass = "border-slate-100";
                        textClass = "text-gray-300";
                    }
                    else if (isWknd) {
                        bgClass = "bg-slate-50";
                        borderClass = "border-slate-200";
                        textClass = "text-gray-400";
                    }
                    else if (isPast) {
                        // Past workdays without leaves
                        bgClass = "bg-white";
                        textClass = "text-gray-400";
                    }

                    if (isToday(day)) {
                        borderClass = "border-blue-600 ring-2 ring-blue-100";
                        textClass = cn(textClass, "font-bold text-blue-700");
                    }

                    const isLimitReached = selectedHolidayIds.length >= 10;
                    const isUnselectedHoliday = holiday && !isSelectedHoliday;
                    const isSelectionDisabled = isUnselectedHoliday && isLimitReached;

                    const isDisabled = (isPast && !isToday(day) && dayLeaves.length === 0) || isSelectionDisabled;

                    const containerClasses = cn(
                        "min-h-[4rem] rounded-lg p-1.5 flex flex-col items-start justify-start text-xs transition-all border relative",
                        bgClass,
                        borderClass,
                        textClass,
                        isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:shadow-md"
                    );

                    // --- Interaction ---
                    const handleCellClick = () => {
                        if (isDisabled) return;

                        if (holiday && onHolidayClick) {
                            onHolidayClick(holiday.id);
                        } else {
                            // Single click, no existing selection logic here
                            onDateClick(day, dayLeaves.length === 1 ? dayLeaves[0] : undefined);
                        }
                    };

                    let titleText = format(day, 'EEEE, MMMM d, yyyy');
                    if (holiday) titleText += `\nHoliday: ${holiday.name}`;
                    if (dayLeaves.length > 0) titleText += `\nLeaves: ${dayLeaves.map(l => `${l.userName || l.userId} (${l.status})`).join(', ')}`;

                    // --- Conflict Check (Team Mode) ---
                    const isConflict = mode === 'team' && dayLeaves.filter(l => l.status === 'approved').length > 2;

                    return (
                        <div
                            key={day.toISOString()}
                            className={containerClasses}
                            onClick={handleCellClick}
                            title={titleText}
                        >
                            {/* Date Number */}
                            <div className="w-full flex justify-between items-start mb-1">
                                <span className={cn("font-medium", textClass)}>
                                    {format(day, 'd')}
                                </span>
                                {isConflict && (mode === 'team') && (
                                    <AlertCircle size={12} className="text-red-500 animate-pulse" />
                                )}
                            </div>

                            {/* Holiday Label */}
                            {holiday && (
                                <div className="text-[10px] leading-tight text-amber-900/70 font-bold w-full truncate mb-1 bg-amber-100/50 px-1 py-0.5 rounded">
                                    {holiday.name} {isSelectedHoliday && '✓'}
                                </div>
                            )}

                            {/* Leaves Stack */}
                            <div className="w-full flex flex-col gap-1 mt-auto">
                                {dayLeaves.slice(0, 3).map((leave) => {
                                    const visualStatus = getLeaveVisualStatus(leave);
                                    const config = getVisualConfig(visualStatus);

                                    if (mode === 'personal') {
                                        return (
                                            <div key={leave.id} className={cn(
                                                "h-1.5 w-full rounded-full shadow-sm",
                                                config.indicator
                                            )} />
                                        );
                                    } else {
                                        return (
                                            <div
                                                key={leave.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onLeaveClick?.(leave);
                                                }}
                                                className={cn(
                                                    "text-[9px] px-1 rounded text-white truncate w-full cursor-pointer hover:opacity-90 transition-opacity font-medium shadow-sm",
                                                    config.indicator,
                                                    visualStatus === 'rejected' && "decoration-line-through"
                                                )}
                                            >
                                                {leave.userName || leave.userId}
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 mt-6 text-xs text-gray-600 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-50 border border-green-200 rounded flex items-center justify-center">
                        <div className="w-full h-1.5 bg-green-500 rounded-full mx-1"></div>
                    </div>
                    <span>Approved</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 border-dashed rounded flex items-center justify-center">
                        <div className="w-full h-1.5 bg-yellow-400 rounded-full mx-1"></div>
                    </div>
                    <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-50 border border-red-200 rounded flex items-center justify-center">
                        <div className="w-full h-1.5 bg-red-400 rounded-full mx-1"></div>
                    </div>
                    <span>Rejected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-50 border border-amber-100 border-dashed rounded"></div>
                    <span>Holiday</span>
                </div>
            </div>
        </div>
    );
}

