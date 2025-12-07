
"use client";

import { useAuth } from '@/context/AuthContext';

export function DemoBanner() {
    const { isDemo, user } = useAuth();
    if (!isDemo || !user) return null;

    return (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-800 px-4 py-1 text-center text-xs font-semibold">
            🚧 Demo Mode: You are viewing as {user.role}. Actions are simulated and changes are temporary.
        </div>
    );
}
