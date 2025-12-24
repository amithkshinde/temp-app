
"use client";

import { useAuth } from '@/context/AuthContext';

export function DemoBanner() {
    const { isDemo, user } = useAuth();
    if (!isDemo || !user) return null;

    return (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] bg-amber-100/80 backdrop-blur-sm border border-amber-200 shadow-sm rounded-full px-3 py-1.5 text-xs font-bold text-gray-900 pointer-events-none select-none">
            Demo Mode: Some features are limited in this view.
        </div>
    );
}
