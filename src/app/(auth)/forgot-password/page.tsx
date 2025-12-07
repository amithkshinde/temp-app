
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            setIsSent(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-[var(--radius-xl)] shadow-lg border border-slate-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Enter your email to receive a reset link.
                    </p>
                </div>

                {!isSent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Send Reset Link
                        </Button>
                        <div className="text-center">
                            <Link href="/login" className="text-sm font-medium text-[var(--color-brand-pink)] hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm">
                            If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                        </div>
                        <div className="text-xs text-gray-500">
                            (For this demo, click <Link href="/reset-password?token=mock-token" className="underline text-blue-600">here</Link> to simulate clicking the email link)
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
                            Try another email
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
