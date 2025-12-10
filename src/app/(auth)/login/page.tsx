"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
            <div className="w-full max-w-md space-y-10 bg-white p-10 rounded-[var(--radius-xl)] shadow-xl border border-slate-200">

                <div className="text-center space-y-6 flex flex-col items-center">
                    <div className="w-full flex justify-center">
                        <Image
                            src="/twist-logo.png"
                            alt="Twist Open"
                            width={200}
                            height={80}
                            className="h-16 w-auto object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Twist Open Leave Tracker</h1>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-6">


                        <div>
                            <label className="block text-sm font-bold text-[#4A4A4A] mb-2" htmlFor="email">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                className="placeholder:text-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#4A4A4A] mb-2" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="placeholder:text-gray-400 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end text-sm">
                        <Link href="/forgot-password" className="font-bold text-[var(--color-brand-pink)] hover:underline hover:text-pink-700">
                            Forgot password?
                        </Link>
                    </div>

                    {error && (
                        <div className="p-4 text-sm font-medium text-red-600 bg-red-50 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full font-bold h-11 text-base shadow-lg shadow-pink-100" isLoading={isLoading}>
                        Log in
                    </Button>
                </form>



                <div className="text-center text-sm text-[#4A4A4A] font-medium pt-2">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-bold text-[var(--color-brand-pink)] hover:underline">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}
