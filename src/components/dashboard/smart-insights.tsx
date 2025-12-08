import { Card } from '@/components/ui/card';
import { Leave } from '@/lib/types';
import { differenceInDays, parseISO } from 'date-fns';
import { TrendingUp, Calendar, Zap, Users } from 'lucide-react';
import { useMemo } from 'react';

interface SmartInsightsProps {
    leaves: Leave[];
}

export function SmartInsights({ leaves }: SmartInsightsProps) {
    const insights = useMemo(() => {
        if (!leaves.length) return null;

        const currentYear = new Date().getFullYear();
        const pastLeaves = leaves.filter(l =>
            l.status === 'approved' &&
            new Date(l.startDate).getFullYear() === currentYear &&
            new Date(l.startDate) <= new Date()
        );

        // 1. Avg Leaves Per Month
        // Simple logic: Total days taken / months passed (or 1 if Jan)
        const totalDaysTaken = pastLeaves.reduce((acc, l) => {
            const start = parseISO(l.startDate);
            const end = parseISO(l.endDate);
            return acc + differenceInDays(end, start) + 1; // Naive approximation for visual speed
        }, 0);

        const currentMonth = new Date().getMonth() + 1;
        const avgPerMonth = (totalDaysTaken / currentMonth).toFixed(1);

        // 2. Most Common Leave Day
        const daysMap: Record<string, number> = {};
        pastLeaves.forEach(l => {
            const dayName = parseISO(l.startDate).toLocaleDateString('en-US', { weekday: 'long' });
            daysMap[dayName] = (daysMap[dayName] || 0) + 1;
        });
        const commonDay = Object.entries(daysMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // 3. Burnout Risk (Mock Logic)
        // If taken < 2 days in last 3 months -> High
        const burnoutRisk = totalDaysTaken < 2 ? 'High' : totalDaysTaken < 5 ? 'Medium' : 'Low';
        const burnoutColor = burnoutRisk === 'High' ? 'text-red-500' : burnoutRisk === 'Medium' ? 'text-amber-500' : 'text-emerald-500';

        // 4. Team Impact (Mock)
        // Random "Low" or "Moderate" based on role? Let's just say "Low" for individual dashboard for now.
        const teamImpact = 'Low';

        return { avgPerMonth, commonDay, burnoutRisk, burnoutColor, teamImpact };
    }, [leaves]);

    if (!insights) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Avg / Month</p>
                        <p className="text-lg font-bold text-gray-900">{insights.avgPerMonth} <span className="text-xs font-normal text-gray-400">days</span></p>
                    </div>
                </div>
            </Card>

            <Card className="p-4 bg-white/60 backdrop-blur-sm border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Favorite Day</p>
                        <p className="text-lg font-bold text-gray-900">{insights.commonDay}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4 bg-white/60 backdrop-blur-sm border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                        <Zap size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Burnout Risk</p>
                        <p className={`text-lg font-bold ${insights.burnoutColor}`}>{insights.burnoutRisk}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4 bg-white/60 backdrop-blur-sm border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Users size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Team Impact</p>
                        <p className="text-lg font-bold text-emerald-600">{insights.teamImpact}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
