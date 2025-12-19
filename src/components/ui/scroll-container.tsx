"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ScrollContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string; // Class for the outer wrapper
    contentClassName?: string; // Class for the scrolling content
}

export function ScrollContainer({ children, className, contentClassName, ...props }: ScrollContainerProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    const [contentHeight, setContentHeight] = useState(0);
    const [contentScrollHeight, setContentScrollHeight] = useState(0);

    // Restored state
    const [thumbHeight, setThumbHeight] = useState(20);
    const [scrollTop, setScrollTop] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showThumb, setShowThumb] = useState(false);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate thumb height and store dimensions
    const handleResize = useCallback(() => {
        if (!contentRef.current) return;
        const { clientHeight, scrollHeight } = contentRef.current;

        setContentHeight(clientHeight);
        setContentScrollHeight(scrollHeight);

        const totalHeight = clientHeight;
        const totalScrollableHeight = scrollHeight;

        // Only show if scrollable
        if (totalScrollableHeight <= totalHeight) {
            setThumbHeight(0);
            return;
        }

        const newThumbHeight = Math.max(
            (totalHeight / totalScrollableHeight) * totalHeight,
            30 // Min thumb height
        );
        setThumbHeight(newThumbHeight);
    }, []);

    // Observer for content resizing
    useEffect(() => {
        if (!contentRef.current) return;
        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(contentRef.current);
        handleResize(); // Initial call

        // Also listen to window resize
        window.addEventListener('resize', handleResize);

        const currentRef = contentRef.current;
        return () => {
            if (currentRef) resizeObserver.unobserve(currentRef);
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
        // Added contentRef as dependency for cleaner effect restart if ref changes (unlikely but safe)
    }, [handleResize]);

    // Handle Scroll
    const handleScroll = useCallback(() => {
        if (!contentRef.current) return;
        const { scrollTop: newScrollTop } = contentRef.current;
        setScrollTop(newScrollTop);

        // Show thumb
        setShowThumb(true);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        if (!isHovering && !isDragging) {
            hideTimeoutRef.current = setTimeout(() => setShowThumb(false), 1500);
        }

    }, [isHovering, isDragging]);

    // Handle Drag
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setShowThumb(true);

        const startY = e.clientY;
        const startScrollTop = contentRef.current?.scrollTop || 0;
        const { scrollHeight, clientHeight } = contentRef.current || { scrollHeight: 0, clientHeight: 0 };
        const maxScrollTop = scrollHeight - clientHeight;
        const maxThumbTop = clientHeight - thumbHeight;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (!contentRef.current) return;
            const deltaY = moveEvent.clientY - startY;

            // Convert deltaY (thumb movement) to deltaScroll (content movement)
            // Ratio: maxScrollTop / maxThumbTop
            const scrollRatio = maxScrollTop / maxThumbTop;
            const deltaScroll = deltaY * scrollRatio;

            contentRef.current.scrollTop = Math.min(maxScrollTop, Math.max(0, startScrollTop + deltaScroll));
        };

        const onMouseUp = () => {
            setIsDragging(false);
            if (!isHovering) {
                if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = setTimeout(() => setShowThumb(false), 1000);
            }
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [thumbHeight, isHovering]);

    // Visibility Effect
    useEffect(() => {
        if (isHovering || isDragging) {
            // redundant: setShowThumb(true); 
            // We just clear timeout so it doesn't hide while interacting
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        } else {
            // If we just stopped hovering, verify if we should hide
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = setTimeout(() => setShowThumb(false), 1000);
        }
        return () => {
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        }
    }, [isHovering, isDragging]);


    // Calculated Top Position for Thumb
    const calculateThumbTop = () => {
        // Use state values instead of ref during render
        const maxScrollTop = contentScrollHeight - contentHeight;
        if (maxScrollTop <= 0) return 0;

        const maxThumbTop = contentHeight - thumbHeight;
        const ratio = scrollTop / maxScrollTop;
        return Math.min(maxThumbTop, Math.max(0, ratio * maxThumbTop));
    };

    const thumbTop = calculateThumbTop();

    return (
        <div
            className={cn("relative overflow-hidden group/scroll", className)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            {...props}
        >
            <div
                ref={contentRef}
                onScroll={handleScroll}
                className={cn(
                    "w-full h-full overflow-y-auto no-scrollbar scroll-smooth",
                    contentClassName
                )}
            >
                {children}
            </div>

            {/* Custom Thumb */}
            {thumbHeight > 0 && (
                <div
                    className={cn(
                        "absolute right-1 top-0 w-1.5 rounded-full bg-gray-400 transition-opacity duration-300 select-none touch-none",
                        (showThumb || isHovering || isDragging) ? "opacity-40 hover:opacity-80" : "opacity-0",
                        isDragging && "opacity-80"
                    )}
                    style={{
                        height: thumbHeight,
                        transform: `translateY(${thumbTop}px)`,
                        cursor: 'grab' // Using grab cursor so user knows it interacts
                    }}
                    onMouseDown={handleMouseDown}
                />
            )}
        </div>
    );
}
