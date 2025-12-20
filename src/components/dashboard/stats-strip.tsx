import { LeaveBalance } from '@/lib/types';
import { Users, Layout } from 'lucide-react';

interface StatsStripProps {
    balance?: LeaveBalance | null;
    isLoading: boolean;
    role?: 'employee' | 'management';
    onLeaveTodayCount?: number; // Pass this for management view
    selectedHolidaysCount?: number;
}

export function StatsStrip({ balance, isLoading, role = 'employee', onLeaveTodayCount = 0, selectedHolidaysCount = 0 }: StatsStripProps) {
    if (isLoading) {
        return <div className="animate-pulse h-24 bg-slate-100 rounded-xl w-full"></div>;
    }

    if (role === 'employee') {
        const isMaxHolidays = selectedHolidaysCount >= 10;

        return (
            <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* 1. Total Leaves */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-4 flex flex-col justify-center bg-white h-24">
                    <p className="text-sm text-gray-900 font-semibold tracking-tight mb-1">Total Leaves</p>
                    <p className="text-[26px] font-bold text-gray-900">
                        {((balance?.allocated || 0) + (balance?.carriedForward || 0)) || 0}
                    </p>
                </div>

                {/* 2. Taken */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-4 flex flex-col justify-center bg-white h-24">
                    <p className="text-sm text-gray-900 font-semibold tracking-tight mb-1">Taken</p>
                    <p className="text-[26px] font-bold text-gray-900">{balance?.taken ?? 0}</p>
                </div>

                {/* 3. Remaining */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-4 flex flex-col justify-center bg-white h-24">
                    <p className="text-sm text-gray-900 font-semibold tracking-tight mb-1">Remaining</p>
                    <p className="text-[26px] font-bold text-[#f0216a]">
                        {((balance?.allocated || 0) + (balance?.carriedForward || 0) - (balance?.taken || 0)) || 0}
                    </p>
                </div>

                {/* 4. Carried Forward */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm p-4 flex flex-col justify-center bg-white h-24">
                    <p className="text-sm text-gray-900 font-semibold tracking-tight mb-1">Carried Forward</p>
                    <p className="text-[26px] font-bold text-gray-900">{balance?.carriedForward ?? 0}</p>
                </div>

                {/* 5. Public Holidays */}
                <div className={`rounded-[var(--radius-xl)] border shadow-sm p-4 flex flex-col justify-center h-24 transition-colors relative ${isMaxHolidays ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
                    }`}>
                    <p className={`text-sm font-semibold tracking-tight mb-1 ${isMaxHolidays ? 'text-amber-900' : 'text-gray-900'}`}>
                        Public Holidays
                    </p>
                    <p className={`text-[26px] font-bold ${isMaxHolidays ? 'text-amber-700' : 'text-gray-900'}`}>
                        {selectedHolidaysCount} <span className="text-sm font-normal opacity-60">/ 10</span>
                    </p>
                    {isMaxHolidays && (
                        <div className="absolute -bottom-6 left-0 right-0 text-center">
                            <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full inline-block shadow-sm">
                                Max limit reached
                            </span>
                        </div>
                    )}
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
