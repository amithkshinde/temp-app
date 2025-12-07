
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Filter, Search, Calendar as CalendarIcon, Info } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isWeekend, isWithinInterval, parseISO } from 'date-fns';
import { Department, Leave, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PublicHoliday } from '@/data/holiday-data';

export default function TeamCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [users, setUsers] = useState<User[]>([]);
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);

    // Filters
    const [department, setDepartment] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showHolidays, setShowHolidays] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);


    const [isLoading, setIsLoading] = useState(true);

    // Fetch Data
    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                // Fetch Users
                let userUrl = `/api/users?role=employee`;
                if (department !== 'All') userUrl += `&department=${department}`;
                const usersRes = await fetch(userUrl);
                const usersData = await usersRes.json();

                // Fetch Leaves (Team Scope) - Ideally filtered by month but mock api is simple
                const leavesRes = await fetch('/api/leaves?scope=team');
                const leavesData = await leavesRes.json();

                // Fetch Holidays
                const holidaysRes = await fetch('/api/holidays');
                const holidaysData = await holidaysRes.json();

                setUsers(usersData);
                setLeaves(leavesData);
                setHolidays(holidaysData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [department, currentDate]); // Re-fetch users if dept changes. Leaves/Holidays could be optimized but simple fetch is fine.

    // Filter Users client-side for search
    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calendar Grid Data
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Helper: Get styles for a leave block
    const getLeaveBlockStyle = (leave: Leave) => {
        const start = parseISO(leave.startDate);
        const end = parseISO(leave.endDate);

        // Clip to current month view
        const effectiveStart = start < monthStart ? monthStart : start;
        const effectiveEnd = end > monthEnd ? monthEnd : end;

        // If completely outside, return null (handled in render loop usually, but handy here)
        if (start > monthEnd || end < monthStart) return null;

        const startDay = effectiveStart.getDate(); // 1-31
        const endDay = effectiveEnd.getDate();

        const duration = endDay - startDay + 1;

        return {
            left: `${((startDay - 1) / daysInMonth.length) * 100}%`,
            width: `${(duration / daysInMonth.length) * 100}%`,
        };
    };

    const isHoliday = (date: Date) => {
        return holidays.some(h => h.date === format(date, 'yyyy-MM-dd'));
    };

    if (isLoading) return <div className="p-8 text-gray-400">Loading calendar...</div>;

    return (
        <div className="min-h-screen bg-[var(--color-bg)] p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/management/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Team Calendar</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-lg font-medium min-w-[140px] text-center">
                                    {format(currentDate, 'MMMM yyyy')}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)]"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Dept Filter */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2">
                            <Filter size={14} className="text-gray-400 mr-2" />
                            <select
                                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                <option value="All">All Departments</option>
                                {Object.keys(Department).map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        {/* Toggle Holidays */}
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                            <input
                                type="checkbox"
                                id="showHolidays"
                                checked={showHolidays}
                                onChange={e => setShowHolidays(e.target.checked)}
                                className="accent-[var(--color-brand-pink)] w-4 h-4"
                            />
                            <label htmlFor="showHolidays" className="text-sm cursor-pointer select-none">Show Holidays</label>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
                    {/* Header Row (Days) */}
                    <div className="flex border-b border-gray-200">
                        <div className="w-48 flex-shrink-0 p-4 font-bold text-gray-500 text-sm border-r border-gray-200 bg-gray-50">
                            Employee
                        </div>
                        <div className="flex-1 flex overflow-hidden">
                            {daysInMonth.map(day => (
                                <div
                                    key={day.toString()}
                                    className={cn(
                                        "flex-1 border-r border-gray-100 flex flex-col items-center justify-center py-2 text-xs",
                                        isWeekend(day) ? "bg-gray-50/50" : "",
                                        format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "bg-blue-50" : ""
                                    )}
                                >
                                    <span className="text-gray-400 font-medium">{format(day, 'EEEEE')}</span>
                                    <span className={cn("font-bold", format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "text-blue-600" : "text-gray-700")}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Body (Employees) */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                        {filteredUsers.map(user => {
                            // Find leaves for this user in this month
                            const userLeaves = leaves.filter(l =>
                                l.userId === user.id &&
                                l.status === 'approved' &&
                                getLeaveBlockStyle(l) // Ensure it overlaps current month
                            );

                            return (
                                <div key={user.id} className="flex border-b border-gray-100 min-h-[60px] hover:bg-gray-50/30 transition-colors">
                                    <div className="w-48 flex-shrink-0 p-3 border-r border-gray-200 flex flex-col justify-center bg-white sticky left-0 z-10">
                                        <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.department}</p>
                                    </div>
                                    <div className="flex-1 relative h-[60px]">
                                        {/* Background Grid Lines & Holidays */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {daysInMonth.map(day => (
                                                <div
                                                    key={day.toString()}
                                                    className={cn(
                                                        "flex-1 border-r border-gray-100",
                                                        showHolidays && isHoliday(day) ? "bg-stripes-gray opacity-30" : (isWeekend(day) ? "bg-gray-50/30" : "")
                                                    )}
                                                ></div>
                                            ))}
                                        </div>

                                        {/* Leave Blocks */}
                                        {userLeaves.map(leave => {
                                            const style = getLeaveBlockStyle(leave);
                                            if (!style) return null;

                                            return (
                                                <div
                                                    key={leave.id}
                                                    className="absolute top-1/2 -translate-y-1/2 h-8 rounded-md bg-[var(--color-brand-pink)] shadow-sm hover:brightness-110 cursor-pointer overflow-hidden z-0 px-2 flex items-center"
                                                    style={{ ...style, minWidth: '4px' }}
                                                    onClick={() => setSelectedLeave(leave)}
                                                    title="Click for details"
                                                >
                                                    <span className="text-[10px] text-white font-bold truncate">
                                                        {leave.reason}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {filteredUsers.length === 0 && (
                            <div className="p-12 text-center text-gray-400">
                                No employees found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Modal (Simple Overlay) */}
            {selectedLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-gray-900">{selectedLeave.reason}</h3>
                            <button onClick={() => setSelectedLeave(null)} className="text-gray-400 hover:text-gray-600">
                                <Info size={16} /> {/* Using Info icon as placeholder for Close X if X not imported, wait X is not imported, let's use Button or text */}
                                <span className="sr-only">Close</span>
                            </button>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-semibold text-gray-900">Employee:</span> {users.find(u => u.id === selectedLeave.userId)?.name || 'Unknown'}</p>
                            <p><span className="font-semibold text-gray-900">Duration:</span> {leaveDuration(selectedLeave)} days</p>
                            <p><span className="font-semibold text-gray-900">Dates:</span> {selectedLeave.startDate} to {selectedLeave.endDate}</p>
                            <p><span className="font-semibold text-gray-900">Status:</span> <span className="capitalize">{selectedLeave.status}</span></p>
                        </div>
                        <div className="pt-2">
                            <Button onClick={() => setSelectedLeave(null)} className="w-full">Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS helper for stripes */}
            <style jsx global>{`
                .bg-stripes-gray {
                    background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 50%, #e5e7eb 50%, #e5e7eb 75%, transparent 75%, transparent);
                    background-size: 10px 10px;
                }
            `}</style>
        </div>
    );
}

function leaveDuration(leave: Leave) {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
}
