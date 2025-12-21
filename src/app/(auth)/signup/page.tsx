"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'employee'
            };

            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
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

                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        label="Confirm Password"
                        value={formData.confirmPassword}
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
