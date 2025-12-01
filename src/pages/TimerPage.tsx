import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export function TimerPage() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
    const [xpEarned, setXpEarned] = useState(0);

    const [modes, setModes] = useState({
        focus: { label: 'Focus', minutes: 25, color: 'text-primary', ring: 'stroke-primary' },
        short: { label: 'Short Break', minutes: 5, color: 'text-green-400', ring: 'stroke-green-400' },
        long: { label: 'Long Break', minutes: 15, color: 'text-blue-400', ring: 'stroke-blue-400' },
    });

    useEffect(() => {
        const loadSettings = () => {
            const stored = localStorage.getItem('gamify_timer_settings');
            if (stored) {
                const settings = JSON.parse(stored);
                setModes(prev => ({
                    ...prev,
                    focus: { ...prev.focus, minutes: settings.focusDuration },
                    short: { ...prev.short, minutes: settings.shortBreakDuration },
                    long: { ...prev.long, minutes: settings.longBreakDuration },
                }));
                // Only update time left if not active
                if (!isActive) {
                    // We need to know which mode is active to update correctly, 
                    // but since we can't easily access the *current* mode in this closure without ref or dependency,
                    // we'll just rely on the user resetting or changing modes for now, 
                    // OR we can add 'mode' to dependency but that might trigger unwanted resets.
                    // Let's just update the modes state. The user will see new time on next reset/mode change.
                }
            }
        };

        loadSettings();
        window.addEventListener('timer-settings-updated', loadSettings);
        return () => window.removeEventListener('timer-settings-updated', loadSettings);
    }, []);

    // Update timeLeft when modes change if not active
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(modes[mode].minutes * 60);
        }
    }, [modes, mode, isActive]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            if (mode === 'focus') {
                setXpEarned(prev => prev + 100);
                // In a real app, we'd persist this XP
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(modes[mode].minutes * 60);
    };

    const changeMode = (newMode: 'focus' | 'short' | 'long') => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(modes[newMode].minutes * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((modes[mode].minutes * 60 - timeLeft) / (modes[mode].minutes * 60)) * 100;
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex-1 bg-background p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Glow */}
            <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 pointer-events-none",
                mode === 'focus' ? 'bg-primary' : mode === 'short' ? 'bg-green-500' : 'bg-blue-500'
            )} />

            <div className="z-10 flex flex-col items-center">
                {/* Mode Selectors */}
                <div className="flex bg-surface rounded-full p-1 mb-12 border border-white/10">
                    {(Object.keys(modes) as Array<keyof typeof modes>).map((m) => (
                        <button
                            key={m}
                            onClick={() => changeMode(m)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                mode === m ? "bg-white/10 text-white shadow-lg" : "text-gray-400 hover:text-white"
                            )}
                        >
                            {modes[m].label}
                        </button>
                    ))}
                </div>

                {/* Timer Display */}
                <div className="relative mb-12 group">
                    {/* SVG Ring */}
                    <svg className="w-[300px] h-[300px] transform -rotate-90">
                        <circle
                            cx="150"
                            cy="150"
                            r={radius}
                            className="stroke-white/5"
                            strokeWidth="8"
                            fill="transparent"
                        />
                        <motion.circle
                            cx="150"
                            cy="150"
                            r={radius}
                            className={modes[mode].ring}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={circumference}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1, ease: "linear" }}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Time Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={cn("text-7xl font-bold font-mono tracking-wider", modes[mode].color)}>
                            {formatTime(timeLeft)}
                        </div>
                        <div className="text-gray-400 mt-2 font-medium uppercase tracking-widest text-sm">
                            {isActive ? 'Running' : 'Paused'}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleTimer}
                        className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
                            isActive ? "bg-surface border border-white/10 text-white" : "bg-white text-black"
                        )}
                    >
                        {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>

                    <button
                        onClick={resetTimer}
                        className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>

                {/* XP Notification */}
                <AnimatePresence>
                    {xpEarned > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-12 flex items-center bg-yellow-400/10 text-yellow-400 px-4 py-2 rounded-lg border border-yellow-400/20"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            <span className="font-bold">+{xpEarned} XP Earned Today!</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
