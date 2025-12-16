"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatsStrip } from '@/components/dashboard/stats-strip';
import { CalendarView } from '@/components/dashboard/calendar-view';
import { LeaveModal } from '@/components/dashboard/leave-modal';
import { Leave, LeaveBalance } from '@/lib/types';
import { format } from 'date-fns';
import { PublicHoliday } from '@/data/holiday-data';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationCenter } from '@/components/ui/notification-center';
import { UpcomingLeavesPanel } from '@/components/dashboard/upcoming-leaves-panel';
import { usePolling } from '@/hooks/use-polling';

import { MobileFAB } from '@/components/dashboard/mobile-fab';
import { HolidaySelectionModal } from '@/components/dashboard/holiday-selection-modal';
import { UserMenu } from '@/components/dashboard/user-menu';
import { deduplicateLeaves } from '@/lib/leave-utils';


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

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const [leavesRes, balanceRes, holidaysRes, selectionRes] = await Promise.all([
                fetch(`/api/leaves?userId=${user.id}&year=${new Date().getFullYear()}`),
                fetch(`/api/leave-balance?userId=${user.id}`),
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
    }, [user]);

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
        if (user?.demo) return alert('Demo mode: Action disabled');
        if (!user) return;

        const isSelected = selectedHolidayIds.includes(holidayId);
        const newCount = isSelected ? selectedHolidayIds.length - 1 : selectedHolidayIds.length + 1;

        // Optimistic update
        const newSelections = isSelected
            ? selectedHolidayIds.filter(id => id !== holidayId)
            : [...selectedHolidayIds, holidayId];
        setSelectedHolidayIds(newSelections);

        try {
            const res = await fetch(`/api/users/${user.id}/holiday-selection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ holidayId })
            });

            if (!res.ok) throw new Error('Failed to update selection');

            if (newCount > 10 && !isSelected) {
                console.warn("Soft Warning: You have selected more than 10 public holidays.");
            }
        } catch (err) {
            console.error(err);
            // Revert optimistic update
            fetchData();
        }
    };

    const [showSickRibbon, setShowSickRibbon] = useState(false);

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
                    // Only show ribbon for sick leave, no "New Request" notification
                    setShowSickRibbon(true);
                    setTimeout(() => setShowSickRibbon(false), 8000);
                } else {
                    // Only show success for employee
                    addNotification('Leave request submitted', 'success', user.id);
                }
            } else {
                alert(newLeave.error || 'Failed to mark leave. Please try again.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveLeave = async () => {
        if (!selectedLeave || !user) return;
        if (!confirm('Are you sure you want to cancel this leave?')) return;

        try {
            const res = await fetch(`/api/leaves/${selectedLeave.id}`, { method: 'DELETE' });
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
        <div className="min-h-screen bg-[var(--color-bg)] p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name.split(' ')[0]}!</h1>
                        <p className="text-gray-500">Here’s your leave overview</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                        <UserMenu />
                    </div>
                </header>

                {showSickRibbon && (
                    <div className="w-full bg-orange-100 border border-orange-200 text-orange-800 px-6 py-3 rounded-xl flex items-center justify-center gap-3 animate-in slide-in-from-top-4 fade-in">
                        <span className="text-xl">🍵</span>
                        <div>
                            <p className="font-bold text-sm">Sick Leave Recorded for Today</p>
                            <p className="text-xs opacity-90">Take care! You’re on Sick Leave today.</p>
                        </div>
                    </div>
                )}

                <StatsStrip
                    balance={balance}
                    isLoading={isLoading}
                    role="employee"
                />

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        <CalendarView
                            leaves={leaves}
                            holidays={holidays}
                            selectedHolidayIds={selectedHolidayIds}
                            onDateClick={handleDateClick}
                            onHolidayClick={handleHolidayClick}
                        />

                    </div>

                    <div className="w-full lg:w-80 space-y-6">
                        <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-4">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-xs text-gray-500 font-medium tracking-wide uppercase">Public Holidays</h3>
                                <button
                                    className="text-xs font-medium text-[var(--color-brand-pink)] hover:text-[#d01b5b] hover:underline transition-colors p-0 bg-transparent border-none appearance-none cursor-pointer"
                                    onClick={() => setIsHolidayModalOpen(true)}
                                >
                                    Manage
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-0">
                                You have selected {selectedHolidayIds.length} / 10 holidays.
                            </p>
                        </div>

                        <UpcomingLeavesPanel
                            leaves={leaves}
                            isLoading={isLoading}
                            onLeaveClick={(leave) => {
                                setSelectedLeave(leave);
                                setIsModalOpen(true);
                            }}
                        />
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
                        for (const id of Array.from(next)) {
                            if (!current.has(id)) await handleHolidayClick(id);
                        }
                        for (const id of Array.from(current)) {
                            if (!next.has(id)) await handleHolidayClick(id);
                        }
                        setSelectedHolidayIds(ids);
                    }}
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
            </div>
        </div>
    );
}
