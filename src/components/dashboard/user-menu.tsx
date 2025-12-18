"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

import { LogOut } from "lucide-react";

export function UserMenu() {
    const { user, logout } = useAuth();
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

    if (!user) return null;

    // Get initials
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-9 h-9 flex items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs ring-2 ring-transparent hover:ring-slate-200 transition-all focus:outline-none"
                aria-label="User Menu"
            >
                {initials}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-[var(--radius-xl)] shadow-md z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="p-4 bg-slate-50/50">
                        <p className="font-bold text-sm text-gray-900 truncate">{user.name.split(' ')[0]}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                    </div>

                    <div className="border-t border-slate-100">


                        <button
                            onClick={logout}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                        >
                            <LogOut size={14} />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
