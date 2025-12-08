
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


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
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* New Card: Allocated */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Annual Allocated</h3>
                        <p className="mt-2 text-4xl font-bold text-gray-900">24 <span className="text-lg font-normal text-gray-400">days</span></p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Taken</h3>
                        <p className="mt-2 text-4xl font-bold text-gray-900">{stats?.totalTaken || 0} <span className="text-lg font-normal text-gray-400">days</span></p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Holidays Used</h3>
                        <p className="mt-2 text-4xl font-bold text-gray-900">
                            {holidaysUsed.length} <span className="text-gray-300">/</span> <span className="text-xl text-gray-400">10</span>
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Q Remaining</h3>
                        {/* Determine current quarter safely */}
                        <p className="mt-2 text-4xl font-bold text-emerald-600">
                            {(() => {
                                const currentQ = Math.floor(new Date().getMonth() / 3);
                                return stats?.quarters[currentQ]?.remaining || 0;
                            })()} <span className="text-lg font-normal text-gray-400">days</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Available Now</p>
                    </div>
                </div>

                {/* Quarterly Chart (CSS Only Bar Chart) */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Quarterly Usage Trends</h3>
                    <div className="flex items-end justify-between h-48 gap-4">
                        {stats?.quarters.map((q, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 group">
                                <div className="relative w-full max-w-[60px] bg-gray-50 rounded-t-lg h-full flex items-end overflow-hidden border-b border-gray-200">
                                    <div
                                        className="w-full bg-[var(--color-brand-pink)] transition-all duration-1000 ease-out group-hover:opacity-90 rounded-t-sm"
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
