import { LeaveBalance, Leave } from '@/lib/types';
import { Users, Layout } from 'lucide-react';

interface StatsStripProps {
    balance?: LeaveBalance | null;
    isLoading: boolean;
    role?: 'employee' | 'management';
    onLeaveTodayCount?: number; // Pass this for management view
    selectedHolidaysCount?: number;
    // New Props
    upcomingApprovedLeaves?: Leave[]; // To calculate next scheduled
    pendingLeavesCount?: number;
}

export function StatsStrip({
    balance,
    isLoading,
    role = 'employee',
    onLeaveTodayCount = 0,
    selectedHolidaysCount = 0,
    upcomingApprovedLeaves = [],
    pendingLeavesCount = 0
}: StatsStripProps) {
    if (isLoading) {
        return <div className="animate-pulse h-32 bg-slate-100 rounded-xl w-full"></div>;
    }

    if (role === 'employee') {
        const nextLeave = upcomingApprovedLeaves.length > 0
            ? upcomingApprovedLeaves.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]
            : null;

        return (
            <div className="w-full grid grid-cols-12 gap-6">
                {/* 1. Total Leave Balance (Showing Remaining as per user request context "Leaves remaining this year") */}
                <div className="col-span-12 md:col-span-6 lg:col-span-3 rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-6 flex flex-col justify-center bg-[var(--color-card)] h-32">
                    <p className="text-sm text-gray-900 font-semibold tracking-tight mb-2">Total Leave Balance</p>
                    <p className="text-4xl font-bold text-gray-900">
                        {balance?.remaining ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Leaves remaining this year</p>
                </div>

                {/* 2. Leaves Taken */}
                <div className="col-span-12 md:col-span-6 lg:col-span-3 rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-6 flex flex-col justify-center bg-[var(--color-card)] h-32">
                    <p className="text-sm text-gray-900 font-semibold tracking-tight mb-2">Leaves Taken</p>
                    <p className="text-4xl font-bold text-gray-900">{balance?.taken ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Used so far</p>
                </div>

                {/* 3. Upcoming Approved Leaves */}
                <div className="col-span-12 md:col-span-6 lg:col-span-3 rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-6 flex flex-col justify-center bg-[var(--color-card)] h-32">
                    <p className="text-sm text-gray-900 font-semibold tracking-tight mb-2">Upcoming Approved</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-[#f0216a]">
                            {upcomingApprovedLeaves.length}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                        {nextLeave ? `Next: ${new Date(nextLeave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No upcoming leaves'}
                    </p>
                </div>

                {/* 4. Pending Requests */}
                <div className="col-span-12 md:col-span-6 lg:col-span-3 rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-6 flex flex-col justify-center bg-[var(--color-card)] h-32">
                    <p className="text-sm text-gray-900 font-semibold tracking-tight mb-2">Pending Requests</p>
                    <p className="text-4xl font-bold text-gray-900">{pendingLeavesCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
                </div>
            </div>
        );
    }

    // Management View
    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* 1. Employees on Leave Today */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm flex-1 p-4 flex items-center gap-4 bg-white">
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-[#f0216a]">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-900 font-semibold tracking-tight">On Leave Today</p>
                        <p className="text-3xl font-bold text-gray-900">{onLeaveTodayCount}</p>
                    </div>
                </div>

                {/* 2. Placeholder for Future Stats */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm flex-1 p-4 flex items-center gap-4 bg-white border-dashed">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Layout size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 font-semibold tracking-tight">Team Health</p>
                        <p className="text-sm text-slate-400 italic">Coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
