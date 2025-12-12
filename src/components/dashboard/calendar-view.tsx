import { useState } from 'react';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isToday, isWeekend, addMonths, subMonths,
    startOfWeek, endOfWeek, isWithinInterval, parseISO,
    isBefore, startOfToday
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

                    if (!isCurrentMonth) {
                        bgClass = "bg-[#FAFAFA]";
                        borderClass = "border-slate-100";
                        textClass = "text-gray-300";
                    }
                    else if (isPast) {
                        bgClass = "bg-slate-50";
                        textClass = "text-gray-400";
                    }
                    else if (holiday) {
                        bgClass = "bg-amber-50/50";
                        borderClass = "border-amber-100 border-dashed";
                    }
                    else if (dayLeaves.length > 0) {
                        const hasApproved = dayLeaves.some(l => l.status === 'approved');
                        const hasPending = dayLeaves.some(l => l.status === 'pending');
                        const hasRejected = dayLeaves.some(l => l.status === 'rejected');

                        if (hasApproved) {
                            bgClass = "bg-green-50";
                            borderClass = "border-green-200";
                        } else if (hasPending) {
                            bgClass = "bg-yellow-50";
                            borderClass = "border-yellow-200 border-dashed";
                        } else if (hasRejected) {
                            bgClass = "bg-red-50";
                            borderClass = "border-red-200";
                        }
                    } else if (isWknd) {
                        bgClass = "bg-[#FAFAFA]";
                        borderClass = "border-slate-100";
                        textClass = "text-gray-400";
                    }

                    if (isToday(day)) {
                        borderClass = "border-blue-600 ring-1 ring-blue-600";
                        textClass = "text-blue-700 font-bold";
                    }

                    const isDisabled = isPast && !isToday(day); // Today should be clickable

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
                                    if (mode === 'personal') {
                                        return (
                                            <div key={leave.id} className={cn(
                                                "h-1.5 w-full rounded-full shadow-sm",
                                                leave.status === 'approved' && "bg-green-500",
                                                leave.status === 'pending' && "bg-yellow-400",
                                                leave.status === 'rejected' && "bg-red-400",
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
                                                    leave.status === 'approved' && "bg-green-700",
                                                    leave.status === 'pending' && "bg-yellow-600",
                                                    leave.status === 'rejected' && "bg-red-700 decoration-line-through",
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

