
import { ArrowUpRight, Users, Calendar, AlertTriangle } from 'lucide-react';

interface StatsProps {
    deptStats: Record<string, number>;
}

export function AnalyticsStatsCards({ deptStats }: StatsProps) {
    const totalLeaves = Object.values(deptStats).reduce((a, b) => a + b, 0);
    const topDept = Object.entries(deptStats).sort((a, b) => b[1] - a[1])[0];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-pink-50 rounded-lg text-[var(--color-brand-pink)]">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Leaves Taken</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalLeaves}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Highest Dept. Usage</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {topDept ? topDept[0] : 'N/A'}
                            <span className="text-sm font-normal text-gray-400 ml-2">({topDept ? topDept[1] : 0})</span>
                        </h3>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[var(--radius-xl)] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Avg Reliability</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">85% <span className="text-sm text-green-500 font-medium">+2%</span></h3>
                        {/* Mock trend for avg */}
                    </div>
                </div>
            </div>
        </div>
    );
}
