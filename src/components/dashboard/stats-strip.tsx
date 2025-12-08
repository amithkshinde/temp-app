import { LeaveBalance } from '@/lib/types';
import { TrendingUp, Calendar, AlertCircle, Users, Layout } from 'lucide-react';

interface StatsStripProps {
    balance?: LeaveBalance | null;
    isLoading: boolean;
    holidayUsage?: { count: number; limit: number };
    role?: 'employee' | 'management';
    onLeaveTodayCount?: number; // Pass this for management view
}

export function StatsStrip({ balance, isLoading, holidayUsage, role = 'employee', onLeaveTodayCount = 0 }: StatsStripProps) {
    if (isLoading) {
        return <div className="animate-pulse h-24 bg-slate-100 rounded-xl w-full"></div>;
    }

    if (role === 'employee') {
        return (
            <div className="w-full">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    {/* ONLY Remaining in Quarter for Employee */}
                    <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm flex-1 p-4 flex items-center gap-4 bg-white">
                        <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-[#f0216a]">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Remaining (This Quarter)</p>
                            <p className="text-3xl font-bold text-gray-900">{balance?.quarterlyAvailable ?? 0}</p>
                        </div>
                    </div>

                    {/* Holidays Usage */}
                    {holidayUsage && (
                        <div className={`bg-white p-4 rounded-[var(--radius-xl)] border shadow-sm flex-1 flex items-center gap-4
                            ${holidayUsage.count > holidayUsage.limit ? 'border-gray-400 bg-gray-50' : 'border-slate-200'}`}>
                            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Public Holidays</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-gray-900">{holidayUsage.count}</p>
                                    <span className="text-sm text-gray-400">/ {holidayUsage.limit}</span>
                                </div>
                            </div>
                            {holidayUsage.count > holidayUsage.limit && (
                                <span className="text-[#f0216a] text-xs font-bold ml-auto">Over Limit</span>
                            )}
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
                        <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">On Leave Today</p>
                        <p className="text-3xl font-bold text-gray-900">{onLeaveTodayCount}</p>
                    </div>
                </div>

                {/* 2. Placeholder for Future Stats */}
                <div className="rounded-[var(--radius-xl)] border border-slate-200 shadow-sm flex-1 p-4 flex items-center gap-4 bg-slate-50 border-dashed">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Layout size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Team Health</p>
                        <p className="text-sm text-slate-400 italic">Coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
