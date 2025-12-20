"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { StatsStrip } from '@/components/dashboard/stats-strip';
import { CalendarView } from '@/components/dashboard/calendar-view';

import { Leave, LeaveBalance, User } from '@/lib/types';
import { PublicHoliday } from '@/data/holiday-data';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationCenter } from '@/components/ui/notification-center';
import { usePolling } from '@/hooks/use-polling';

import { ApprovalModal } from '@/components/dashboard/approval-modal';
import { PendingApprovalsPanel } from '@/components/dashboard/pending-approvals-panel';
import { TeamUpcomingPanel } from '@/components/dashboard/team-upcoming-panel';
import { DaySummaryModal } from '@/components/dashboard/day-summary-modal';
import { HolidayModal } from '@/components/dashboard/holiday-modal';

import { UserMenu } from '@/components/dashboard/user-menu';
import { Calendar as CalendarIcon, BarChart2 } from 'lucide-react';



export default function ManagerDashboard() {
    const { user, logout } = useAuth();
    const { addNotification } = useNotifications();

    // Data State
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [balance, setBalance] = useState<LeaveBalance | null>(null);
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);

    // UI State
    const [isLoading, setIsLoading] = useState(true);

    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [summaryDate, setSummaryDate] = useState<Date | null>(null);
    const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);



    const fetchAllData = useCallback(async () => {
        if (!user) return;
        try {
            const year = new Date().getFullYear();
            const [teamLeavesRes, usersRes, balanceRes, holidaysRes] = await Promise.all([
                fetch(`/api/leaves?year=${year}&scope=team`),
                fetch(`/api/users`),
                fetch(`/api/leave-balance?userId=${user.id}`),
                fetch('/api/holidays')
            ]);

            if (teamLeavesRes.ok) setLeaves(await teamLeavesRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
            if (balanceRes.ok) setBalance(await balanceRes.json());
            if (holidaysRes.ok) setHolidays(await holidaysRes.json());

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchAllData();
    }, [user, fetchAllData]);

    // Polling
    usePolling(() => { if (user) fetchAllData(); }, 5000);

    // Derived State: Overlaps (Removed unused calculation)

    const handleApprove = async (id: string, note: string) => {
        const previousLeaves = [...leaves];
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
        try {
            const res = await fetch(`/api/leaves/${id}/approve`, { method: 'POST', body: JSON.stringify({ note }) });
            if (!res.ok) throw new Error('Failed to approve');
            addNotification('Leave updated successfully', 'success', user?.id || '');
            fetchAllData();
        } catch {
            setLeaves(previousLeaves);
            addNotification('Action couldn’t be completed.', 'error', user?.id || '');
        }
    };

    const handleReject = async (id: string, note: string) => {
        const previousLeaves = [...leaves];
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
        try {
            const res = await fetch(`/api/leaves/${id}/reject`, { method: 'POST', body: JSON.stringify({ note }) });
            if (!res.ok) throw new Error('Failed to reject');
            addNotification('Leave updated successfully', 'success', user?.id || '');
            fetchAllData();
        } catch {
            setLeaves(previousLeaves);
            addNotification('Action couldn’t be completed.', 'error', user?.id || '');
        }
    };

    const handleAddHoliday = async (holiday: { name: string; date: string; type: 'public' | 'optional' }) => {
        try {
            const res = await fetch('/api/holidays/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(holiday)
            });
            if (res.ok) {
                addNotification('Holiday added', 'success', user?.id || '');
                fetchAllData();
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteHoliday = async (id: string) => {
        try {
            const res = await fetch(`/api/holidays/manage?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                addNotification('Holiday removed', 'info', user?.id || '');
                fetchAllData();
            }
        } catch (e) { console.error(e); }
    };



    return (
        <div className="h-screen overflow-hidden bg-[var(--color-bg)] p-6 flex flex-col">
            <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-4 min-h-0">
                <header className="flex justify-between items-center shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
                        <p className="text-gray-500">Overview and approvals</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationCenter />

                        <UserMenu>
                            <button
                                onClick={() => setIsHolidayModalOpen(true)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-slate-50 transition-colors text-left"
                            >
                                <CalendarIcon size={14} />
                                Manage Holidays
                            </button>
                            <Link href="/management/insights" className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-slate-50 transition-colors text-left">
                                <BarChart2 size={14} />
                                Stats & Insights
                            </Link>
                        </UserMenu>

                    </div>
                </header>

                <div className="shrink-0">
                    <StatsStrip
                        balance={balance}
                        isLoading={isLoading}
                        role="management"
                        onLeaveTodayCount={leaves.filter((l: Leave) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0); // Local
                            const s = new Date(l.startDate);
                            s.setHours(0, 0, 0, 0);
                            const e = new Date(l.endDate);
                            e.setHours(0, 0, 0, 0);
                            return l.status === 'approved' && today >= s && today <= e;
                        }).length}
                    />
                </div>

                <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 items-stretch">
                    <div className="flex-1 min-w-0">
                        <CalendarView
                            leaves={leaves}
                            holidays={holidays}
                            mode="team"
                            onDateClick={(date) => setSummaryDate(date)}
                            onLeaveClick={(leave) => setSelectedLeave(leave)}
                            className="h-full"
                            compact={true}
                        />
                    </div>

                    <div className="w-full lg:w-80 relative flex flex-col gap-4 min-h-0">
                        {/* 
                            Manager Sidebar has 2 panels: Pending Approvals & Team Upcoming.
                            On Employee side, we used a relative wrapper with absolute inset for the scrolling panel.
                            Here we have two panels. 
                            If we want them to fill the height and scroll independently or together?
                            Let's put them in a flex-col container that scrolls.
                        */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            <PendingApprovalsPanel
                                leaves={leaves.filter(l => l.status === 'pending')}
                                users={users}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                isLoading={isLoading}
                            />

                            <TeamUpcomingPanel
                                leaves={leaves}
                                users={users}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {selectedLeave && (
                <ApprovalModal
                    leave={selectedLeave}
                    onClose={() => setSelectedLeave(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}

            {summaryDate && (
                <DaySummaryModal
                    date={summaryDate}
                    leaves={leaves}
                    users={users}
                    onClose={() => setSummaryDate(null)}
                />
            )}

            <HolidayModal
                isOpen={isHolidayModalOpen}
                onClose={() => setIsHolidayModalOpen(false)}
                onAdd={handleAddHoliday}
                onDelete={handleDeleteHoliday}
                existingHolidays={holidays}
            />


        </div>
    );
}
