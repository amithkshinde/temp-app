
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // Assuming shadcn Dialog exists? check imports
import { Button } from "@/components/ui/button";

// If Dialog doesn't exist, I'll use a simple fixed overlay div for demo.
// Looking at `LeaveModal` previously, I used fixed overlay manually. I will stick to that to avoid dependency issues if shadcn/ui not fully installed. 
// Actually I can check `LeaveModal`. 
// Wait, I created `LeaveModal` in step 467 using standard HTML fixed overlay.
// I'll do the same here.

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any; // The row data
}

export function ReliabilityModal({ isOpen, onClose, data }: ModalProps) {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden m-4 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{data.user.name}</h2>
                        <p className="text-sm text-gray-500">{data.user.role} • {data.user.department}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Score Hero */}
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Reliability Score</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-3xl font-bold ${data.grade === 'A' || data.grade === 'B' ? 'text-emerald-600' :
                                        data.grade === 'C' ? 'text-amber-500' : 'text-red-500'
                                    }`}>
                                    {data.score}
                                </span>
                                <span className="text-sm font-semibold text-gray-400">Grade {data.grade}</span>
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-400 max-w-[150px]">
                            Based on attendance, short-notice requests, and rejection history.
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Breakdown</h3>

                        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                            <span className="text-gray-600">Total Leaves Taken</span>
                            <span className="font-semibold">{data.leavesTaken}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                            <span className="text-gray-600">Last Minute Requests</span>
                            <span className={`${data.lastMinuteLeaves > 0 ? 'text-amber-600 font-bold' : 'text-gray-900'}`}>{data.lastMinuteLeaves}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                            <span className="text-gray-600">Request Rejection Rate</span>
                            <span className={`${data.rejectionRatio > 0.1 ? 'text-red-600 font-bold' : 'text-gray-900'}`}>{Math.round(data.rejectionRatio * 100)}%</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <Button onClick={onClose} variant="outline">Close Report</Button>
                </div>
            </div>
        </div>
    );
}
