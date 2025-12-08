
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { StatsStrip } from '@/components/dashboard/stats-strip';
import { CalendarView } from '@/components/dashboard/calendar-view';

import { LeaveRequestList } from '@/components/management/leave-request-list';
import { Leave, LeaveBalance, User } from '@/lib/types';
import { PublicHoliday } from '@/data/holiday-data';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationCenter } from '@/components/ui/notification-center';
import { usePolling } from '@/hooks/use-polling';
import { Filter, List, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { areIntervalsOverlapping, parseISO } from 'date-fns';

import { ApprovalModal } from '@/components/dashboard/approval-modal';
import { PendingApprovalsPanel } from '@/components/dashboard/pending-approvals-panel';
import { TeamUpcomingPanel } from '@/components/dashboard/team-upcoming-panel';
import { DaySummaryModal } from '@/components/dashboard/day-summary-modal';
import { HolidayModal } from '@/components/dashboard/holiday-modal';

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
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [summaryDate, setSummaryDate] = useState<Date | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterEmployee, setFilterEmployee] = useState<string>('all');
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

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchAllData();
    }, [user, fetchAllData]);

    // Polling
    usePolling(() => { if (user) fetchAllData(); }, 5000);

    // Derived State: Overlaps
    const overlappingDates = useMemo(() => {
        const overlaps = new Set<string>();
        leaves.forEach((l1, i) => {
            if (l1.status === 'rejected' || l1.status === 'cancelled') return;
            leaves.forEach((l2, j) => {
                if (i <= j) return;
                if (l2.status === 'rejected' || l2.status === 'cancelled') return;
                if (l1.userId === l2.userId) return;

                if (areIntervalsOverlapping(
                    { start: parseISO(l1.startDate), end: parseISO(l1.endDate) },
                    { start: parseISO(l2.startDate), end: parseISO(l2.endDate) }
                )) {
                    overlaps.add(l1.id);
                    overlaps.add(l2.id);
                }
            });
        });
        return overlaps;
    }, [leaves]);

    // Derived State: Filtering
    const filteredLeaves = leaves.filter(l => {
        if (filterStatus !== 'all' && l.status !== filterStatus) return false;
        if (filterType !== 'all') {
            if (filterType === 'sick' && !l.reason.toLowerCase().includes('sick')) return false;
            if (filterType === 'planned' && !l.reason.toLowerCase().includes('planned')) return false;
        }
        if (filterEmployee !== 'all' && l.userId !== filterEmployee) return false;
        return true;
    });

    const handleApprove = async (id: string, note: string) => {
        const previousLeaves = [...leaves];
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
        try {
            const res = await fetch(`/api/leaves/${id}/approve`, { method: 'POST', body: JSON.stringify({ note }) });
            if (!res.ok) throw new Error('Failed to approve');
            addNotification('Leave updated successfully', 'success', user?.id || '');
            fetchAllData();
        } catch (error) {
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
        } catch (error) {
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
        <div className="min-h-screen bg-[var(--color-bg)] p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
                        <p className="text-gray-500">Overview and approvals</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => setIsHolidayModalOpen(true)} className="text-xs">
                            Manage Holidays
                        </Button>
                        <Link href="/management/insights">
                            <Button variant="outline" className="text-xs">Stats & Insights</Button>
                        </Link>
                        <NotificationCenter />
                        <span className="text-base font-semibold text-gray-900">{user?.name}</span>
                        <Button onClick={logout} variant="secondary" className="text-xs">Sign out</Button>
                    </div>
                </header>

                <StatsStrip balance={balance} isLoading={isLoading} />

                <div className="bg-white p-4 rounded-[var(--radius-xl)] border border-slate-100 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                    <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200">
                            <Filter size={14} className="text-slate-400" />
                            <select
                                className="bg-transparent text-sm font-medium focus:outline-none"
                                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Status: All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200">
                            <select
                                className="bg-transparent text-sm font-medium focus:outline-none"
                                value={filterType} onChange={e => setFilterType(e.target.value)}
                            >
                                <option value="all">Type: All</option>
                                <option value="sick">Sick Leave</option>
                                <option value="planned">Planned Leave</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200">
                            <select
                                className="bg-transparent text-sm font-medium focus:outline-none"
                                value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}
                            >
                                <option value="all">Employee: All</option>
                                {users.filter(u => u.role === 'employee').map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('calendar')}
                            size="sm"
                            className="gap-2"
                        >
                            <CalendarIcon size={14} /> Calendar
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('list')}
                            size="sm"
                            className="gap-2"
                        >
                            <List size={14} /> List
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        {viewMode === 'list' ? (
                            <LeaveRequestList
                                leaves={filteredLeaves}
                                users={users}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ) : (
                            <div className="min-h-[600px]">
                                <CalendarView
                                    leaves={filteredLeaves}
                                    holidays={holidays}
                                    mode="team"
                                    onDateClick={(date) => setSummaryDate(date)}
                                    onLeaveClick={(leave) => setSelectedLeave(leave)}
                                />
                                {overlappingDates.size > 0 && (
                                    <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm">
                                        <AlertTriangle size={16} />
                                        <span>Warning: {overlappingDates.size} requests have scheduling conflicts. Check dates carefully.</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-6">
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
