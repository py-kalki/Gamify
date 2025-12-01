import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';

export function TopBar() {
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

            {/* Right: Theme Toggle */}
            <div className="flex items-center gap-2 no-drag">
                <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-white/5 transition-colors"
                >
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
