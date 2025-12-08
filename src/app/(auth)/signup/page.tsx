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
                    {/* Google Login Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full relative flex items-center justify-center gap-2 py-5 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all"
                        onClick={() => alert("Google Login Simulation: Redirecting to OAuth...")}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                style={{ fill: '#4285F4' }}
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                style={{ fill: '#34A853' }}
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                style={{ fill: '#FBBC05' }}
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                style={{ fill: '#EA4335' }}
                            />
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">Or continue with email</span>
                        </div>
                    </div>

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

                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Create Account
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
