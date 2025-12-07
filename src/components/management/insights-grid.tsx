
interface InsightsGridProps {
    stats: {
        activeToday: number;
        pending: number;
        totalRequests: number;
        topLeavers: Array<{ name: string; days: number }>;
    } | null;
}

export function InsightsGrid({ stats }: InsightsGridProps) {
    if (!stats) return <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-[var(--radius-xl)] border border-slate-100 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Active Today</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeToday}</p>
            </div>
            <div className="bg-white p-4 rounded-[var(--radius-xl)] border border-slate-100 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Pending Requests</p>
                <p className="text-3xl font-bold text-[var(--color-brand-pink)] mt-2">{stats.pending}</p>
            </div>
            <div className="bg-white p-4 rounded-[var(--radius-xl)] border border-slate-100 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Requests</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalRequests}</p>
            </div>
            <div className="bg-white p-4 rounded-[var(--radius-xl)] border border-slate-100 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Top Leaver</p>
                <p className="text-sm font-bold text-slate-900 mt-3 truncate">{stats.topLeavers[0]?.name || 'N/A'}</p>
                <p className="text-xs text-slate-400">{stats.topLeavers[0]?.days || 0} days taken</p>
            </div>
        </div>
    );
}
