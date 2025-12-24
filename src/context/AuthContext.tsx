"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isDemo: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginAsDemo: (role: Role) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            // If already in demo mode (in-memory), skip check
            if (isDemo) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/users/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    // 401 or other error: simply clear user, do NOT redirect here.
                    // Let ProtectedRoute handle redirection based on current path.
                    setUser(null);
                }
            } catch (err) {
                console.error('Session check failed', err);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, [isDemo]); // Dependency minimal to avoid loops

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.user) {
                setUser(data.user);
                setIsDemo(false);
                const dashboard = data.user.role === 'management' ? '/management/dashboard' : '/employee/dashboard';
                router.push(dashboard);
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Login failed' };
            }
        } catch {
            return { success: false, error: 'Network error' };
        } finally {
            setIsLoading(false);
        }
    };

    const loginAsDemo = (role: Role) => {
        setIsDemo(true);
        const demoUser: User = {
            id: role === 'employee' ? 'demo-emp' : 'demo-mgr',
            name: role === 'employee' ? 'Amith Shinde' : 'Demo Manager',
            email: `demo.${role}@example.com`,
            role: role,
            demo: true,
            department: 'Engineering',
            employeeId: role === 'employee' ? 'DEMO-001' : undefined
        };
        setUser(demoUser);
        const dashboard = role === 'management' ? '/management/dashboard' : '/employee/dashboard';
        router.push(dashboard);
    };

    const logout = async () => {
        setUser(null);
        setIsDemo(false);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) { console.error(e) }
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isDemo, login, loginAsDemo, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
