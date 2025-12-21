import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { PublicHoliday } from '@/lib/types';
import { ScrollContainer } from '@/components/ui/scroll-container';
import { DateCard } from '@/components/ui/date-card';

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
    const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);

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
                        <ScrollContainer className="max-h-60" contentClassName="pr-2 space-y-2">
                            {existingHolidays.sort((a, b) => a.date.localeCompare(b.date)).map(h => (
                                <DateCard
                                    key={h.id}
                                    title={h.name}
                                    subtitle={h.date}
                                    // Make bg white to match "Upcoming" style (was slate-50)
                                    bgColor="bg-white"
                                    borderColor="border-slate-100 group-hover:border-slate-200"
                                    rightElement={
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setHolidayToDelete(h.id);
                                            }}
                                            className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Delete
                                        </Button>
                                    }
                                />
                            ))}
                            {existingHolidays.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">No holidays defined.</p>
                            )}
                        </ScrollContainer>
                    </div>
                </div>


                <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Done</Button>
                </div>

                {/* Delete Confirmation Overlay */}
                {holidayToDelete && (
                    <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                        <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-6 max-w-sm w-full space-y-4 text-center">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-xl">🗑️</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Holiday?</h3>
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete this holiday? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-2 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setHolidayToDelete(null)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-red-600 hover:bg-red-700 text-white border-none"
                                    onClick={async () => {
                                        if (holidayToDelete) {
                                            setIsLoading(true);
                                            await onDelete(holidayToDelete);
                                            setIsLoading(false);
                                            setHolidayToDelete(null);
                                        }
                                    }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
