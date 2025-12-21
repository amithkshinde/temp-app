
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
            <div className="h-screen w-screen overflow-hidden bg-[#f2f2f2] flex flex-col">
                <DemoBanner />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="mx-auto max-w-7xl w-full p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
