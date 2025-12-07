
"use client";

interface Trend {
    month: string;
    leaves: number;
}

export function ReliabilityChart({ trends }: { trends: Trend[] }) {
    if (!trends || trends.length === 0) return <div>No data</div>;

    const max = Math.max(...trends.map(t => t.leaves), 1); // Avoid div by zero

    return (
        <div className="w-full h-64 bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Leave Trends (Last 6 Months)</h3>
            <div className="flex items-end justify-between h-40 gap-4">
                {trends.map((t, i) => {
                    const heightPercent = (t.leaves / max) * 100;
                    return (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-gray-800 text-white px-2 py-1 rounded absolute mb-8">
                                {t.leaves} Leaves
                            </div>

                            {/* Bar */}
                            <div
                                className="w-full max-w-[40px] bg-slate-100 rounded-t-sm relative overflow-hidden group-hover:bg-slate-200 transition-colors"
                                style={{ height: '100%' }}
                            >
                                <div
                                    className="absolute bottom-0 left-0 w-full bg-[var(--color-brand-pink)] rounded-t-sm transition-all duration-500 ease-out"
                                    style={{ height: `${heightPercent}%` }}
                                />
                            </div>

                            {/* Label */}
                            <span className="text-xs text-gray-500 font-medium">{t.month}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
