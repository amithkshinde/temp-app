"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PublicHoliday } from '@/data/holiday-data';
import { format } from 'date-fns';

export default function HolidaysManagement() {
    const { logout } = useAuth();
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ name: '', date: '', id: '' });
    const [editMode, setEditMode] = useState(false);

    const fetchData = async () => {
        const res = await fetch('/api/holidays');
        if (res.ok) setHolidays(await res.json());
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // We also need fetchData for other actions (save/delete). 
    // Ideally we extract it or use SWR. For now, let's keep a ref or just duplicate reliance, 
    // BUT wait, handleSave uses fetchData. 
    // So better pattern: define fetchData using useCallback or just leave it out but add to dep array?
    // No, "Avoid calling setState directly". 
    // The issue is likely that it's called immediately. 
    // Let's rely on a separate standard function but ensure it's async properly.
    // Actually, I'll just keep the original structure but Wrap the call in useEffect in a way ensuring Async.
    // The previous error "Calling setState synchronously" is suspicious for an async function.
    // Let's try defining it inside UseEffect JUST for the initial load, and keep a separate one for updates if needed, 
    // or use `useCallback`.

    // Let's use useCallback to be clean.

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editMode) {
                await fetch(`/api/holidays/${formData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await fetch('/api/holidays', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`/api/holidays/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const openEdit = (h: PublicHoliday) => {
        setFormData(h);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const openAdd = () => {
        setFormData({ name: '', date: '', id: '' });
        setEditMode(false);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Public Holidays 🎈</h1>
                        <p className="text-gray-500">Add or edit public holidays for all employees.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={openAdd}>+ Add Holiday</Button>
                        <Button onClick={logout} variant="secondary">Sign out</Button>
                    </div>
                </header>

                <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-slate-50 text-xs uppercase text-gray-700">
                            <tr>
                                <th className="px-6 py-3">Festival</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Day</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {holidays.map((h) => (
                                <tr key={h.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{h.name}</td>
                                    <td className="px-6 py-4">{format(new Date(h.date), 'MMM d, yyyy')}</td>
                                    <td className="px-6 py-4">{format(new Date(h.date), 'EEEE')}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => openEdit(h)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(h.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {isLoading && <div className="p-8 text-center">Loading...</div>}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[var(--radius-xl)] p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Holiday' : 'Add Holiday'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <Input
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
