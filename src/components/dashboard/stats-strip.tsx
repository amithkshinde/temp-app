import { LeaveBalance, Leave } from '@/lib/types';
import { Users, Layout, Calendar, Clock } from 'lucide-react';

interface StatsStripProps {
    balance?: LeaveBalance | null;
    isLoading: boolean;
    role?: 'employee' | 'management';
    onLeaveTodayCount?: number;
    selectedHolidaysCount?: number;
    // New Props
    pendingCount?: number;
}

export function StatsStrip({
    balance,
    isLoading,
    role = 'employee',
    onLeaveTodayCount = 0
}: StatsStripProps) {
    if (isLoading) {
        return <div className="animate-pulse h-32 bg-slate-100 rounded-xl w-full"></div>;
    }

    if (role === 'employee') {

        return (
            <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* 1. Leaves Remaining (Priority) */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-4 lg:p-6 flex flex-col justify-center bg-white min-h-[110px] lg:min-h-[140px]">
                    <div className="flex justify-between items-start">
                        <p className="text-base font-semibold leading-none text-gray-900 tracking-tight mb-2">Remaining Leaves</p>
                        <Calendar className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                    </div>
                    <p className="text-3xl lg:text-5xl font-bold text-[#f0216a]">
                        {balance?.remaining ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Available to use</p>
                </div>

                {/* 2. Leaves Taken */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-4 lg:p-6 flex flex-col justify-center bg-white min-h-[110px] lg:min-h-[140px]">
                    <p className="text-base font-semibold leading-none text-gray-900 tracking-tight mb-2">Leaves Taken</p>
                    <p className="text-3xl font-bold text-gray-900">{balance?.taken ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Used this year</p>
                </div>

                {/* 3. Total Leaves (Quarterly Base + Carry) */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-4 lg:p-6 flex flex-col justify-center bg-white min-h-[110px] lg:min-h-[140px]">
                    <p className="text-base font-semibold leading-none text-gray-900 tracking-tight mb-2">Total Leaves</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {balance?.allocated ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Quarterly + Carried</p>
                </div>

                {/* 4. Carried Forward Only */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-4 lg:p-6 flex flex-col justify-center bg-white min-h-[110px] lg:min-h-[140px]">
                    <div className="flex justify-between items-start">
                        <p className="text-base font-semibold leading-none text-gray-900 tracking-tight mb-2">Carried Forward</p>
                        <Clock className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{balance?.carriedForward ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">From previous quarter</p>
                </div>
            </div>
        );
    }

    // Management View - Keeping as is for now, or standardizing grid if needed.
    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* 1. Employees on Leave Today */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm flex-1 p-6 flex items-center gap-4 bg-white min-h-[120px]">
                    <div className="h-12 w-12 rounded-full bg-pink-50 flex items-center justify-center text-[#f0216a]">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-900 font-semibold tracking-tight">On Leave Today</p>
                        <p className="text-3xl font-bold text-gray-900">{onLeaveTodayCount}</p>
                    </div>
                </div>

                {/* 2. Placeholder for Future Stats */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm flex-1 p-6 flex items-center gap-4 bg-white border-dashed min-h-[120px]">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Layout size={24} />
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
