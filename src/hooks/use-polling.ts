import { useEffect, useRef } from 'react';

export function usePolling(callback: () => void, intervalMs: number = 5000) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (intervalMs !== null) {
            const id = setInterval(tick, intervalMs);
            return () => clearInterval(id);
        }
    }, [intervalMs]);
}
