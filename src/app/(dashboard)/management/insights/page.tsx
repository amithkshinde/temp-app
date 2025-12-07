
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, Filter, Calendar as CalendarIcon, Users, TrendingUp, FileText } from 'lucide-react';
import { format, parseISO, eachDayOfInterval, startOfYear, endOfYear, getDay } from 'date-fns';
import { Department } from '@/lib/types';
import { cn } from '@/lib/utils';

interface InsightsData {
    heatmap: Record<string, number>;
    topLeavers: { name: string; count: number; department: string }[];
    upcomingLongLeaves: { employeeName: string; department: string; startDate: string; endDate: string; duration: number }[];
    trends: { month: string; leaves: number }[];
}

export default function ManagerInsightsPage() {
    const [data, setData] = useState<InsightsData | null>(null);
    const [department, setDepartment] = useState<string>('All');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch with department filter
                const url = `/api/insights/analytics${department !== 'All' ? `?department=${department}` : ''}`;
                const res = await fetch(url);
                if (res.ok) setData(await res.json());
            } catch (error) {
                console.error("Failed to load insights", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [department]);

    const handlePrint = () => window.print();

    // Helper to generate calendar grid for Heatmap (Yearly)
    // Simple GitHub-style contribution graph logic
    const renderHeatmap = () => {
        if (!data?.heatmap) return null;

        const today = new Date();
        const start = startOfYear(today);
        const end = endOfYear(today);
        const days = eachDayOfInterval({ start, end });

        // Group by week for layout? Or just a simple flex grid?
        // Let's do a flex wrap grid for simplicity of implementation in CSS grid.
        return (
            <div className="grid grid-cols-[repeat(53,1fr)] gap-1 auto-rows-fr h-32 w-full">
                {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const count = data.heatmap[dateStr] || 0;

                    // Intensity color
                    let colorClass = "bg-gray-100";
                    if (count > 0) colorClass = "bg-pink-200";
                    if (count > 2) colorClass = "bg-pink-400";
                    if (count > 4) colorClass = "bg-[var(--color-brand-pink)]";

                    return (
                        <div
                            key={dateStr}
                            className={cn("w-full h-full rounded-sm hover:ring-2 ring-black/10 transition-all cursor-pointer relative group", colorClass)}
                        >
                            <span className="sr-only">{dateStr}: {count} leaves</span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                {format(day, 'MMM d')}: {count} absent
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center text-gray-400">Loading insights...</div>;
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href="/management/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Manager Insights</h1>
                            <p className="text-gray-500">Deep dive into team attendance patterns</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1.5 shadow-sm">
                            <Filter size={14} className="text-gray-400 mr-2" />
                            <select
                                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                <option value="All">All Departments</option>
                                {Object.keys(Department).map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <a href="/api/insights/export?format=csv" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="gap-2">
                                    <FileText size={16} /> CSV
                                </Button>
                            </a>
                            <Button onClick={handlePrint} className="gap-2 bg-[var(--color-brand-pink)] text-white">
                                <Download size={16} /> PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Heatmap Section */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <CalendarIcon size={18} /> Absence Heatmap <span className="text-gray-400 text-sm font-normal">(2025)</span>
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                                <div className="w-3 h-3 bg-pink-200 rounded-sm"></div>
                                <div className="w-3 h-3 bg-pink-400 rounded-sm"></div>
                                <div className="w-3 h-3 bg-[var(--color-brand-pink)] rounded-sm"></div>
                            </div>
                            <span>More</span>
                        </div>
                    </div>
                    {renderHeatmap()}
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Top Leavers */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-4">
                            <Users size={16} /> Highest Leave Takers
                        </h3>
                        <div className="space-y-4">
                            {data?.topLeavers.map((user, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-[10px] text-gray-400">{user.department}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-gray-900">{user.count}</span>
                                        <span className="text-xs text-gray-400 ml-1">days</span>
                                    </div>
                                </div>
                            ))}
                            {data?.topLeavers.length === 0 && <p className="text-sm text-gray-400 py-4">No data available.</p>}
                        </div>
                    </div>

                    {/* Upcoming Long Leaves */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-4">
                            <CalendarIcon size={16} /> Upcoming Long Leaves {'>'} 3d
                        </h3>
                        <div className="space-y-3">
                            {data?.upcomingLongLeaves.map((leave, i) => (
                                <div key={i} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{leave.employeeName}</p>
                                            <p className="text-xs text-orange-600/80 mb-1">{leave.department}</p>
                                        </div>
                                        <span className="bg-white text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                                            {leave.duration} Days
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {format(parseISO(leave.startDate), 'MMM d')} - {format(parseISO(leave.endDate), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            ))}
                            {data?.upcomingLongLeaves.length === 0 && <p className="text-sm text-gray-400 py-4">No upcoming long leaves.</p>}
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-6">
                            <TrendingUp size={16} /> Monthly Trends
                        </h3>
                        {/* Reuse simple bar chart logic */}
                        <div className="flex items-end justify-between h-48 gap-2">
                            {data?.trends.map((t, i) => (
                                <div key={i} className="flex flex-col items-center flex-1 group">
                                    <div className="relative w-full bg-gray-50 rounded-t-sm h-full flex items-end overflow-hidden">
                                        <div
                                            className="w-full bg-[var(--color-brand-pink)] transition-all duration-1000 group-hover:bg-gray-800"
                                            style={{ height: `${Math.min(100, (t.leaves / 20) * 100)}%` }} // Scale roughly
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 rotate-0 truncate">{t.month}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
