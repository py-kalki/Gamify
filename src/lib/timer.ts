import { useState, useEffect } from 'react';

const STORAGE_KEY = 'gamify_timer_state';

interface TimerState {
    isRunning: boolean;
    startTime: number | null;
    elapsed: number;
}

// Helper to get state from storage
function getStoredState(): TimerState {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return { isRunning: false, startTime: null, elapsed: 0 };
}

// Helper to save state to storage
function setStoredState(state: TimerState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Dispatch event for cross-window sync
    window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(state)
    }));
}

export function useSharedTimer() {
    const [state, setState] = useState<TimerState>(getStoredState());

    // Sync with other windows/tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                setState(JSON.parse(e.newValue));
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Timer tick logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (state.isRunning) {
            interval = setInterval(() => {
                // Force update to trigger re-render
                setState(prev => ({ ...prev }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state.isRunning]);

    const toggleTimer = () => {
        const now = Date.now();
        if (state.isRunning) {
            // Pause: Calculate final elapsed and clear start time
            const currentSessionDuration = state.startTime ? Math.floor((now - state.startTime) / 1000) : 0;
            const newElapsed = state.elapsed + currentSessionDuration;
            setStoredState({
                isRunning: false,
                startTime: null,
                elapsed: newElapsed
            });
        } else {
            // Start: Set start time
            setStoredState({
                isRunning: true,
                startTime: now,
                elapsed: state.elapsed
            });
        }
    };

    const resetTimer = () => {
        setStoredState({
            isRunning: false,
            startTime: null,
            elapsed: 0
        });
    };

    // Calculate display time
    const currentSessionDuration = (state.isRunning && state.startTime)
        ? Math.floor((Date.now() - state.startTime) / 1000)
        : 0;
    const totalSeconds = state.elapsed + currentSessionDuration;

    return {
        isRunning: state.isRunning,
        seconds: totalSeconds,
        toggleTimer,
        resetTimer
    };
}
