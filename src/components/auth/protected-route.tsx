
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Role } from '@/lib/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                // Not authenticated
                router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
            } else if (allowedRoles && !allowedRoles.includes(user.role)) {
                // Role mismatch, redirect to correct dashboard
                const destination = user.role === 'management' ? '/management/dashboard' : '/employee/dashboard';
                router.replace(destination);
            }
        }
    }, [user, isLoading, router, pathname, allowedRoles]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[var(--bg)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--color-brand-pink)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Checking Access...</p>
                </div>
            </div>
        );
    }

    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        return null; // Return null while redirecting
    }

    return <>{children}</>;
}
