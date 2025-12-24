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
    className?: string;
    compact?: boolean;
    currentMonth?: Date;
    onMonthChange?: (date: Date) => void;
}

export function CalendarView({
    leaves,
    holidays = [],
    selectedHolidayIds = [],
    onDateClick,
    onHolidayClick,
    mode = 'personal',
    onLeaveClick,
    className,
    compact = false,
    currentMonth: controlledMonth,
    onMonthChange,
}: CalendarViewProps) {
    const [internalMonth, setInternalMonth] = useState(new Date());

    // Use controlled if provided, else internal
    const currentMonth = controlledMonth || internalMonth;

    const handleMonthChange = (newDate: Date) => {
        setInternalMonth(newDate);
        onMonthChange?.(newDate);
    };

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

    const nextMonth = () => handleMonthChange(addMonths(currentMonth, 1));
    const prevMonth = () => handleMonthChange(subMonths(currentMonth, 1));

    return (
        <div className={cn("bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-4", className)}>
            <div className="relative flex items-center justify-center mb-6">
                <Button variant="ghost" onClick={prevMonth} size="sm" className="absolute left-0">←</Button>
                <h2 className="text-base text-gray-700 font-bold tracking-wide uppercase">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <Button variant="ghost" onClick={nextMonth} size="sm" className="absolute right-0">→</Button>
            </div>

            <div className="grid grid-cols-7 gap-[6px] text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-xs font-semibold text-gray-400 uppercase tracking-widest py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-[6px]">
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


                    if (holiday) {
                        // Holidays 
                        if (isSelectedHoliday) {
                            bgClass = "bg-amber-100";
                            borderClass = "border-amber-500"; // Solid for Selected (Accepted)
                            textClass = "text-amber-900 font-bold";
                        } else {
                            bgClass = "bg-amber-50";
                            borderClass = "border-amber-300 border-dashed"; // Dashed for Available
                            textClass = "text-amber-800/70 font-medium";
                        }
                    }
                    else if (dayLeaves.length > 0) {
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
                    const isPastDate = isPast && !isToday(day);

                    // Disabled if:
                    // 1. Past holiday (selected or not)
                    // 2. Past empty day (no leaves)
                    // 3. Selection limit reached for unselected valid holiday
                    const isDisabled = (isPastDate && (!!holiday || dayLeaves.length === 0)) || isSelectionDisabled;

                    const containerClasses = cn(
                        compact ? "min-h-[60px] p-1" : "min-h-[68px] p-1.5",
                        "rounded-lg flex flex-col items-start justify-start text-xs transition-all border relative",
                        bgClass,
                        borderClass,
                        textClass,
                        isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:shadow-md"
                    );

                    // --- Interaction ---
                    const handleCellClick = () => {
                        if (isDisabled) return;

                        if (holiday && onHolidayClick) {
                            // Rule 3: Removing a selected holiday requires 2-step confirmation
                            if (isSelectedHoliday) {
                                // Double check? Actually `window.confirm` is adequate basic 2-step (Click -> Confirm).
                                // Prompt says "Show an 'Are you sure?' modal". Browser confirm is acceptable for "modal" in this context unless we have a specific UI modal.
                                // Given we don't have a generic ConfirmModal component ready, window.confirm is the standard react method for this logic proof.
                                const confirmed = window.confirm(`Are you sure you want to deselect ${holiday.name}? This will remove it from your balance.`);
                                if (!confirmed) return;
                            }
                            onHolidayClick(holiday.id);
                        } else {
                            if (holiday) return; // Should not happen given logic above, but safe guard. Holidays (unselected) are clickable if not disabled.

                            const dominantLeave = dayLeaves[0]; // Logic for leaf
                            onDateClick(day, dominantLeave); // Open Leave Modal
                        }
                    };

                    let titleText = format(day, 'EEEE, MMMM d, yyyy');
                    if (holiday) titleText += `\nHoliday: ${holiday.name} ${isSelectedHoliday ? '(Selected)' : '(Click to select)'}`;
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
                                                    config.indicator
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
            <div className="flex flex-wrap gap-4 py-6 text-xs text-gray-600 justify-center">
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

