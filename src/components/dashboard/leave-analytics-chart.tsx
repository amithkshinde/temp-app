import React from 'react';
import { LeaveBalance } from '@/lib/types';

interface LeaveAnalyticsChartProps {
    balance?: LeaveBalance | null;
    isLoading: boolean;
}

export function LeaveAnalyticsChart({ isLoading }: LeaveAnalyticsChartProps) {
    if (isLoading) {
        return <div className="w-full h-64 animate-pulse bg-slate-50 rounded-xl"></div>;
    }

    // Mock data based on balance or static if balance details aren't granular enough
    const data = [
        { label: 'Sick Leave', value: 4, color: 'bg-orange-400' },
        { label: 'Casual Leave', value: 8, color: 'bg-blue-400' },
        { label: 'Privilege Leave', value: 4, color: 'bg-purple-400' },
    ];

    const total = 16; // Assuming base of 16 for now or derive from data

    return (
        <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-6 flex flex-col h-full min-h-[300px]">
            <h3 className="text-gray-900 font-semibold tracking-tight mb-6">Leave Breakdown</h3>

            <div className="flex-1 flex items-end justify-around gap-4 px-4 pb-4 border-b border-gray-100">
                {data.map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-2 group w-full">
                        <div className="relative w-full max-w-[60px] h-40 bg-gray-50 rounded-lg overflow-hidden flex items-end">
                            <div
                                className={`w-full ${item.color} transition-all duration-500 rounded-t-sm group-hover:opacity-90`}
                                style={{ height: `${(item.value / total) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-around pt-4">
                {data.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                        <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
