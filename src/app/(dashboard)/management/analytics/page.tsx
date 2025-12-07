
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnalyticsStatsCards } from '@/components/analytics/stats-cards';
import { ReliabilityChart } from '@/components/analytics/reliability-chart';
import { EmployeeReliabilityTable } from '@/components/analytics/employee-table';

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/insights/analytics');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleExport = () => {
        window.location.href = '/api/insights/export';
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;
    }

    if (!data) {
        return <div className="p-8 text-center text-red-500">Failed to load data</div>;
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] p-8 font-[family-name:var(--font-geist-sans)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/management/dashboard" className="p-2 hover:bg-slate-100 rounded-full text-gray-500 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Team Analytics</h1>
                        <p className="text-gray-500">Reliability scores and leave trends.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleExport} variant="outline" className="gap-2">
                        <Download size={16} />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <AnalyticsStatsCards deptStats={data.deptStats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart - Spans 2 cols */}
                <div className="lg:col-span-2">
                    <ReliabilityChart trends={data.trends} />
                </div>

                {/* Placeholder / Additional Insight - Spans 1 col */}
                <div className="bg-gradient-to-br from-[var(--color-brand-pink)] to-pink-600 rounded-[var(--radius-xl)] p-6 text-white flex flex-col justify-between h-64 shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold">Reliability Insight</h3>
                        <p className="text-pink-100 text-sm mt-2 opacity-90">
                            Engineering has the highest "Last Minute" request ratio this quarter. Consider reviewing sprint planning alignment.
                        </p>
                    </div>
                    <div className="relative z-10 mt-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-pink-200">Action Item</div>
                        <div className="text-sm font-bold mt-1">Schedule Usage Review</div>
                    </div>
                    {/* Decorative Blob */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                </div>
            </div>

            {/* Table */}
            <div className="mt-8">
                <EmployeeReliabilityTable data={data.reliabilityTable} />
            </div>
        </div>
    );
}
