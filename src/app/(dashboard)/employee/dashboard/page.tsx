"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatsStrip } from '@/components/dashboard/stats-strip';
import { CalendarView } from '@/components/dashboard/calendar-view';
import { LeaveModal } from '@/components/dashboard/leave-modal';
import { Button } from '@/components/ui/button';
import { Leave, LeaveBalance } from '@/lib/types';
import { format, startOfToday } from 'date-fns';
import { PublicHoliday } from '@/data/holiday-data';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationCenter } from '@/components/ui/notification-center';
import { UpcomingLeavesPanel } from '@/components/dashboard/upcoming-leaves-panel';
import { HelpCircle, FileText, CalendarDays, ExternalLink, Mail, History, Edit2, Trash2, AlertCircle, Lightbulb, AlertTriangle } from 'lucide-react';
import { usePolling } from '@/hooks/use-polling';

import { MobileFAB } from '@/components/dashboard/mobile-fab';
import { HolidaySelectionModal } from '@/components/dashboard/holiday-selection-modal';
import { UserMenu } from '@/components/dashboard/user-menu';
import { deduplicateLeaves } from '@/lib/leave-utils';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { HolidayDetailsModal } from '@/components/dashboard/holiday-details-modal';


export default function EmployeeDashboard() {
    const { user } = useAuth();
    const { addNotification } = useNotifications();


    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [balance, setBalance] = useState<LeaveBalance | null>(null);
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
    const [selectedHolidayIds, setSelectedHolidayIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedLeave, setSelectedLeave] = useState<Leave | undefined>(undefined);

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const [leavesRes, balanceRes, holidaysRes, selectionRes] = await Promise.all([
                fetch(`/api/leaves?userId=${user.id}&year=${new Date().getFullYear()}`),
                // Pass currentMonth to calculate balance as of that month ("Time Travel")
                fetch(`/api/leave-balance?userId=${user.id}&date=${format(currentMonth, 'yyyy-MM-dd')}`),
                fetch('/api/holidays'),
                fetch(`/api/users/${user.id}/holiday-selection`)
            ]);

            if (leavesRes.ok) {
                const rawLeaves = await leavesRes.json();
                setLeaves(deduplicateLeaves(rawLeaves));
            }
            if (balanceRes.ok) setBalance(await balanceRes.json());
            if (holidaysRes.ok) setHolidays(await holidaysRes.json());
            if (selectionRes.ok) setSelectedHolidayIds(await selectionRes.json());

        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setIsLoading(false);
        }
    }, [user, currentMonth]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Real-time Poll
    usePolling(() => {
        if (user) fetchData(); // Silent refresh
    }, 3000);

    const handleDateClick = (date: Date, existingLeave?: Leave) => {
        if (existingLeave) {
            // Edit existing
            setSelectedLeave(existingLeave);
            setSelectedDate(date);
            setIsModalOpen(true);
        } else {
            // New Leave (Single date initially)
            setSelectedLeave(undefined);
            setSelectedDate(date);
            setIsModalOpen(true);
        }
    };

    const handleHolidayClick = async (holidayId: string) => {
        if (!user) return;

        const isSelected = selectedHolidayIds.includes(holidayId);

        if (isSelected) {
            // Removal Flow: Open Confirmation Modal
            const holiday = holidays.find(h => h.id === holidayId);
            if (holiday) {
                setHolidayToRemove(holiday);
            }
            return;
        }

        // Addition Flow: Optimistic Update
        const newCount = selectedHolidayIds.length + 1;
        const newSelections = [...selectedHolidayIds, holidayId];
        setSelectedHolidayIds(newSelections);

        try {
            const res = await fetch(`/api/users/${user.id}/holiday-selection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ holidayId })
            });

            if (!res.ok) throw new Error('Failed to update selection');

            if (newCount > 10) {
                // Soft Warning
                addNotification("You have selected more than 10 public holidays.", "warning", user.id);
            }
        } catch (err) {
            console.error(err);
            fetchData(); // Revert
        }
    };

    // -- Holiday Removal Flow --
    const [showSickRibbon, setShowSickRibbon] = useState(false);
    const [viewingHoliday, setViewingHoliday] = useState<PublicHoliday | null>(null);
    const [holidayToRemove, setHolidayToRemove] = useState<PublicHoliday | null>(null);

    const confirmRemoveHoliday = async () => {
        if (!holidayToRemove || !user) return;

        // Optimistic Remove
        const previousIds = [...selectedHolidayIds];
        const newIds = selectedHolidayIds.filter(id => id !== holidayToRemove.id);
        setSelectedHolidayIds(newIds);
        setHolidayToRemove(null); // Close modal immediately

        try {
            // API call to toggle (remove)
            const res = await fetch(`/api/users/${user.id}/holiday-selection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ holidayId: holidayToRemove.id })
            });

            if (!res.ok) throw new Error('Failed to remove holiday');
            addNotification("Holiday removed", "info", user.id);

        } catch (e) {
            console.error(e);
            setSelectedHolidayIds(previousIds); // Revert
            addNotification("Failed to remove holiday", "error", user.id);
        }
    };

    const handleMarkLeave = async (data: { startDate: string; endDate: string; reason: string }) => {
        if (!user) return;

        try {
            const res = await fetch('/api/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    reason: data.reason
                })
            });
            const newLeave = await res.json();

            if (res.ok) {
                await fetchData(); // Refresh

                if (newLeave.type === 'sick') {
                    // Only show ribbon for sick leave
                    setShowSickRibbon(true);
                    setTimeout(() => setShowSickRibbon(false), 8000);
                } else {
                    addNotification('Leave request submitted', 'success', user.id);
                }
            } else {
                alert(newLeave.error || 'Failed to mark leave. Please try again.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveLeave = async (leave?: Leave) => {
        const target = leave || selectedLeave;
        if (!target || !user) return;
        if (!confirm('Are you sure you want to cancel this leave?')) return;

        try {
            const res = await fetch(`/api/leaves/${target.id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
                addNotification('Your leave has been cancelled', 'info', user.id);
            } else {
                alert('Failed to remove leave.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        // The outer wrapper is handled by layout.tsx (h-full flex-col). 
        // We just need to fit into that.
        <>

            {/* Header: Fixed (Flex None) - Centered Content */}
            <header className="flex-none w-full z-40 bg-[var(--background)] pt-4 px-4 md:pt-6 md:px-6 lg:pt-8 lg:px-8 pb-4">
                <div className="mx-auto max-w-7xl flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome, {user?.name.split(' ')[0]}!</h1>
                        <p className="text-sm lg:text-base text-gray-500">Here’s your leave overview</p>
                    </div>
                    <div className="flex items-center gap-3 lg:gap-4">
                        <NotificationCenter />
                        <Button
                            variant="primary"
                            className="hidden md:inline-flex h-auto py-1 px-4 text-sm rounded-lg"
                            onClick={() => {
                                setSelectedLeave(undefined);
                                setSelectedDate(startOfToday());
                                setIsModalOpen(true);
                            }}
                        >
                            Apply Leave
                        </Button>
                        <UserMenu />
                    </div>
                </div>
            </header>

            {/* Scrollable Content Area - Full Width Container */}
            <div className="flex-1 w-full min-h-0 overflow-y-auto">
                {/* Centered Grid Wrapper */}
                <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-20">
                    <div className="grid gap-6 md:grid-cols-12">

                        {/* Sick Ribbon */}
                        {showSickRibbon && (
                            <div className="md:col-span-12 w-full bg-orange-100 border border-orange-200 text-orange-800 px-6 py-3 rounded-xl flex items-center justify-center gap-3 animate-in slide-in-from-top-4 fade-in">
                                <span className="text-xl">🍵</span>
                                <div>
                                    <p className="font-bold text-sm">Sick Leave Recorded for Today</p>
                                    <p className="text-xs opacity-90">Take care! You’re on Sick Leave today.</p>
                                </div>
                            </div>
                        )}

                        {/* Stats Strip: Full Width */}
                        <div className="md:col-span-12">
                            <StatsStrip
                                balance={balance}
                                isLoading={isLoading}
                                role="employee"
                                selectedHolidaysCount={selectedHolidayIds.length}
                                upcomingLeaves={leaves.filter(l => l.status === 'approved' && new Date(l.startDate) >= new Date(new Date().setHours(0, 0, 0, 0)))}
                                pendingCount={leaves.filter(l => l.status === 'pending').length}
                            />
                        </div>

                        {/* Calendar Section (Span 8) */}
                        <div className="md:col-span-8">
                            <CalendarView
                                leaves={leaves}
                                holidays={holidays}
                                selectedHolidayIds={selectedHolidayIds}
                                onDateClick={handleDateClick}
                                onHolidayClick={handleHolidayClick}
                                className="h-fit w-full"
                                currentMonth={currentMonth}
                                onMonthChange={setCurrentMonth}
                            />
                        </div>

                        {/* Upcoming Leaves Section (Span 4) */}
                        <div className="md:col-span-4">
                            <UpcomingLeavesPanel
                                leaves={leaves}
                                holidays={holidays}
                                selectedHolidayIds={selectedHolidayIds}
                                isLoading={isLoading}
                                onLeaveClick={(leave) => {
                                    setSelectedLeave(leave);
                                    setIsModalOpen(true);
                                }}
                                onHolidayClick={(h) => setViewingHoliday(h)}
                                onRemoveHoliday={(h) => setHolidayToRemove(h)}
                                className="h-[550px] w-full bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-200"
                            />
                        </div>

                        {/* Leave Planning Insights (Span 8) - Replaces Leave History */}
                        <div className="md:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col">
                            <div className="flex items-center gap-2 mb-6">
                                <Lightbulb className="w-5 h-5 text-slate-400" />
                                <h3 className="text-lg font-semibold text-gray-900">Leave Planning Insights</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Insight 1: Quarterly Balance */}
                                {balance && balance.remaining > 0 && (
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50/50 border border-emerald-100/50">
                                        <div className="shrink-0 mt-0.5">
                                            <CalendarDays className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-emerald-900">
                                                You can still take <span className="font-bold">{balance.remaining}</span> leave days.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Insight 2: Carry Forward Rule */}
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50/50 border border-amber-100/50">
                                    <div className="shrink-0 mt-0.5">
                                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-amber-900">
                                            Only <span className="font-bold">2 leave days</span> can be carried forward to next quarter.
                                        </p>
                                    </div>
                                </div>

                                {/* Insight 3: Long Break Opportunity (Static for now/demo) */}
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-indigo-50/50 border border-indigo-100/50">
                                    <div className="shrink-0 mt-0.5">
                                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-indigo-900">
                                            Plan a 4-day break by taking leave on Friday before a weekend.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Policy & Help (Span 4) - Aligned with History */}
                        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <HelpCircle className="w-5 h-5 text-slate-400" />
                                <h3 className="text-lg font-semibold text-gray-900">Policy & Help</h3>
                            </div>

                            <div className="space-y-1 flex-1">
                                <a
                                    href="#"
                                    className="group flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors text-sm text-gray-600 hover:text-gray-900"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-[var(--color-brand-pink)] transition-colors" />
                                        <span className="font-medium group-hover:underline decoration-slate-300 underline-offset-4">Leave Policy 2025</span>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                                </a>

                                <a
                                    href="#"
                                    className="group flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors text-sm text-gray-600 hover:text-gray-900"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsHolidayModalOpen(true); // Reuse existing modal logic for view
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <CalendarDays className="w-4 h-4 text-slate-400 group-hover:text-[var(--color-brand-pink)] transition-colors" />
                                        <span className="font-medium group-hover:underline decoration-slate-300 underline-offset-4">Holiday List</span>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                                </a>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>Need assistance?</span>
                                </div>
                                <a href="mailto:hr@twistopen.in" className="flex items-center gap-1.5 mt-1 group w-fit">
                                    <Mail className="w-3 h-3 text-[var(--color-brand-pink)]" />
                                    <span className="text-xs font-semibold text-[var(--color-brand-pink)] group-hover:underline">Contact HR for support</span>
                                </a>
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            <MobileFAB onClick={() => {
                setSelectedLeave(undefined);
                setIsModalOpen(true);
            }} />

            <HolidaySelectionModal
                isOpen={isHolidayModalOpen}
                onClose={() => setIsHolidayModalOpen(false)}
                availableHolidays={holidays}
                selectedHolidayIds={selectedHolidayIds}
                onSave={async (ids: string[]) => {
                    const current = new Set(selectedHolidayIds);
                    const next = new Set(ids);
                    // Add new
                    for (const id of Array.from(next)) {
                        if (!current.has(id)) await handleHolidayClick(id);
                    }
                    // Remove old via Bulk modal
                    for (const id of Array.from(current)) {
                        if (!next.has(id)) await handleHolidayClick(id);
                    }
                    setSelectedHolidayIds(ids);
                }}
            />

            {/* Holiday Details & Confirmation */}
            <HolidayDetailsModal
                isOpen={!!viewingHoliday}
                onClose={() => setViewingHoliday(null)}
                holiday={viewingHoliday}
                onRemove={(h) => {
                    setViewingHoliday(null); // Close details
                    setHolidayToRemove(h);   // Open confirm
                }}
            />

            <ConfirmationModal
                isOpen={!!holidayToRemove}
                onClose={() => setHolidayToRemove(null)}
                onConfirm={confirmRemoveHoliday}
                title="Remove Holiday"
                message={`Are you sure you want to remove ${holidayToRemove?.name} from your selected holidays?`}
                confirmLabel="Remove"
                cancelLabel="Cancel"
                isLoading={isLoading}
            />

            {isModalOpen && (
                <LeaveModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={async (data) => {
                        if (selectedLeave) {
                            // EDIT
                            try {
                                const res = await fetch(`/api/leaves/${selectedLeave.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(data)
                                });
                                if (res.ok) {
                                    await fetchData();
                                    addNotification('Leave updated successfully', 'success', user?.id || '');
                                } else {
                                    alert('Update failed');
                                }
                            } catch (e) { console.error(e); }
                        } else {
                            // CREATE
                            await handleMarkLeave(data);
                        }
                    }}
                    onRemove={handleRemoveLeave}
                    initialStartDate={selectedLeave ? selectedLeave.startDate : (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '')}
                    initialEndDate={selectedLeave ? selectedLeave.endDate : undefined}
                    existingLeaveId={selectedLeave?.id}
                    isDemo={user?.demo}
                    holidays={holidays}
                    leaves={leaves}
                />
            )}
        </>
    );
}
