
import { useEffect, useRef } from 'react';

export function usePolling(callback: () => void, interval: number = 3000) {
    const savedCallback = useRef(callback);

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (interval !== null) {
            const id = setInterval(tick, interval);
            return () => clearInterval(id);
        }
    }, [interval]);
}
