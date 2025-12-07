import { useState } from 'react';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameDay, isToday, isWeekend, addMonths, subMonths,
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
}

export function CalendarView({
    leaves,
    holidays = [],
    selectedHolidayIds = [],
    onDateClick,
    onHolidayClick,
    mode = 'personal',
    onLeaveClick
}: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Helper: Get ALL leaves for a date (for Team View)
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

    return (
        <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex space-x-2">
                    <Button variant="ghost" onClick={prevMonth}>←</Button>
                    <Button variant="ghost" onClick={nextMonth} >→</Button>
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

                    // --- Styles ---
                    const containerClasses = cn(
                        "min-h-[3.5rem] rounded-lg p-1 flex flex-col items-start justify-start text-xs transition-colors cursor-pointer border relative overflow-hidden",
                        isCurrentMonth ? "bg-white" : "bg-slate-50 opacity-50",
                        isToday(day) && "ring-1 ring-blue-400 bg-blue-50",
                        !isCurrentMonth && !dayLeaves.length ? "text-gray-300" : "text-gray-700",
                        (isWknd && !dayLeaves.length) ? "bg-slate-50 text-slate-400" : "hover:border-slate-300",
                        holiday ? "bg-purple-50 hover:bg-purple-100 border-purple-100" : "border-transparent"
                    );

                    // --- Conflict Check (Team Mode) ---
                    const isConflict = mode === 'team' && dayLeaves.filter(l => l.status !== 'rejected').length > 2;

                    // --- Interaction ---
                    const handleCellClick = (e: React.MouseEvent) => {
                        // If clicking specifically on a leave badge, we handle that in the badge click
                        // Here is general empty space click
                        if (holiday && onHolidayClick) {
                            onHolidayClick(holiday.id);
                        } else {
                            // If there's a single leave for the day, pass it for potential editing.
                            // Otherwise, pass no leave (for creating a new one).
                            onDateClick(day, dayLeaves.length === 1 ? dayLeaves[0] : undefined);
                        }
                    };

                    // --- Title for tooltip ---
                    let titleText = format(day, 'EEEE, MMMM d, yyyy');
                    if (holiday) {
                        titleText += `\nHoliday: ${holiday.name}`;
                    }
                    if (dayLeaves.length > 0) {
                        titleText += `\nLeaves: ${dayLeaves.map(l => l.userName || l.userId).join(', ')}`;
                    } else if (!holiday) {
                        titleText += '\nClick to request leave';
                    }


                    return (
                        <div
                            key={day.toISOString()}
                            className={containerClasses}
                            onClick={handleCellClick}
                            title={titleText}
                        >
                            {/* Date Number */}
                            <div className="w-full flex justify-between items-start mb-0.5">
                                <span className={cn("font-medium", isToday(day) && "text-blue-600")}>
                                    {format(day, 'd')}
                                </span>
                                {isConflict && (
                                    <AlertCircle size={12} className="text-red-500 animate-pulse" />
                                )}
                            </div>

                            {/* Holiday Label */}
                            {holiday && (
                                <div className="text-[9px] leading-tight text-purple-600 font-medium w-full text-center truncate mb-1">
                                    {holiday.name} {isSelectedHoliday && '✓'}
                                </div>
                            )}

                            {/* Leaves Stack */}
                            <div className="w-full flex flex-col gap-0.5 mt-auto">
                                {dayLeaves.slice(0, 3).map((leave, i) => {
                                    // Personal Mode: Only show 'dot' or 'bar'.
                                    // Team Mode: Show Name + Color
                                    const isApproved = leave.status === 'approved';
                                    const isPending = leave.status === 'pending';

                                    if (mode === 'personal') {
                                        // Personal: Simple Dot/Bar
                                        return (
                                            <div key={leave.id} className={cn(
                                                "h-1.5 w-full rounded-full",
                                                isApproved ? "bg-[var(--color-brand-pink)]" : "bg-amber-400 animate-pulse"
                                            )} />
                                        );
                                    } else {
                                        // Team Mode: Badge
                                        // Mock color based on userId buffer or just alternate
                                        // const colors = ['bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500'];
                                        // const colorClass = colors[leave.userId.charCodeAt(leave.userId.length-1) % colors.length];

                                        return (
                                            <div
                                                key={leave.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onLeaveClick?.(leave);
                                                }}
                                                className={cn(
                                                    "text-[9px] px-1 rounded text-white truncate w-full cursor-pointer hover:opacity-80 transition-opacity",
                                                    isApproved ? "bg-[var(--color-brand-pink)]" : "bg-amber-400 text-black",
                                                    // Add rejected visual just in case
                                                    leave.status === 'rejected' && "line-through opacity-50 bg-gray-400"
                                                )}
                                                title={leave.reason}
                                            >
                                                {/* Use userName if enriched, else 'Emp' */}
                                                {leave.userName || leave.userId}
                                            </div>
                                        );
                                    }
                                })}
                                {dayLeaves.length > 3 && (
                                    <div className="text-[9px] text-gray-400 text-center leading-none">
                                        +{dayLeaves.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

