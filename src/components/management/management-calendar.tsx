import { useState } from 'react';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameDay, isToday, isWeekend, addMonths, subMonths,
    startOfWeek, endOfWeek, isWithinInterval, parseISO
} from 'date-fns';
import { Leave } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface ManagementCalendarProps {
    leaves: Leave[]; // Expects enriched leaves with userName
    onDateClick: (date: Date) => void;
    selectedDate: Date | null;
}

export function ManagementCalendar({ leaves, onDateClick, selectedDate }: ManagementCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Pre-calculate leaves per day map for performance if needed, 
    // but for <100 leaves array filter is fine.
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

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-100 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
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

            <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
                {days.map((day) => {
                    const dayLeaves = getLeavesForDate(day);
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    // const isWknd = isWeekend(day); // Unused
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    let cellStyles = "min-h-[80px] rounded-lg p-2 flex flex-col items-start justify-start text-sm transition-colors cursor-pointer border";
                    let textStyles = "font-medium mb-1";

                    if (isSelected) {
                        cellStyles += " border-[var(--color-brand-pink)] ring-1 ring-[var(--color-brand-pink)] bg-pink-50";
                        textStyles += " text-[var(--color-brand-pink)]";
                    } else if (!isCurrentMonth) {
                        cellStyles += " border-transparent text-gray-300";
                    } else if (isToday(day)) {
                        cellStyles += " border-slate-300 bg-slate-50";
                        textStyles += " text-slate-900";
                    } else {
                        cellStyles += " border-slate-100 hover:border-slate-300 bg-white";
                        textStyles += " text-slate-700";
                    }

                    return (
                        <div
                            key={day.toISOString()}
                            className={cellStyles}
                            onClick={() => onDateClick(day)}
                        >
                            <span className={textStyles}>{format(day, 'd')}</span>

                            <div className="flex flex-wrap gap-1 content-start w-full">
                                {dayLeaves.slice(0, 3).map(l => (
                                    <div
                                        key={l.id}
                                        title={l.userName}
                                        className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-full text-white font-bold
                                    ${l.status === 'approved' ? 'bg-[var(--color-brand-pink)]' : 'bg-orange-400 animate-pulse'}
                                `}
                                    >
                                        {getInitials(l.userName)}
                                    </div>
                                ))}
                                {dayLeaves.length > 3 && (
                                    <div className="text-[10px] w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold">
                                        +{dayLeaves.length - 3}
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
