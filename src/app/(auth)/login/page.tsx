"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';


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
                setError(res.error || 'Invalid credentials. Please try again.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
            <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-8 border border-white/50">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-[var(--color-brand-pink)] rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl mb-6">
                        LT
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome</h1>
                    <p className="text-sm text-gray-500 mt-2">Log in to manage your leaves</p>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Email Input */}
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
                                <Mail size={18} />
                            </div>
                            <Input
                                type="email"
                                placeholder="Email address"
                                className="pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
                                    <Lock size={18} />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            {/* Forgot Password Link */}
                            <div className="flex justify-end mt-2">
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg flex items-center gap-2">
                            <span className="shrink-0 w-1 h-4 bg-red-600 rounded-full"></span>
                            {error}
                        </div>
                    )}

                    {/* Primary CTA */}
                    <Button
                        type="submit"
                        className="w-full font-medium h-11 rounded-xl shadow-lg shadow-pink-100 transition-all active:scale-[0.98]"
                        isLoading={isLoading}
                    >
                        Login
                    </Button>
                </form>

                {/* Demo Mode Section */}
                {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <div className="text-center mb-4">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white px-2">
                                Explore demo mode
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 items-start">
                            <Button
                                variant="outline"
                                className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 h-10 font-normal"
                                onClick={() => loginAsDemo('employee')}
                            >
                                As Employee
                            </Button>
                            <div className="flex flex-col items-center gap-1.5 w-full">
                                <Button
                                    variant="outline"
                                    className="w-full border-slate-200 text-slate-400 bg-slate-50/50 hover:bg-slate-50/50 h-10 font-normal cursor-default opacity-70 shadow-none"
                                    onClick={(e) => e.preventDefault()}
                                    title="Manager demo will be available soon"
                                >
                                    As Manager
                                </Button>
                                <span className="text-[10px] font-medium text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-full tracking-wide">
                                    Coming Soon
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-medium text-slate-900 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
