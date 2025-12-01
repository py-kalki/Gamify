import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Play, Pause, LayoutDashboard, Timer, Settings, LogOut } from 'lucide-react';
import { fetchTodayActivity, calculateStats, type GamificationStats } from '../lib/gamification';
import { useSharedTimer } from '../lib/timer';

export function WidgetPage() {
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isRunning, seconds, toggleTimer } = useSharedTimer();

    useEffect(() => {
        // Fetch stats
        async function loadData() {
            const events = await fetchTodayActivity();
            const calculatedStats = calculateStats(events);
            setStats(calculatedStats);
        }
        loadData();
        const interval = setInterval(loadData, 60000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const hours = stats ? Math.floor(stats.productiveTime / 3600) : 0;
    const minutes = stats ? Math.floor((stats.productiveTime % 3600) / 60) : 0;
    const percent = Math.min(100, Math.round((stats?.productiveTime || 0) / (8 * 3600) * 100));

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}`;
    };

    const handleOpenDashboard = () => {
        if (window.opener) {
            window.opener.focus();
        } else {
            window.open('/', '_blank');
        }
    };

    return (
        <div className="w-screen h-screen bg-transparent flex items-center justify-center p-4">
            {/* Widget Bar */}
            <div className="relative w-[600px] h-[80px] bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center px-6 shadow-2xl overflow-visible">

                {/* Time Since Last Break */}
                <div className="flex flex-col mr-8">
                    <div className="text-2xl font-bold text-white font-mono">{formatTime(seconds)}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Focus Time</div>
                </div>

                {/* Work Hours */}
                <div className="flex flex-col mr-8">
                    <div className="text-2xl font-bold text-indigo-400 font-mono">
                        {hours} hr {minutes} min
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Work Hours</div>
                </div>

                {/* Percent of Day */}
                <div className="flex flex-col flex-1">
                    <div className="text-2xl font-bold text-gray-200 font-mono">
                        {percent}%
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Percent of Day</div>
                </div>

                {/* Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5"
                >
                    {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-[90px] right-0 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={handleOpenDashboard}
                                    className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-3 text-gray-500" />
                                    Show Dashboard
                                </button>

                                <div className="h-px bg-white/10 my-1" />

                                <button
                                    onClick={toggleTimer}
                                    className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    {isRunning ? <Pause className="w-4 h-4 mr-3 text-gray-500" /> : <Play className="w-4 h-4 mr-3 text-green-500" />}
                                    {isRunning ? 'Pause Tracking' : 'Resume Tracking'}
                                    <span className="ml-auto text-xs text-gray-600">Ctrl+P</span>
                                </button>

                                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                                    <Timer className="w-4 h-4 mr-3 text-gray-500" />
                                    Start Focus
                                </button>

                                <div className="h-px bg-white/10 my-1" />

                                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                                    <Settings className="w-4 h-4 mr-3 text-gray-500" />
                                    Settings
                                </button>

                                <button
                                    onClick={() => window.close()}
                                    className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4 mr-3" />
                                    Close Widget
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
