import { useState, useRef, useEffect } from 'react';
import { Power, FastForward, Volume2, MessageSquare, ChevronDown, RotateCcw, Settings } from 'lucide-react';
import { useSharedTimer } from '../lib/timer';
import { TimerSettingsModal } from './TimerSettingsModal';

export function ControlBar() {
    const { isRunning, seconds, toggleTimer, resetTimer } = useSharedTimer();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between px-6 z-50">
            {/* Left Controls */}
            <div className="flex items-center gap-6">
                <button
                    onClick={toggleTimer}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isRunning ? 'text-green-500 hover:bg-green-500/10' : 'text-gray-500 hover:bg-white/10'}`}
                >
                    <Power className="w-5 h-5" />
                </button>

                <button className="text-green-500 hover:text-green-400 transition-colors">
                    <FastForward className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-400" />
                    <span className="text-2xl font-mono font-bold text-cyan-400">{formatTime(seconds)}</span>
                    <span className="text-[10px] text-gray-500 uppercase leading-tight w-16">Focus Time Elapsed</span>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <div className="flex items-center bg-surface rounded-lg border border-white/10 overflow-hidden ml-4">
                        <button
                            onClick={resetTimer}
                            className="px-4 py-1.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                        >
                            End Focus
                        </button>
                        <div className="w-px h-8 bg-white/10" />
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className={`px-2 py-1.5 text-gray-400 hover:bg-white/5 transition-colors ${showDropdown ? 'bg-white/5 text-white' : ''}`}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <button
                                onClick={() => {
                                    resetTimer();
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset Timer
                            </button>
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    setShowSettings(true);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors border-t border-white/5"
                            >
                                <Settings className="w-4 h-4" />
                                Timer Settings
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Controls - Removed as per user request */}
            <div className="flex items-center gap-4">
                {/* Empty for now, or we can remove the div entirely if no other right controls are needed. 
                    Keeping the div structure for potential future additions or layout balance if needed.
                    Actually, let's just remove the buttons inside. */}
            </div>
            <TimerSettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSave={() => {
                    // Optional: Refresh timer page if needed, handled via event
                }}
            />
        </div>
    );
}
