import { Power, FastForward, Volume2, MessageSquare, ChevronDown } from 'lucide-react';
import { useSharedTimer } from '../lib/timer';

export function ControlBar() {
    const { isRunning, seconds, toggleTimer, resetTimer } = useSharedTimer();

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
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

                <div className="flex items-center bg-surface rounded-lg border border-white/10 overflow-hidden ml-4">
                    <button
                        onClick={resetTimer}
                        className="px-4 py-1.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                    >
                        End Focus
                    </button>
                    <div className="w-px h-8 bg-white/10" />
                    <button className="px-2 py-1.5 text-gray-400 hover:bg-white/5 transition-colors">
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-gray-800 rounded-md" /> {/* Album Art Placeholder */}
                    <div className="text-sm text-gray-300">Silence</div>
                    <Volume2 className="w-4 h-4 text-gray-400" />
                </div>

                <button className="w-10 h-10 rounded-lg bg-surface border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <MessageSquare className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
