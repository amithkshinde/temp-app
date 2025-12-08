
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { PublicHoliday } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface HolidaySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableHolidays: PublicHoliday[];
    selectedHolidayIds: string[];
    onSave: (selectedIds: string[]) => Promise<void>;
}

export function HolidaySelectionModal({
    isOpen,
    onClose,
    availableHolidays,
    selectedHolidayIds,
    onSave
}: HolidaySelectionModalProps) {
    const [selected, setSelected] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelected(selectedHolidayIds);
        }
    }, [isOpen, selectedHolidayIds]);

    if (!isOpen) return null;

    const toggleSelection = (id: string) => {
        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onSave(selected);
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const filteredHolidays = availableHolidays.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.date.includes(search)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[var(--radius-xl)] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Select Public Holidays</h2>
                        <p className="text-xs text-gray-500 mt-1">Select the holidays you wish to observe ({selected.length} selected).</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
                        <X size={18} />
                    </Button>
                </div>

                <div className="p-4 border-b border-gray-100 bg-white">
                    <Input
                        placeholder="Search holidays..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-2">
                        {filteredHolidays.map(h => {
                            const isSelected = selected.includes(h.id);
                            return (
                                <div
                                    key={h.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${isSelected
                                            ? 'bg-pink-50 border-[var(--color-brand-pink)]'
                                            : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                                        }`}
                                    onClick={() => toggleSelection(h.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[var(--color-brand-pink)] border-[var(--color-brand-pink)] text-white' : 'border-gray-300 bg-white'
                                            }`}>
                                            {isSelected && <Check size={12} />}
                                        </div>
                                        <div>
                                            <p className={`font-medium text-sm ${isSelected ? 'text-[var(--color-brand-pink)]' : 'text-gray-900'}`}>{h.name}</p>
                                            <p className="text-xs text-gray-500">{h.date}</p>
                                        </div>
                                    </div>
                                    {isSelected && <span className="text-xs font-semibold text-[var(--color-brand-pink)]">Selected</span>}
                                </div>
                            );
                        })}
                        {filteredHolidays.length === 0 && (
                            <p className="text-center text-gray-400 py-8">No holidays found.</p>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-[var(--color-brand-pink)] hover:opacity-90 text-white">
                        {isLoading ? 'Saving...' : `Save Selection (${selected.length})`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
