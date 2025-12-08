import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { PublicHoliday } from '@/lib/types';

interface HolidayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (holiday: Omit<PublicHoliday, 'id'>) => Promise<void>;
    existingHolidays: PublicHoliday[];
    onDelete: (id: string) => Promise<void>;
}

export function HolidayModal({ isOpen, onClose, onAdd, existingHolidays, onDelete }: HolidayModalProps) {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date) return;

        setIsLoading(true);
        try {
            await onAdd({ name, date, type: 'public' });
            setName('');
            setDate('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[var(--radius-xl)] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Manage Holidays</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
                        <X size={18} />
                    </Button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Add New Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add New Holiday</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500">Holiday Name</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Founder's Day"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500">Date</label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Adding...' : 'Add Holiday'}
                        </Button>
                    </form>

                    {/* Existing List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Existing Holidays (2025)</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {existingHolidays.sort((a, b) => a.date.localeCompare(b.date)).map(h => (
                                <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{h.name}</p>
                                            <p className="text-xs text-gray-500">{h.date}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (confirm(`Delete ${h.name}?`)) onDelete(h.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            ))}
                            {existingHolidays.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">No holidays defined.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Done</Button>
                </div>
            </div>
        </div>
    );
}
