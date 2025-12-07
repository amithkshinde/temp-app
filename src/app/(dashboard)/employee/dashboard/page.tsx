
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StatsStrip } from '@/components/dashboard/stats-strip';
import { CalendarView } from '@/components/dashboard/calendar-view';
import { LeaveModal } from '@/components/dashboard/leave-modal';
import { Leave, LeaveBalance } from '@/lib/types';
import { PublicHoliday } from '@/data/holiday-data';
import { format, parseISO } from 'date-fns';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationCenter } from '@/components/ui/notification-center';
import { UpcomingLeavesPanel } from '@/components/dashboard/upcoming-leaves-panel';
import { usePolling } from '@/hooks/use-polling';


export default function EmployeeDashboard() {
    const { user, logout } = useAuth();
    const { addNotification } = useNotifications();


    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [balance, setBalance] = useState<LeaveBalance | null>(null);
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
    const [selectedHolidayIds, setSelectedHolidayIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedLeave, setSelectedLeave] = useState<Leave | undefined>(undefined);

    const fetchData = async () => {
        if (!user) return;
        try {
            const [leavesRes, balanceRes, holidaysRes, selectionRes] = await Promise.all([
                fetch(`/api/leaves?userId=${user.id}&year=${new Date().getFullYear()}`),
                fetch(`/api/leave-balance?userId=${user.id}`),
                fetch('/api/holidays'),
                fetch(`/api/users/${user.id}/holiday-selection`)
            ]);

            if (leavesRes.ok) setLeaves(await leavesRes.json());
            if (balanceRes.ok) setBalance(await balanceRes.json());
            if (holidaysRes.ok) setHolidays(await holidaysRes.json());
            if (selectionRes.ok) setSelectedHolidayIds(await selectionRes.json());

        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // Real-time Poll
    usePolling(() => {
        if (user) fetchData(); // Silent refresh
    }, 3000);

    const handleDateClick = (date: Date, existingLeave?: Leave) => {
        setSelectedDate(date);
        setSelectedLeave(existingLeave);
        setIsModalOpen(true);
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
                // Simple toast alternative for now
                console.warn("Soft Warning: You have selected more than 10 public holidays.");
            }
        } catch (err) {
            console.error(err);
            // Revert optimistic update
            fetchData();
        }
    };

    const [showSickRibbon, setShowSickRibbon] = useState(false);

    // ... (fetchData hook)

    const handleMarkLeave = async (data: { startDate: string; endDate: string; reason: string }) => {
        if (!user) return;

        // Optimistic Duplicate Check at Frontend Level
        const start = new Date(data.startDate);
        const duplicate = leaves.find(l => {
            const ls = new Date(l.startDate);
            const le = new Date(l.endDate);
            const check = new Date(data.startDate);
            // Simple overlap check for start date (Requirement: "cannot apply... on a date that already has a leave")
            // If checking range overlap, it's more complex, but start date check covers the basic "click today" case.
            return check >= ls && check <= le && l.status !== 'cancelled';
        });

        if (duplicate) {
            addNotification('You already have a leave on this date.', 'warning', user.id);
            return;
        }

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

                // Requirement 4: "Employee Should Only See..."
                if (newLeave.type === 'sick') {
                    addNotification('Sick Leave Recorded', 'success', user.id);
                    setShowSickRibbon(true);
                    setTimeout(() => setShowSickRibbon(false), 8000); // Hide after 8s
                } else {
                    addNotification('Leave request submitted', 'success', user.id);
                }
            } else {
                alert('Failed to mark leave. Please try again.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveLeave = async () => {
        if (!selectedLeave) return;
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
                        <h1 className="text-3xl font-bold text-gray-900">Leave Balance</h1>
                        <p className="text-gray-500">Manage your leave schedule</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/employee/summary">
                            <Button variant="outline" className="text-xs">
                                View Yearly Summary
                            </Button>
                        </Link>
                        <NotificationCenter />
                        <span className="text-sm font-medium">{user?.name}</span>
                        <Button onClick={logout} variant="secondary" className="text-xs">Sign out</Button>
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
                    holidayUsage={{ count: selectedHolidayIds.length, limit: 10 }}
                />

                {/* ... */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        <CalendarView
                            leaves={leaves}
                            holidays={holidays}
                            selectedHolidayIds={selectedHolidayIds}
                            onDateClick={handleDateClick}
                            onHolidayClick={handleHolidayClick}
                            onLeaveClick={(leave: Leave) => {
                                setSelectedLeave(leave);
                                setSelectedDate(parseISO(leave.startDate));
                                setIsModalOpen(true);
                            }}
                        />
                    </div>
                    {/* Updated Panel with click handler */}
                    <UpcomingLeavesPanel
                        leaves={leaves}
                        isLoading={isLoading}
                        onLeaveClick={(leave: Leave) => {
                            setSelectedLeave(leave);
                            setSelectedDate(parseISO(leave.startDate));
                            setIsModalOpen(true);
                        }}
                    />
                </div>

                {/* ... */}

                {isModalOpen && selectedDate && (
                    <LeaveModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={async (data) => {
                            if (selectedLeave) {
                                // EDIT MODE
                                try {
                                    const res = await fetch(`/api/leaves/${selectedLeave.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data)
                                    });
                                    if (res.ok) {
                                        await fetchData();
                                        addNotification('Leave updated successfully', 'success', user?.id);
                                    } else {
                                        alert('Update failed');
                                    }
                                } catch (e) { console.error(e); }
                            } else {
                                // CREATE MODE
                                await handleMarkLeave(data);
                            }
                        }}
                        onRemove={handleRemoveLeave}
                        initialStartDate={selectedLeave ? selectedLeave.startDate : format(selectedDate, 'yyyy-MM-dd')}
                        initialEndDate={selectedLeave ? selectedLeave.endDate : undefined}
                        existingLeaveId={selectedLeave?.id}
                        isDemo={user?.demo}
                    />
                )}
            </div>
        </div>
    );
}

