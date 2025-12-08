import { LeaveBalance } from '@/lib/types';

interface StatsStripProps {
    balance: LeaveBalance | null;
    isLoading: boolean;
    holidayUsage?: { count: number; limit: number };
}

export function StatsStrip({ balance, isLoading, holidayUsage }: StatsStripProps) {
    if (isLoading || !balance) {
        return <div className="animate-pulse h-24 bg-slate-100 rounded-xl w-full"></div>;
    }

    const cards = [
        { label: 'Total Leaves', value: balance.allocated, sub: 'Yearly Total' },
        { label: 'Taken', value: balance.taken, sub: 'This Year' },
        { label: 'Remaining', value: balance.remaining, sub: 'Available', highlight: true },
        { label: 'Carried Forward', value: balance.carriedForward, sub: 'From last year' },
    ];

    return (
        <div className="w-full">
            {/* Changed from overflow-x-auto to flex/grid for full width expansion */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white p-4 rounded-[var(--radius-xl)] border border-slate-100 shadow-sm flex-1 min-w-[120px]">
                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">{card.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${card.highlight ? 'text-[var(--color-brand-pink)]' : 'text-slate-900'}`}>
                            {card.value}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">{card.sub}</p>
                    </div>
                ))}

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
