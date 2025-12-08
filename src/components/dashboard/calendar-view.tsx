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
    const [viewType, setViewType] = useState<'my' | 'team' | 'holidays'>('my');

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Filter leaves based on View Type
    const getLeavesForDate = (date: Date) => {
        if (viewType === 'holidays') return [];

        return leaves.filter(leave => {
            // If "My View", only show my leaves (assumed filtered by parent or checking userId if passed)
            // But existing 'leaves' prop usually usually is context driven.
            // If mode is personal, 'leaves' is usually just user's.
            // If mode is team, 'leaves' is everyone's.
            // Let's rely on props:
            // If mode='personal', viewType toggles are less relevant?
            // Requirement 5 implies these 3 views are available.

            // Simplification for MVP:
            // 'my' -> show leaves
            // 'team' -> show leaves (if mode=team)
            // 'holidays' -> show only holidays (hide leaves)

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

                {/* View Toggles */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewType('my')}
                        className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewType === 'my' ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}
                    >
                        My View
                    </button>
                    <button
                        onClick={() => setViewType('team')}
                        className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewType === 'team' ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}
                    >
                        Team
                    </button>
                    <button
                        onClick={() => setViewType('holidays')}
                        className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewType === 'holidays' ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}
                    >
                        Holidays Only
                    </button>
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
                    let bgClass = "bg-white"; // Default working day (White/Grey)
                    let borderClass = "border-transparent";

                    if (!isCurrentMonth) bgClass = "bg-slate-50 opacity-40";
                    else if (inRange) {
                        bgClass = "bg-pink-50";
                        borderClass = "border-pink-200";
                    }
                    else if (holiday) {
                        // Blue - Holiday
                        bgClass = "bg-blue-50 hover:bg-blue-100";
                        borderClass = "border-blue-100";
                    }
                    else if (dayLeaves.length > 0 && viewType !== 'holidays') {
                        const hasApproved = dayLeaves.some(l => l.status === 'approved');
                        const hasPending = dayLeaves.some(l => l.status === 'pending');

                        if (hasApproved) {
                            // Green - Leave Taken
                            bgClass = "bg-emerald-50 hover:bg-emerald-100";
                            borderClass = "border-emerald-100";
                        } else if (hasPending) {
                            // Yellow - Pending
                            bgClass = "bg-amber-50 hover:bg-amber-100";
                            borderClass = "border-amber-100";
                        }
                    } else if (isWknd) {
                        bgClass = "bg-slate-50";
                    }

                    if (isToday(day)) borderClass = "border-blue-400 ring-1 ring-blue-400";
                    if (isRangeStart(day) || isRangeEnd(day)) borderClass = "ring-2 ring-[var(--color-brand-pink)] border-transparent";


                    const containerClasses = cn(
                        "min-h-[4rem] rounded-lg p-1.5 flex flex-col items-start justify-start text-xs transition-all cursor-pointer border relative",
                        bgClass,
                        borderClass
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
                                <span className={cn("font-medium", isToday(day) && "text-blue-600")}>
                                    {format(day, 'd')}
                                </span>
                                {isConflict && viewType === 'team' && (
                                    <AlertCircle size={12} className="text-red-500 animate-pulse" />
                                )}
                            </div>

                            {/* Holiday Label */}
                            {holiday && (
                                <div className="text-[10px] leading-tight text-blue-600 font-medium w-full truncate mb-1 bg-blue-100/50 px-1 py-0.5 rounded">
                                    {holiday.name} {isSelectedHoliday && '✓'}
                                </div>
                            )}

                            {/* Leaves Stack - Visibility depends on ViewType */}
                            {viewType !== 'holidays' && (
                                <div className="w-full flex flex-col gap-1 mt-auto">
                                    {dayLeaves.slice(0, 3).map((leave) => {
                                        const isApproved = leave.status === 'approved';

                                        // In 'my' view, simple dots/lines depending on preference. 
                                        // But users asked for Heatmap. Heatmap is usually background.
                                        // We applied background. Do we still keep the bars? 
                                        // Yes, for specific record details.

                                        if (mode === 'personal' || viewType === 'my') {
                                            // If it's MY view, and I see a leave, it's MY leave.
                                            return (
                                                <div key={leave.id} className={cn(
                                                    "h-1.5 w-full rounded-full",
                                                    isApproved ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
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
                                                        "text-[9px] px-1 rounded text-white truncate w-full cursor-pointer hover:opacity-80 transition-opacity",
                                                        isApproved ? "bg-emerald-500" : "bg-amber-500 text-black",
                                                        leave.status === 'rejected' && "line-through opacity-50 bg-gray-400"
                                                    )}
                                                >
                                                    {leave.userName || leave.userId}
                                                </div>
                                            );
                                        }
                                    })}
                                    {dayLeaves.length > 3 && (
                                        <div className="text-[9px] text-gray-400 text-center leading-none">
                                            +{dayLeaves.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
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

