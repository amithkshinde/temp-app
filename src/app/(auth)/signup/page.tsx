"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Department, Role } from '@/lib/types';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [role, setRole] = useState<Role>('employee');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        employeeId: '',
        department: '',
        inviteCode: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: role,
                ...(role === 'employee' ? {
                    employeeId: formData.employeeId,
                    department: formData.department
                } : {
                    inviteCode: formData.inviteCode
                })
            };

            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                // Success
                // Redirect to login (Requirement: No auto login)
                // Toast logic would be better but we'll use a url param or simple redirect
                router.push('/login?signup=success');
            } else {
                setError(data.error || 'Failed to create account');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const departmentOptions = Object.values(Department).map(d => ({ value: d, label: d }));

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-[var(--radius-xl)] shadow-lg border border-slate-100">
                <div className="text-center space-y-2">
                    <div className="h-12 w-12 bg-[var(--color-brand-pink)] rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl">
                        LT
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Let’s get you set up 🚀</h1>
                    <p className="text-sm text-gray-500">
                        Create an account to get started.
                    </p>
                </div>

                {/* Role Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => { setRole('employee'); setError(''); }}
                        className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${role === 'employee' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Employee
                    </button>
                    <button
                        type="button"
                        onClick={() => { setRole('management'); setError(''); }}
                        className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${role === 'management' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Management
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Full Name"
                        label="Full Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                    />
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        label="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                    />

                    {role === 'employee' && (
                        <>
                            <Input
                                id="employeeId"
                                name="employeeId"
                                placeholder="E-1234"
                                label="Employee ID"
                                value={formData.employeeId}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                            />
                            <Select
                                id="department"
                                name="department"
                                label="Department"
                                options={departmentOptions}
                                value={formData.department}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                            />
                        </>
                    )}

                    {role === 'management' && (
                        <Input
                            id="inviteCode"
                            name="inviteCode"
                            type="text"
                            placeholder="Enter invite code"
                            label="Invite Code"
                            value={formData.inviteCode}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        />
                    )}

                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Min 8 characters"
                        label="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength={8}
                        disabled={isLoading}
                    />

                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Sign Up
                    </Button>
                </form>

                <div className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-[var(--color-brand-pink)] hover:underline">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
