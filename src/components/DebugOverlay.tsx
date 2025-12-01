import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, Database, Cpu } from 'lucide-react';

export function DebugOverlay() {
    const [isVisible, setIsVisible] = useState(false);
    const [stats, setStats] = useState<any>({});

    useEffect(() => {
        const checkDebug = () => {
            const isDebug = localStorage.getItem('gamify_debug_mode') === 'true';
            setIsVisible(isDebug);
        };

        checkDebug();
        window.addEventListener('storage', checkDebug);

        // Poll for debug stats if visible
        let interval: NodeJS.Timeout;
        if (isVisible) {
            interval = setInterval(() => {
                // Mock stats for now, in real app we'd pull from a store or context
                setStats({
                    memory: (performance as any).memory?.usedJSHeapSize || 0,
                    domNodes: document.getElementsByTagName('*').length,
                    timestamp: new Date().toISOString(),
                    windowSize: `${window.innerWidth}x${window.innerHeight}`,
                    userAgent: navigator.userAgent.slice(0, 30) + '...'
                });
            }, 1000);
        }

        return () => {
            window.removeEventListener('storage', checkDebug);
            clearInterval(interval);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-24 right-4 z-[100] w-80 bg-black/80 backdrop-blur-md border border-orange-500/30 rounded-lg shadow-2xl overflow-hidden font-mono text-xs"
        >
            <div className="bg-orange-500/10 px-3 py-2 border-b border-orange-500/20 flex items-center justify-between">
                <div className="flex items-center text-orange-400 font-bold">
                    <Cpu className="w-3 h-3 mr-2" />
                    DEBUG MODE
                </div>
                <button
                    onClick={() => {
                        localStorage.setItem('gamify_debug_mode', 'false');
                        setIsVisible(false);
                        window.location.reload();
                    }}
                    className="text-orange-400/50 hover:text-orange-400"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
            <div className="p-3 space-y-2 text-gray-300">
                <div className="flex justify-between">
                    <span className="text-gray-500">Timestamp:</span>
                    <span className="text-white">{stats.timestamp?.split('T')[1]}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Window:</span>
                    <span className="text-white">{stats.windowSize}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">DOM Nodes:</span>
                    <span className="text-green-400">{stats.domNodes}</span>
                </div>
                {stats.memory > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Heap:</span>
                        <span className="text-blue-400">{Math.round(stats.memory / 1024 / 1024)} MB</span>
                    </div>
                )}

                <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="text-orange-400 mb-1 flex items-center">
                        <Database className="w-3 h-3 mr-1" />
                        Local Storage Keys
                    </div>
                    <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                        {Object.keys(localStorage).map(key => (
                            <div key={key} className="flex justify-between truncate">
                                <span className="text-gray-500 truncate mr-2" title={key}>{key}</span>
                                <span className="text-gray-400 truncate max-w-[100px]" title={localStorage.getItem(key) || ''}>
                                    {localStorage.getItem(key)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
