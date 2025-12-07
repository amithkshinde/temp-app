
"use client";

import { useState } from 'react';
import { ReliabilityModal } from './reliability-modal';

interface TableProps {
    data: any[];
}

export function EmployeeReliabilityTable({ data }: TableProps) {
    const [selectedUser, setSelectedUser] = useState<any>(null);

    return (
        <>
            <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-gray-800">Team Reliability Scores</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-gray-500 uppercase tracking-wider font-semibold text-xs">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Leaves Taken</th>
                                <th className="px-6 py-4">Wait Time Breach</th>
                                <th className="px-6 py-4 text-center">Score</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((row) => (
                                <tr key={row.user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {row.user.name}
                                        <div className="text-xs text-gray-400 font-normal">{row.user.employeeId}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{row.user.department || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{row.leavesTaken}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${row.lastMinuteLeaves > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                    style={{ width: `${(row.lastMinuteLeaves / (row.leavesTaken || 1)) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400">{row.lastMinuteLeaves}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${row.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                                row.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                                    row.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                            }`}>
                                            {row.score}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedUser(row)}
                                            className="text-[var(--color-brand-pink)] hover:underline font-medium text-xs"
                                        >
                                            View Report
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ReliabilityModal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                data={selectedUser}
            />
        </>
    );
}
