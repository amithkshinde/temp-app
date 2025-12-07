
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface QuarterStats {
    name: string;
    allocated: number;
    taken: number;
    carryForward: number;
    remaining: number;
}

export default function YearlySummaryPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<{ quarters: QuarterStats[], totalTaken: number } | null>(null);
    const [holidaysUsed, setHolidaysUsed] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [summaryRes, holidayRes] = await Promise.all([
                    fetch(`/api/leaves/summary?userId=${user.id}`),
                    fetch(`/api/users/${user.id}/holiday-selection`)
                ]);

                if (summaryRes.ok) setStats(await summaryRes.json());
                if (holidayRes.ok) setHolidaysUsed(await holidayRes.json());
            } catch (error) {
                console.error("Failed to load summary", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleExportCSV = () => {
        if (!stats) return;
        const headers = ["Quarter", "Allocated", "Carry Fwd", "Taken", "Remaining"];
        const rows = stats.quarters.map(q => [q.name, q.allocated, q.carryForward, q.taken, q.remaining]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leave_summary_${user?.name}_${new Date().getFullYear()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading || !user) {
        return <div className="p-8 flex justify-center text-gray-400">Loading summary...</div>;
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)] p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href="/employee/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Yearly Summary</h1>
                            <p className="text-gray-500">Performance and Leave Analysis • {new Date().getFullYear()}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                            <FileText size={16} /> Export CSV
                        </Button>
                        <Button onClick={handlePrint} className="gap-2 bg-[var(--color-brand-pink)] hover:bg-pink-700 text-white">
                            <Download size={16} /> Export PDF
                        </Button>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Leaves Taken</h3>
                        <p className="mt-2 text-4xl font-bold text-gray-900">{stats?.totalTaken || 0} <span className="text-lg font-normal text-gray-400">days</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Public Holidays Used</h3>
                        <p className="mt-2 text-4xl font-bold text-gray-900">
                            {holidaysUsed.length} <span className="text-gray-300">/</span> <span className="text-xl text-gray-400">10</span>
                        </p>
                        <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                            <div
                                className={`h-full ${holidaysUsed.length > 10 ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, (holidaysUsed.length / 10) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Q Remaining</h3>
                        {/* Assuming current Q is derived from simple date check or passed from API. Using Q1 default for simple mock visualization if undefined */}
                        <p className="mt-2 text-4xl font-bold text-emerald-600">
                            {stats?.quarters[0].remaining || 0} <span className="text-lg font-normal text-gray-400">days</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Available for immediate request</p>
                    </div>
                </div>

                {/* Quarterly Chart (CSS Only Bar Chart) */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Usage Trends</h3>
                    <div className="flex items-end justify-between h-48 gap-4">
                        {stats?.quarters.map((q, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 group">
                                <div className="relative w-full max-w-[60px] bg-gray-100 rounded-t-lg h-full flex items-end overflow-hidden">
                                    {/* Background track */}
                                    {/* Fill bar */}
                                    <div
                                        className="w-full bg-[var(--color-brand-pink)] transition-all duration-1000 ease-out group-hover:opacity-80"
                                        style={{ height: `${Math.min(100, (q.taken / (q.allocated + q.carryForward)) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="font-bold text-gray-900">{q.taken}</p>
                                    <p className="text-xs text-gray-500">{q.name.split(' ')[0]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Quarterly Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Period</th>
                                    <th className="px-6 py-3 font-medium">Allocated</th>
                                    <th className="px-6 py-3 font-medium">Carried Fwd</th>
                                    <th className="px-6 py-3 font-medium">Total Available</th>
                                    <th className="px-6 py-3 font-medium">Taken</th>
                                    <th className="px-6 py-3 font-medium text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats?.quarters.map((q, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{q.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{q.allocated}</td>
                                        <td className="px-6 py-4 text-gray-500">{q.carryForward}</td>
                                        <td className="px-6 py-4 font-mono">{q.allocated + q.carryForward}</td>
                                        <td className="px-6 py-4 text-red-500 font-medium">-{q.taken}</td>
                                        <td className="px-6 py-4 text-emerald-600 font-bold text-right">{q.remaining}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
