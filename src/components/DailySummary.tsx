import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { fetchTodayActivity, calculateStats, type GamificationStats } from '../lib/gamification';

export function DailySummary() {
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const events = await fetchTodayActivity();
            const calculatedStats = calculateStats(events);
            setStats(calculatedStats);
            setLoading(false);
        }
        loadData();
        // Refresh every minute
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="w-80 bg-surface border-l border-white/10 p-6 flex items-center justify-center text-gray-500">Loading stats...</div>;
    }

    const hours = stats ? Math.floor(stats.productiveTime / 3600) : 0;
    const minutes = stats ? Math.floor((stats.productiveTime % 3600) / 60) : 0;
    const percent = Math.min(100, Math.round((stats?.productiveTime || 0) / (8 * 3600) * 100)); // Target 8 hours

    return (
        <div className="w-80 bg-surface border-l border-white/10 p-6 flex flex-col h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Daily Summary</h2>
                <SettingsIcon className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
            </div>

            {/* Work Hours */}
            <div className="mb-8">
                <div className="text-sm text-gray-400 mb-1">Work Hours</div>
                <div className="flex items-end justify-between">
                    <div className="text-4xl font-bold text-white">{hours} hr {minutes} min</div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Percent of Target</div>
                        <div className="text-lg font-medium text-primary">{percent}% <span className="text-xs text-gray-500">of 8 hr</span></div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Productivity Metrics */}
            <div className="mb-8">
                <div className="text-sm text-gray-400 mb-3">Productivity Metrics</div>
                <div className="flex h-4 rounded-full overflow-hidden mb-4">
                    <div className="w-[100%] bg-primary" />
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-primary mr-2" /> Focus</div>
                    <div className="text-right text-gray-400">{hours} hr {minutes} min</div>
                </div>
            </div>

            {/* Top Categories */}
            <div className="mb-8">
                <div className="text-sm text-gray-400 mb-3">Top Categories</div>
                <div className="space-y-3">
                    {stats?.topCategories.map(cat => (
                        <CategoryItem
                            key={cat.name}
                            label={cat.name}
                            percent={cat.percent}
                            time={`${Math.floor(cat.time / 3600)}h ${Math.floor((cat.time % 3600) / 60)}m`}
                            color={cat.color}
                        />
                    ))}
                    {stats?.topCategories.length === 0 && <div className="text-sm text-gray-500">No activity recorded yet.</div>}
                </div>
            </div>

            {/* Gamification / Quests */}
            <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center">
                        <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                        Level {stats?.level || 0}
                    </h3>
                    <div className="text-xs font-bold text-yellow-400">{stats?.xp || 0} XP</div>
                </div>

                <div className="space-y-3">
                    <QuestItem title="Deep Work" desc="Focus for 2 hrs" progress={Math.min(100, (stats?.productiveTime || 0) / (2 * 3600) * 100)} xp={100} />
                    <QuestItem title="Code Warrior" desc="Edit 5 files" progress={40} xp={50} />
                </div>
            </div>
        </div>
    );
}

function CategoryItem({ label, percent, time, color }: { label: string, percent: number, time: string, color: string }) {
    return (
        <div className="flex items-center text-sm">
            <div className="w-8 text-gray-400">{percent}%</div>
            <div className={`w-2 h-2 rounded-full ${color} mr-3`} />
            <div className="flex-1 text-gray-300">{label}</div>
            <div className="text-gray-400">{time}</div>
        </div>
    );
}

function QuestItem({ title, desc, progress, xp }: { title: string, desc: string, progress: number, xp: number }) {
    return (
        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex justify-between mb-2">
                <div>
                    <div className="font-medium text-sm">{title}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                </div>
                <div className="text-xs font-bold text-yellow-400">+{xp} XP</div>
            </div>
            <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400" style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}

function SettingsIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    )
}
