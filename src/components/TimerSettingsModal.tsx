import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Coffee, Armchair } from 'lucide-react';

interface TimerSettings {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15
};

interface TimerSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function TimerSettingsModal({ isOpen, onClose, onSave }: TimerSettingsModalProps) {
    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        const stored = localStorage.getItem('gamify_timer_settings');
        if (stored) {
            setSettings(JSON.parse(stored));
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('gamify_timer_settings', JSON.stringify(settings));
        window.dispatchEvent(new Event('timer-settings-updated'));
        onSave();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">Timer Settings</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Focus Duration */}
                            <div className="space-y-3">
                                <label className="flex items-center text-sm font-medium text-gray-300">
                                    <Clock className="w-4 h-4 mr-2 text-primary" />
                                    Focus Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={settings.focusDuration}
                                    onChange={(e) => setSettings({ ...settings, focusDuration: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Short Break */}
                            <div className="space-y-3">
                                <label className="flex items-center text-sm font-medium text-gray-300">
                                    <Coffee className="w-4 h-4 mr-2 text-green-400" />
                                    Short Break (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={settings.shortBreakDuration}
                                    onChange={(e) => setSettings({ ...settings, shortBreakDuration: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-400 transition-colors"
                                />
                            </div>

                            {/* Long Break */}
                            <div className="space-y-3">
                                <label className="flex items-center text-sm font-medium text-gray-300">
                                    <Armchair className="w-4 h-4 mr-2 text-blue-400" />
                                    Long Break (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={settings.longBreakDuration}
                                    onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 text-sm font-medium bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
