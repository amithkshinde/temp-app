"use client";

import { useNotifications } from "@/context/NotificationContext";
import { Bell, Trash2, Info, CheckCircle, AlertTriangle, XCircle, MailOpen } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";

export function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, dismissNotification, markAllAsRead, clearAll } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggle = () => setIsOpen(!isOpen);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggle}
                className="relative p-2 rounded-full hover:bg-black/5 transition-colors z-50 group"
                aria-label="Notifications"
            >
                <Bell className="w-[22px] h-[22px] text-gray-500 group-hover:text-gray-700 transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[var(--color-brand-pink)] rounded-full border-2 border-[var(--color-bg)]">
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-slate-200 rounded-[var(--radius-xl)] shadow-md z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <div>
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            <p className="text-xs text-gray-500">{unreadCount} unread</p>
                        </div>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="h-8 text-[10px] px-2 text-gray-500 hover:text-[var(--color-brand-pink)]"
                                >
                                    Mark all read
                                </Button>
                            )}
                        </div>
                    </div>

                    <ScrollContainer className="max-h-[60vh]">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <MailOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {notifications.map((notif) => (
                                    <li
                                        key={notif.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => markAsRead(notif.id)}
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className="mt-1 flex-shrink-0">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className={`text-sm leading-tight ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(notif.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 rounded-full bg-[var(--color-brand-pink)] mt-2"></div>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    dismissNotification(notif.id);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                title="Dismiss"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                </div>

                    {notifications.length > 0 && (
                <div className="p-2 border-t border-slate-100 bg-gray-50 rounded-b-[var(--radius-xl)]">
                    <button
                        onClick={clearAll}
                        className="w-full py-2 text-xs text-center text-gray-500 hover:text-red-500 flex items-center justify-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-3 h-3" /> Clear History
                    </button>
                </div>
            )}
        </div>
    )
}
        </div >
    );
}
