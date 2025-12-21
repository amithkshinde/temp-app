
"use client";

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DemoBanner } from '@/components/auth/demo-banner';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
                <DemoBanner />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
