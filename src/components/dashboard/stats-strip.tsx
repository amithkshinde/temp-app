import { LeaveBalance } from '@/lib/types';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface StatsStripProps {
    balance: LeaveBalance | null;
    isLoading: boolean;
    holidayUsage?: { count: number; limit: number };
}

export function StatsStrip({ balance, isLoading, holidayUsage }: StatsStripProps) {
    if (isLoading || !balance) {
        return <div className="animate-pulse h-24 bg-slate-100 rounded-xl w-full"></div>;
    }

    return (
        <div className="w-full">
            {/* Changed from overflow-x-auto to flex/grid for full width expansion */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* 1. Total Entitlement */}
                <div className="rounded-[var(--radius-xl)] border shadow-sm flex-1 p-4 flex items-center gap-4 bg-purple-50 border-purple-100">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Total Annual</p>
                        {isLoading ? <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" /> : (
                            <p className="text-2xl font-bold text-gray-900">{balance?.allocated}</p>
                        )}
                    </div>
                </div>

                {/* 4. Quarterly Available (NEW) */}
                <div className="rounded-[var(--radius-xl)] border shadow-sm flex-1 p-4 flex items-center gap-4 bg-sky-50 border-sky-100">
                    <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">This Quarter</p>
                        {isLoading ? <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" /> : (
                            <p className="text-2xl font-bold text-gray-900">{balance?.quarterlyAvailable}</p>
                        )}
                    </div>
                </div>

                {/* 2. Taken */}
                <div className="rounded-[var(--radius-xl)] border shadow-sm flex-1 p-4 flex items-center gap-4 bg-blue-50 border-blue-100">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Leaves Taken</p>
                        {isLoading ? <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" /> : (
                            <p className="text-2xl font-bold text-gray-900">{balance?.taken}</p>
                        )}
                    </div>
                </div>

                {/* 5. Carried Forward (With Tooltip) */}
                <div className="rounded-[var(--radius-xl)] border shadow-sm flex-1 p-4 flex items-center gap-4 bg-amber-50 border-amber-100 relative group cursor-help" title="Employee can carry forward only 2 unused leaves from the previous quarter.">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            <p className="text-xs text-gray-500 font-medium">Carried Fwd</p>
                            <div className="text-[10px] text-amber-400 bg-white rounded-full px-1 border border-amber-200">?</div>
                        </div>
                        {isLoading ? <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" /> : (
                            <p className="text-2xl font-bold text-gray-900">{balance?.carriedForward}</p>
                        )}
                    </div>
                </div>

                {/* 3. Remaining */}
                <div className="rounded-[var(--radius-xl)] border shadow-sm flex-1 p-4 flex items-center gap-4 bg-emerald-50 border-emerald-100">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Remaining</p>
                        {isLoading ? <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" /> : (
                            <p className="text-2xl font-bold text-gray-900">{balance?.remaining}</p>
                        )}
                    </div>
                </div>

                {holidayUsage && (
                    <div className={`bg-white p-4 rounded-[var(--radius-xl)] border shadow-sm relative flex-1 min-w-[120px]
                        ${holidayUsage.count > holidayUsage.limit ? 'border-orange-200 bg-orange-50' : 'border-slate-100'}`}>
                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Holidays</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className={`text-2xl font-bold ${holidayUsage.count > holidayUsage.limit ? 'text-orange-600' : 'text-slate-900'}`}>
                                {holidayUsage.count}
                            </p>
                            <span className="text-sm text-gray-400">/ {holidayUsage.limit}</span>
                        </div>
                        {holidayUsage.count > holidayUsage.limit && (
                            <span className="absolute top-2 right-2 text-orange-500 text-xs">⚠️</span>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">Personal Selection</p>
                    </div>
                )}
            </div>
        </div>
    );
}
