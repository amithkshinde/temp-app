
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
            <div className="h-full w-full flex flex-col bg-[var(--color-background)] overflow-hidden">
                <DemoBanner />
                <main className="flex-1 w-full min-h-0 relative flex flex-col">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
