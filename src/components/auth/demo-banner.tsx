
"use client";

import { useAuth } from '@/context/AuthContext';

export function DemoBanner() {
    const { isDemo, user } = useAuth();
    if (!isDemo || !user) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#FACC15] text-[#0B0B0B] px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm pointer-events-none select-none backdrop-blur-sm bg-opacity-95">
            Demo Mode: Some features are limited in this view.
        </div>
    );
}
