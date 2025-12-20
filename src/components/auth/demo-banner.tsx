
"use client";

import { useAuth } from '@/context/AuthContext';

export function DemoBanner() {
    const { isDemo, user } = useAuth();
    if (!isDemo || !user) return null;

    return (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-amber-100/90 backdrop-blur-sm border border-amber-200 text-amber-900 px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm pointer-events-none select-none">
            Demo Mode
        </div>
    );
}
