import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sun, Moon, X, Square } from 'lucide-react';

interface TopBarProps {
    onSwitchToWidget?: () => void;
}

export function TopBar({ onSwitchToWidget }: TopBarProps) {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Initialize theme
        const storedTheme = localStorage.getItem('gamify_theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('gamify_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('gamify_theme', 'light');
        }
    };

    const handleMinimize = () => {
        if (window.electron && window.electron.windowControl) {
            window.electron.windowControl('minimize');
        }
    };

    const handleMaximize = () => {
        if (window.electron && window.electron.windowControl) {
            window.electron.windowControl('maximize');
        }
    };

    const handleClose = () => {
        if (window.electron && window.electron.windowControl) {
            window.electron.windowControl('close');
        }
    };

    return (
        <div className="h-12 bg-background border-b border-white/5 flex items-center justify-between px-4 drag-region select-none">
            {/* Left: Navigation */}
            <div className="flex items-center gap-2 no-drag">
                <button
                    onClick={() => navigate(-1)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={() => navigate(1)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Center: Title */}
            <div className="absolute left-1/2 -translate-x-1/2 font-bold tracking-widest text-sm text-gray-400">
                GAMIFY
            </div>

            {/* Right: Theme Toggle & Widget & Window Controls */}
            <div className="flex items-center gap-2 no-drag">
                <button
                    onClick={onSwitchToWidget}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
                >
                    Widget Mode
                </button>
                <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-white/5 transition-colors"
                >
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>

                <div className="w-px h-4 bg-white/10 mx-1" />

                <button
                    onClick={handleMinimize}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <div className="w-3 h-px bg-current" />
                </button>
                <button
                    onClick={handleMaximize}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <Square className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
