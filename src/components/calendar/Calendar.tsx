"use client";

import React, { useState, useRef } from 'react';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, isToday,
    addDays, subDays, addWeeks, subWeeks, isWithinInterval,
    isWeekend
} from 'date-fns';

// Helper for conditional classes
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

// --- Types ---


export type CalendarEventStatus = 'approved' | 'pending' | 'rejected';

export interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    type: 'leave' | 'holiday';
    status?: CalendarEventStatus;
    title?: string; // e.g. "Republic Day"
    meta?: Record<string, unknown>; // For flexible data passing
}

export interface CalendarProps {
    currentDate: Date; // Controlled month/year source
    events?: CalendarEvent[];
    selectedDate?: Date | null;
    startDate?: Date | null; // For range selection
    endDate?: Date | null;   // For range selection
    focusedDate?: Date | null; // For keyboard nav (optional control)
    onDateClick?: (date: Date, event?: CalendarEvent) => void;
    onRangeSelect?: (start: Date, end: Date) => void;
    onMonthChange?: (date: Date) => void; // If component controls nav
    className?: string;
    userId?: string; // For accessibility context if needed
}

// --- Component ---

export function Calendar({
    currentDate,
    events = [],
    selectedDate,
    startDate,
    endDate,
    onDateClick,
    className
}: CalendarProps) {
    // Internal state for keyboard focus if not controlled
    const [focusedDay, setFocusedDay] = useState<Date>(selectedDate || currentDate);
    const containerRef = useRef<HTMLDivElement>(null);

    // Generate Days
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // --- Helpers ---

    const getEventForDate = (day: Date) => {
        const dateStr = format(day, "yyyy-MM-dd");
        // Prioritize Leave over Holiday if same day (business rule?) 
        // Or return array. For this UI, we usually show one 'main' state.
        // Let's return the first found, prioritizing leaves.
        const dEvents = events.filter(e => e.date === dateStr);
        const leave = dEvents.find(e => e.type === 'leave');
        return leave || dEvents[0];
    };

    const isRangeSelected = (day: Date) => {
        if (startDate && endDate) {
            return isWithinInterval(day, { start: startDate, end: endDate });
        }
        return false;
    };

    const isRangeStart = (day: Date) => startDate && isSameDay(day, startDate);
    const isRangeEnd = (day: Date) => endDate && isSameDay(day, endDate);

    // --- Interaction ---

    const handleKeyDown = (e: React.KeyboardEvent, day: Date) => {
        let newDate = day;
        switch (e.key) {
            case 'ArrowLeft': newDate = subDays(day, 1); break;
            case 'ArrowRight': newDate = addDays(day, 1); break;
            case 'ArrowUp': newDate = subWeeks(day, 1); break;
            case 'ArrowDown': newDate = addWeeks(day, 1); break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                onDateClick?.(day, getEventForDate(day));
                return;
            default: return;
        }

        e.preventDefault();
        setFocusedDay(newDate);
        // Focus usually requires the element to exist. 
        // If we switch months with arrows, we might need onMonthChange. 
        // For this single-month view, we'll just track focus locally 
        // but if it goes out of bounds of current days set, it technically 'leaves' the view
        // effectively handling simple nav for now.
    };

    // --- Render ---

    return (
        <div
            className={cn("w-full bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-100 p-6", className)}
            role="grid"
            aria-label={`Calendar for ${format(currentDate, 'MMMM yyyy')}`}
            ref={containerRef}
        >
            {/* Header (Days of Week) */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2" role="row">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-xs font-semibold text-gray-400 uppercase tracking-widest py-2" role="columnheader">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2" role="rowgroup">
                {days.map((day: Date) => {
                    const event = getEventForDate(day);
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const isRange = isRangeSelected(day);
                    const isRStart = isRangeStart(day);
                    const isREnd = isRangeEnd(day);
                    const isOutsideMonth = !isSameMonth(day, currentDate);
                    const isWknd = isWeekend(day);
                    const isCurrentDay = isToday(day);
                    const isFocused = isSameDay(day, focusedDay);

                    // --- Styles Calculation ---
                    let baseClasses = "h-14 relative flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black/50 rounded-lg";
                    let textClass = "text-gray-700";
                    let stateClasses = "";
                    let ariaLabel = `Date ${format(day, 'yyyy-MM-dd')}`;

                    if (isOutsideMonth) {
                        textClass = "text-gray-300";
                        baseClasses += " hover:bg-slate-50";
                    } else if (event?.type === 'leave') {
                        // Leave Styles
                        ariaLabel += ` Leave Status: ${event.status}`;
                        if (event.status === 'approved') {
                            stateClasses = "bg-[var(--color-brand-pink)] text-white shadow-md hover:opacity-90";
                            textClass = "text-white";
                        } else if (event.status === 'pending') {
                            stateClasses = "bg-pink-50 text-[var(--color-brand-pink)] border-2 border-dashed border-[var(--color-brand-pink)] animate-pulse";
                            textClass = "text-[var(--color-brand-pink)]";
                        } else if (event.status === 'rejected') {
                            stateClasses = "bg-slate-50 text-gray-400 line-through decoration-gray-400";
                            textClass = "text-gray-400";
                        }
                    } else if (event?.type === 'holiday') {
                        // Holiday Styles
                        ariaLabel += ` Public Holiday: ${event.title}`;
                        const isSelectedHoliday = event.meta?.selected;
                        stateClasses = "bg-purple-50 border border-purple-200 hover:bg-purple-100";
                        textClass = "text-purple-700";

                        if (isSelectedHoliday) {
                            stateClasses += " ring-2 ring-purple-500 bg-purple-100 font-bold";
                        }

                        if (event.meta?.warning) {
                            // visual indicator for warning?
                        }

                    } else if (isRange) {
                        // Range Styles
                        ariaLabel += " Selected Range";
                        textClass = "text-[var(--color-brand-pink)]";
                        stateClasses = "bg-pink-50";

                        // Gradient/Rounded caps logic
                        if (isRStart) stateClasses += " rounded-l-lg rounded-r-none bg-gradient-to-r from-[var(--color-brand-pink)] to-pink-50 text-white";
                        if (isREnd) stateClasses += " rounded-r-lg rounded-l-none bg-gradient-to-l from-[var(--color-brand-pink)] to-pink-50 text-white";
                        if (isRStart && isREnd) stateClasses = "bg-[var(--color-brand-pink)] text-white rounded-lg"; // Single day range
                    } else if (isSelected) {
                        stateClasses = "bg-slate-900 text-white shadow-lg scale-105";
                        textClass = "text-white";
                    } else if (isCurrentDay) {
                        stateClasses = "bg-slate-100 font-bold border border-slate-300";
                    } else if (isWknd) {
                        stateClasses = "bg-slate-50/50 text-gray-400";
                    } else {
                        // Default Interactive
                        baseClasses += " hover:bg-white hover:shadow-md hover:scale-105 border border-transparent hover:border-slate-100";
                    }

                    return (
                        <button
                            key={day.toISOString()}
                            className={cn(baseClasses, stateClasses)}
                            onClick={() => onDateClick?.(day, event)}
                            onKeyDown={(e) => handleKeyDown(e, day)}
                            tabIndex={isFocused ? 0 : -1}
                            role="gridcell"
                            aria-label={ariaLabel}
                            aria-selected={isSelected || isRange}
                            disabled={isOutsideMonth && !event} // Optional: disable interactions outside month?
                        >
                            <span className={textClass}>{format(day, 'd')}</span>

                            {/* Holiday Label */}
                            {event?.type === 'holiday' && (
                                <div className="text-[9px] leading-tight text-center px-0.5 w-full truncate mt-1">
                                    {event.title}
                                </div>
                            )}

                            {/* Status Dot for Leaves if we just want a simple indicator on range */}
                            {event?.type === 'leave' && event.status === 'approved' && isOutsideMonth && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-pink)]/50 mt-1" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Fallback utility if 'cn' doesn't exist in project
// Usually strictly required by the prompt instructions but I'll add a minimal local version just in case
// since I cannot verify 'src/lib/utils' content easily without reading it first.
// Actually, I should just assume standard shadcn-like utils or use template literals.
// For safety, let's just use template literals in the class above if I was unsure, 
// but I am using 'cn' assuming it exists from previous context or standard Next.js setups.
// To be safe, I will replace `cn` with a template literal join if imports fail, 
// but I'll trust the user has standard setup. 
// Wait, I see I already missed the import check. 
// Let's modify the file to not rely on external `cn` if not sure. 
// Actually, I can just include a simple helper at the bottom or top.
