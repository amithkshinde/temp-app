
import { Leave, User } from '@/lib/types';
import { format, parseISO, isAfter, startOfToday, isSameDay } from 'date-fns';
import { ScrollContainer } from '@/components/ui/scroll-container';
import { PublicHoliday } from '@/data/holiday-data';

interface TeamUpcomingPanelProps {
    leaves: Leave[];
    holidays?: PublicHoliday[]; // New
    users: User[];
    isLoading: boolean;
}

export function TeamUpcomingPanel({ leaves, holidays = [], users, isLoading }: TeamUpcomingPanelProps) {
    if (isLoading) {
        return <div className="w-80 h-full animate-pulse bg-slate-50 rounded-xl"></div>;
    }

    const today = startOfToday();

    // 1. Future/Today Leaves (Approved)
    const activeLeaves = leaves.filter(l => {
        const startDate = parseISO(l.startDate);
        return (isAfter(startDate, today) || isSameDay(startDate, today)) && l.status === 'approved';
    });

    // 2. Future/Today Holidays
    const activeHolidays = holidays.filter(h => {
        const d = parseISO(h.date);
        return isAfter(d, today) || isSameDay(d, today);
    });

    // 3. Merge
    type Item = { type: 'leave', data: Leave } | { type: 'holiday', data: PublicHoliday };
    const items: Item[] = [
        ...activeLeaves.map(l => ({ type: 'leave' as const, data: l })),
        ...activeHolidays.map(h => ({ type: 'holiday' as const, data: h }))
    ].sort((a, b) => {
        const dA = a.type === 'leave' ? parseISO(a.data.startDate) : parseISO(a.data.date);
        const dB = b.type === 'leave' ? parseISO(b.data.startDate) : parseISO(b.data.date);
        return dA.getTime() - dB.getTime();
    });

    return (
        <div className="w-full bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-6 h-fit shrink-0">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Leaves & Holidays</h3>

            <ScrollContainer className="max-h-[600px]" contentClassName="pr-2 space-y-4">
                {items.map((item) => {
                    if (item.type === 'leave') {
                        const leave = item.data;
                        const user = users.find(u => u.id === leave.userId);
                        return (
                            <div key={`leave-${leave.id}`} className="p-4 rounded-[var(--radius-xl)] bg-white border border-slate-100 shadow-sm relative pl-4">
                                <div className="absolute left-0 top-4 bottom-4 w-1 bg-green-500 rounded-r"></div>
                                <div className="font-bold text-gray-900 text-sm mb-1">
                                    {user?.name || leave.userId}
                                </div>
                                <div className="text-sm font-medium text-gray-700 mb-1">
                                    {format(parseISO(leave.startDate), 'MMM d')} – {format(parseISO(leave.endDate), 'MMM d')}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <span className="font-semibold text-emerald-600">Approved</span>
                                    <span>•</span>
                                    <span>{leave.reason}</span>
                                </div>
                            </div>
                        );
                    } else {
                        const holiday = item.data;
                        return (
                            <div key={`holiday-${holiday.id}`} className="p-4 rounded-[var(--radius-xl)] bg-amber-50/50 border border-amber-100 shadow-sm relative pl-4">
                                <div className="absolute left-0 top-4 bottom-4 w-1 bg-amber-400 rounded-r"></div>
                                <div className="font-bold text-amber-900 text-sm mb-1">
                                    Public Holiday
                                </div>
                                <div className="text-sm font-medium text-gray-700 mb-1">
                                    {format(parseISO(holiday.date), 'MMMM d, yyyy')}
                                </div>
                                <div className="text-xs text-amber-800 font-semibold">
                                    {holiday.name}
                                </div>
                            </div>
                        );
                    }
                })}

                {items.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No upcoming events.
                    </div>
                )}
            </ScrollContainer>
        </div>
    );
}
