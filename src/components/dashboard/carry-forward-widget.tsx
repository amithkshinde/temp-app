import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { useState } from 'react';

export function CarryForwardWidget() {
    const [unsedLeaves, setUnusedLeaves] = useState(5);
    const CARRY_LIMIT = 5;

    const carriedOver = Math.min(unsedLeaves, CARRY_LIMIT);
    const lost = unsedLeaves > CARRY_LIMIT ? unsedLeaves - CARRY_LIMIT : 0;

    return (
        <Card className="p-6 bg-white border-slate-100 shadow-sm mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Carry Forward Simulator</h3>
            <p className="text-sm text-gray-500 mb-6">
                See how many of your unused leaves will carry over to next year.
                <span className="block text-xs mt-1 text-blue-600 font-medium">Policy: Max {CARRY_LIMIT} days carry forward.</span>
            </p>

            <div className="space-y-8">
                <div>
                    <div className="flex justify-between text-sm font-medium mb-2">
                        <span>If you have <span className="text-blue-600 font-bold">{unsedLeaves}</span> unused leaves:</span>
                    </div>
                    {/* Native range input as generic Slider replacement to avoid missing component issues */}
                    <input
                        type="range"
                        min="0"
                        max="20"
                        value={unsedLeaves}
                        onChange={(e) => setUnusedLeaves(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0</span>
                        <span>10</span>
                        <span>20</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                        <p className="text-sm text-emerald-700 font-medium">Will Carry Forward</p>
                        <p className="text-3xl font-bold text-emerald-600 mt-1">{carriedOver}</p>
                    </div>
                    <div className={`p-4 rounded-xl border text-center transition-colors ${lost > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                        <p className={`text-sm font-medium ${lost > 0 ? 'text-red-700' : 'text-slate-500'}`}>Will Lapse</p>
                        <p className={`text-3xl font-bold mt-1 ${lost > 0 ? 'text-red-600' : 'text-slate-400'}`}>{lost}</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
