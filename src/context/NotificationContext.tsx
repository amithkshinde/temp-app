
"use client";


import React, { createContext, useContext, useState, useEffect } from 'react';
import { InAppNotification } from '@/lib/notifications';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    notifications: InAppNotification[]; // Filtered for current user
    unreadCount: number;
    addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error', targetUserId: string) => void;
    markAsRead: (id: string) => void;
    dismissNotification: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [allNotifications, setAllNotifications] = useState<InAppNotification[]>([]);

    // Fetch from Backend
    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const res = await fetch(`/api/notifications?userId=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setAllNotifications(data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchNotifications();
        // Poll every 30s for updates
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const addNotification = async (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', targetUserId: string) => {
        // Optimistic UI
        const newNotif: InAppNotification = {
            id: Math.random().toString(36).substr(2, 9),
            userId: targetUserId,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
        };

        if (user && targetUserId === user.id) {
            setAllNotifications(prev => [newNotif, ...prev]);
        }

        // Post to Backend
        await fetch('/api/notifications', {
            method: 'POST',
            body: JSON.stringify({ message, type, userId: targetUserId })
        });

        window.dispatchEvent(new CustomEvent('toast-dispatch', { detail: { message, type } }));
    };

    const markAsRead = (id: string) => {
        setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        // We'd ideally have an endpoint for single mark read, but for now we rely on re-fetch or assume client state is enough for session
    };

    const dismissNotification = (id: string) => {
        setAllNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAllAsRead = async () => {
        if (!user) return;

        // Optimistic
        setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));

        // Sync Backend
        await fetch('/api/notifications/mark-all-read', {
            method: 'POST',
            body: JSON.stringify({ userId: user.id })
        });
    };

    const clearAll = () => {
        // Not fully supported by backend mock yet, just clear local
        setAllNotifications([]);
    };

    // Filter for current user
    const notifications = user ? allNotifications.filter(n => n.userId === user.id) : [];
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, dismissNotification, markAllAsRead, clearAll }}>
            {children}
            <ToastContainer />
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};

// Simple Internal Toast UI
function ToastContainer() {
    const [toasts, setToasts] = useState<{ id: string, message: string, type: string }[]>([]);

    useEffect(() => {
        const handleToast = (e: Event) => {
            const { message, type } = (e as CustomEvent).detail;
            const id = Math.random().toString(36);
            setToasts(prev => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 5000);
        };
        window.addEventListener('toast-dispatch', handleToast);
        return () => window.removeEventListener('toast-dispatch', handleToast);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(t => (
                <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm animate-in slide-in-from-right fade-in duration-300 ${t.type === 'success' ? 'bg-emerald-600' :
                    t.type === 'error' ? 'bg-red-600' :
                        t.type === 'warning' ? 'bg-amber-500' : 'bg-blue-600'
                    }`}>
                    {t.message}
                </div>
            ))}
        </div>
    );
}
