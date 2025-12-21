import React from 'react';
import { Info } from 'lucide-react';

export function PolicySection() {
    return (
        <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-sm border border-slate-200 p-4 shrink-0 h-40 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-[#f0216a]" />
                <h3 className="text-sm text-gray-900 font-semibold tracking-tight">Policy Highlights</h3>
            </div>

            <ul className="text-xs text-gray-600 space-y-2 overflow-y-auto pr-1">
                <li className="flex items-start gap-2">
                    <span className="block w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                    <span>Casual leaves require <strong>2 days</strong> prior notice.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="block w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                    <span>Sick leaves exceeding <strong>3 days</strong> need a medical certificate.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="block w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                    <span>Unused privilege leaves carry forward up to <strong>15 days</strong>.</span>
                </li>
            </ul>
        </div>
    );
}
