
"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to reset password');
            } else {
                setSuccess(true);
            }
        } catch {
            setError('Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center text-red-500">
                Invalid or missing reset token.
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-5">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-2xl">
                    ✓
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Password Reset!</h2>
                    <p className="text-gray-500 mt-2">
                        Your password has been successfully updated.
                    </p>
                </div>
                <Link href="/login">
                    <Button className="w-full">Log in with new password</Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <Input
                    type="password"
                    label="New Password"
                    placeholder="Min 8 chars, 1 number, 1 special"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
                Reset Password
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-[var(--radius-xl)] shadow-lg border border-slate-100">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Create New Password</h1>
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
