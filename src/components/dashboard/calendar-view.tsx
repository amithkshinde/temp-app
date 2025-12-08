import { useState } from 'react';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isToday, isWeekend, addMonths, subMonths,
    startOfWeek, endOfWeek, isWithinInterval, parseISO
} from 'date-fns';
import { Leave } from '@/lib/types';
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
    selectionStart?: Date | null;
    selectionEnd?: Date | null;
}

export function CalendarView({
    leaves,
    holidays = [],
    selectedHolidayIds = [],
    onDateClick,
    onHolidayClick,
    mode = 'personal',
    onLeaveClick,
    selectionStart,
    selectionEnd
}: CalendarViewProps) {
    // View State
    // Removed viewType state per feedback. Defaults to showing leaves.

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Filter leaves
    const getLeavesForDate = (date: Date) => {
        return leaves.filter(leave => {
            const start = parseISO(leave.startDate);
            const end = parseISO(leave.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return isWithinInterval(d, { start, end });
        });
    };

    const getHolidayForDate = (date: Date) => {
        const dStr = format(date, 'yyyy-MM-dd');
        return holidays.find(h => h.date === dStr);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const isDateInRange = (date: Date) => {
        if (!selectionStart) return false;

        // Single selection
        if (!selectionEnd) {
            return isToday(date) ? false : (date.getTime() === selectionStart.getTime());
        }

        const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
        const end = selectionStart < selectionEnd ? selectionEnd : selectionStart;

        // Normalize
        const d = new Date(date); d.setHours(0, 0, 0, 0);
        const s = new Date(start); s.setHours(0, 0, 0, 0);
        const e = new Date(end); e.setHours(0, 0, 0, 0);

        return d >= s && d <= e;
    };

    // Check if date matches exactly start or end (for rounded corners styling)
    const isRangeStart = (date: Date) => selectionStart && date.toDateString() === selectionStart.toDateString();
    const isRangeEnd = (date: Date) => selectionEnd && date.toDateString() === selectionEnd.toDateString();

    return (
        <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <div className="flex space-x-2">
                        <Button variant="ghost" onClick={prevMonth} size="sm">←</Button>
                        <Button variant="ghost" onClick={nextMonth} size="sm">→</Button>
                    </div>
                </div>
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
                    const isWknd = isWeekend(day);
                    const inRange = isDateInRange(day);

                    // Heatmap Logic
                    let bgClass = "bg-white"; // Default working day
                    let borderClass = "border-slate-200"; // Strengthen default border

                    if (!isCurrentMonth) {
                        bgClass = "bg-[#FAFAFA]"; // Solid light grey, no opacity
                        borderClass = "border-slate-100";
                    }
                    else if (inRange) {
                        bgClass = "bg-pink-50";
                        borderClass = "border-pink-300"; // Stronger
                    }
                    else if (holiday) {
                        // Blue - Holiday
                        bgClass = "bg-blue-50 hover:bg-blue-100";
                        borderClass = "border-blue-200";
                    }
                    else if (dayLeaves.length > 0) {
                        const hasApproved = dayLeaves.some(l => l.status === 'approved');
                        const hasPending = dayLeaves.some(l => l.status === 'pending');

                        if (hasApproved) {
                            bgClass = "bg-emerald-50 hover:bg-emerald-100";
                            borderClass = "border-emerald-200";
                        } else if (hasPending) {
                            bgClass = "bg-amber-50 hover:bg-amber-100";
                            borderClass = "border-amber-200";
                        }
                    } else if (isWknd) {
                        bgClass = "bg-[#F8F9FA]"; // Solid
                        borderClass = "border-slate-200";
                    }

                    if (isToday(day)) borderClass = "border-blue-500 ring-1 ring-blue-500";
                    if (isRangeStart(day) || isRangeEnd(day)) borderClass = "ring-2 ring-[var(--color-brand-pink)] border-transparent";


                    const containerClasses = cn(
                        "min-h-[4rem] rounded-lg p-1.5 flex flex-col items-start justify-start text-xs transition-all cursor-pointer border relative",
                        bgClass,
                        borderClass,
                        !isCurrentMonth && "text-gray-300" // Visually dim text but keep bg solid
                    );

                    // --- Conflict Check (Team Mode) ---
                    const isConflict = mode === 'team' && dayLeaves.filter(l => l.status !== 'rejected').length > 2;

                    // --- Interaction ---
                    const handleCellClick = () => {
                        if (holiday && onHolidayClick) {
                            onHolidayClick(holiday.id);
                        } else {
                            onDateClick(day, dayLeaves.length === 1 ? dayLeaves[0] : undefined);
                        }
                    };

                    let titleText = format(day, 'EEEE, MMMM d, yyyy');
                    if (holiday) titleText += `\nHoliday: ${holiday.name}`;
                    if (dayLeaves.length > 0) titleText += `\nLeaves: ${dayLeaves.map(l => l.userName || l.userId).join(', ')}`;

                    return (
                        <div
                            key={day.toISOString()}
                            className={containerClasses}
                            onClick={handleCellClick}
                            title={titleText}
                        >
                            {/* Date Number */}
                            <div className="w-full flex justify-between items-start mb-1">
                                <span className={cn("font-bold", isToday(day) && "text-blue-600", !isCurrentMonth && "text-gray-300 font-normal", isCurrentMonth && "text-gray-700")}>
                                    {format(day, 'd')}
                                </span>
                                {isConflict && (mode === 'team') && (
                                    <AlertCircle size={12} className="text-red-500 animate-pulse" />
                                )}
                            </div>

                            {/* Holiday Label */}
                            {holiday && (
                                <div className="text-[10px] leading-tight text-blue-700 font-bold w-full truncate mb-1 bg-blue-100 px-1 py-0.5 rounded shadow-sm">
                                    {holiday.name} {isSelectedHoliday && '✓'}
                                </div>
                            )}

                            {/* Leaves Stack */}
                            <div className="w-full flex flex-col gap-1 mt-auto">
                                {dayLeaves.slice(0, 3).map((leave) => {
                                    const isApproved = leave.status === 'approved';

                                    if (mode === 'personal') {
                                        return (
                                            <div key={leave.id} className={cn(
                                                "h-1.5 w-full rounded-full shadow-sm",
                                                isApproved ? "bg-emerald-500" : "bg-amber-400"
                                            )} />
                                        );
                                    } else {
                                        // Team View Labels
                                        return (
                                            <div
                                                key={leave.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onLeaveClick?.(leave);
                                                }}
                                                className={cn(
                                                    "text-[9px] px-1 rounded text-white truncate w-full cursor-pointer hover:opacity-90 transition-opacity font-medium shadow-sm",
                                                    isApproved ? "bg-emerald-600" : "bg-amber-500 text-black",
                                                    leave.status === 'rejected' && "line-through opacity-50 bg-gray-400"
                                                )}
                                            >
                                                {leave.userName || leave.userId}
                                            </div>
                                        );
                                    }
                                })}
                                {dayLeaves.length > 3 && (
                                    <div className="text-[9px] text-gray-500 font-bold text-center leading-none">
                                        +{dayLeaves.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500 justify-center">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-50 border border-emerald-100 rounded"></div> Leave Taken</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-50 border border-amber-100 rounded"></div> Pending</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-50 border border-blue-100 rounded"></div> Holiday</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-slate-200 rounded"></div> Working Day</div>
            </div>
        </div>
    );
}

