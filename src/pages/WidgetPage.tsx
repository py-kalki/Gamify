import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Play, Pause, LayoutDashboard, Timer, Settings, LogOut } from 'lucide-react';
import { fetchTodayActivity, calculateStats, type GamificationStats } from '../lib/gamification';
import { useSharedTimer } from '../lib/timer';

interface WidgetPageProps {
    onSwitchToDashboard?: () => void;
}

export function WidgetPage({ onSwitchToDashboard }: WidgetPageProps) {
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [scale, setScale] = useState(1);
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

    useEffect(() => {
        // Resize widget based on menu state and scale
        if (window.electron && window.electron.resizeWidget) {
            const baseWidth = 600;
            const baseHeight = isMenuOpen ? 350 : 80;

            const scaledWidth = Math.round(baseWidth * scale);
            const scaledHeight = Math.round(baseHeight * scale);

            window.electron.resizeWidget(scaledWidth, scaledHeight);
        }
    }, [isMenuOpen, scale]);

    const hours = stats ? Math.floor(stats.productiveTime / 3600) : 0;
    const minutes = stats ? Math.floor((stats.productiveTime % 3600) / 60) : 0;
    const percent = Math.min(100, Math.round((stats?.productiveTime || 0) / (8 * 3600) * 100));

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleOpenDashboard = () => {
        if (onSwitchToDashboard) {
            onSwitchToDashboard();
        }
    };

    const handleQuit = () => {
        if (window.electron && window.electron.windowControl) {
            window.electron.windowControl('quit');
        }
    };

    return (
        <div className="w-full h-full bg-transparent overflow-hidden flex items-center justify-center">
            {/* Widget Bar */}
            <div
                className="relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ease-in-out origin-top-left"
                style={{
                    width: '600px',
                    height: isMenuOpen ? '350px' : '80px',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    WebkitAppRegion: 'drag'
                } as React.CSSProperties}
            >
                {/* Top Bar Content */}
                <div className="flex items-center px-6 h-[80px] shrink-0 w-full">
                    {/* Time Since Last Break */}
                    <div className="flex flex-col mr-8 select-none">
                        <div className="text-2xl font-bold text-white font-mono">{formatTime(seconds)}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Focus Time</div>
                    </div>

                    {/* Work Hours */}
                    <div className="flex flex-col mr-8 select-none">
                        <div className="text-2xl font-bold text-indigo-400 font-mono">
                            {hours} hr {minutes} min
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Work Hours</div>
                    </div>

                    {/* Percent of Day */}
                    <div className="flex flex-col flex-1 select-none">
                        <div className="text-2xl font-bold text-gray-200 font-mono">
                            {percent}%
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Percent of Day</div>
                    </div>

                    {/* Menu Button */}
                    <button
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen);
                            if (isMenuOpen) setShowSettings(false); // Reset settings on close
                        }}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5 no-drag text-white"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Expanded Menu Content */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full px-4 pb-4 flex-1 overflow-y-auto no-drag"
                            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                        >
                            {!showSettings ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={handleOpenDashboard}
                                        className="w-full flex items-center px-3 py-3 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <LayoutDashboard className="w-4 h-4 mr-3 text-gray-500" />
                                        Show Dashboard
                                    </button>

                                    <div className="h-px bg-white/10 my-1" />

                                    <button
                                        onClick={toggleTimer}
                                        className="w-full flex items-center px-3 py-3 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        {isRunning ? <Pause className="w-4 h-4 mr-3 text-gray-500" /> : <Play className="w-4 h-4 mr-3 text-green-500" />}
                                        {isRunning ? 'Pause Tracking' : 'Resume Tracking'}
                                        <span className="ml-auto text-xs text-gray-600">Ctrl+P</span>
                                    </button>

                                    <button
                                        onClick={toggleTimer}
                                        className="w-full flex items-center px-3 py-3 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <Timer className="w-4 h-4 mr-3 text-gray-500" />
                                        {isRunning ? 'Stop Focus' : 'Start Focus'}
                                    </button>

                                    <div className="h-px bg-white/10 my-1" />

                                    <button
                                        onClick={() => setShowSettings(true)}
                                        className="w-full flex items-center px-3 py-3 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                                        Settings
                                    </button>

                                    <button
                                        onClick={handleQuit}
                                        className="w-full flex items-center px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 mr-3" />
                                        Quit App
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 p-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-white font-medium">Widget Settings</h3>
                                        <button
                                            onClick={() => setShowSettings(false)}
                                            className="text-xs text-gray-400 hover:text-white"
                                        >
                                            Back
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase tracking-wider">Size Scale: {Math.round(scale * 100)}%</label>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="1.5"
                                            step="0.1"
                                            value={scale}
                                            onChange={(e) => setScale(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-500">
                                            <span>Small</span>
                                            <span>Normal</span>
                                            <span>Large</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
