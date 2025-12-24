
import React from 'react';
import { cn } from '@/lib/utils';

interface DateCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    /**
     * Content to render on the top right (e.g. Status Pill, Delete Button)
     */
    rightElement?: React.ReactNode;
    /**
     * Content to render on the bottom row (e.g. Leave Type Badge)
     */
    bottomElement?: React.ReactNode;
    /**
     * Border color utility class (e.g. "border-green-200")
     */
    borderColor?: string;
    /**
     * Background color utility class (e.g. "bg-white")
     */
    bgColor?: string;
}

export function DateCard({
    title,
    subtitle,
    rightElement,
    bottomElement,
    borderColor = "border-slate-200",
    bgColor = "bg-white",
    className,
    onClick,
    ...props
}: DateCardProps) {
    return (
        <div
            className={cn(
                "p-4 rounded-lg border transition-colors cursor-pointer group hover:bg-slate-50 relative",
                bgColor,
                borderColor,
                className
            )}
            onClick={onClick}
            {...props}
        >
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">
                        {title}
                    </span>
                    {subtitle && (
                        <span className="text-xs text-gray-500 mt-0.5">
                            {subtitle}
                        </span>
                    )}
                </div>
                {rightElement && (
                    <div className="shrink-0 ml-2">
                        {rightElement}
                    </div>
                )}
            </div>

            {bottomElement && (
                <div className="flex items-center justify-between mt-2">
                    {bottomElement}
                </div>
            )}
        </div>
    );
}
