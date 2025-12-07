"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function LoginPage() {
    const { login, loginAsDemo } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (!email || !password) {
                setError('Please enter both email and password.');
                setIsLoading(false);
                return;
            }

            const res = await login(email, password);
            if (!res.success) {
                setError(res.error || 'Hmm, that didn&rsquo;t match. Try again?');
                // Toast could be here
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-[var(--radius-xl)] shadow-lg border border-slate-100">
                <div className="text-center space-y-2">
                    <div className="h-12 w-12 bg-[var(--color-brand-pink)] rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl">
                        LT
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back 👋</h1>
                    <p className="text-sm text-gray-500">
                        Log in to check your leave calendar.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <Link href="/forgot-password" className="font-medium text-[var(--color-brand-pink)] hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Log in
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-500">Or explore demo</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" onClick={() => loginAsDemo('employee')} className="text-xs">
                        Employee Demo
                    </Button>
                    <Button variant="secondary" onClick={() => loginAsDemo('management')} className="text-xs">
                        Manager Demo
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium text-[var(--color-brand-pink)] hover:underline">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}
