import { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchActivityRange, calculateTrends, type DailyTrend, cleanAppName } from '../lib/gamification';
import { subDays, format } from 'date-fns';

export function TrendsPage() {
    const [trends, setTrends] = useState<DailyTrend[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        avgScore: 0,
        totalFocus: 0,
        topInterruptors: [] as { name: string, time: string }[]
    });

    useEffect(() => {
        async function loadData() {
            const end = new Date();
            const start = subDays(end, 6); // Last 7 days

            const events = await fetchActivityRange(start, end);
            const trendData = calculateTrends(events);

            // Calculate stats
            const totalMinutes = trendData.reduce((acc, curr) => acc + curr.score, 0);
            const avg = Math.round(totalMinutes / 7);

            // Top Apps (Interruptors for now just top apps)
            const appMap: Record<string, number> = {};
            events.forEach(e => {
                const app = cleanAppName(e.data.app);
                appMap[app] = (appMap[app] || 0) + e.duration;
            });

            const sortedApps = Object.entries(appMap)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([name, duration]) => ({
                    name,
                    time: `${Math.round(duration / 60)} min`
                }));

            setTrends(trendData);
            setStats({
                avgScore: avg,
                totalFocus: totalMinutes,
                topInterruptors: sortedApps
            });
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) return <div className="p-8 text-gray-500">Loading trends...</div>;
    return (
        <div className="flex-1 bg-background p-6 overflow-y-auto">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Productivity Trends</h1>
                <div className="flex bg-surface rounded-lg p-1">
                    {['Week', 'Month', 'Year'].map(t => (
                        <button key={t} className={`px-3 py-1 text-sm rounded-md ${t === 'Week' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-2 gap-6">
                {/* Focus Score Average */}
                <div className="bg-surface rounded-xl p-6 border border-white/5 h-64 flex flex-col items-center justify-center relative">
                    <h3 className="absolute top-6 left-6 text-sm text-gray-400">Focus Score Average</h3>
                    <div className="w-32 h-32 rounded-full border-8 border-white/5 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{stats.avgScore}</span>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">Daily Average (min)</div>
                </div>

                {/* Focus Score Per Day */}
                <div className="bg-surface rounded-xl p-6 border border-white/5 h-64">
                    <h3 className="text-sm text-gray-400 mb-4">Focus Score Per Day</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <LineChart data={trends}>
                            <XAxis dataKey="day" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} />
                            <Line type="monotone" dataKey="score" stroke="#00f0ff" strokeWidth={2} dot={{ r: 4, fill: '#00f0ff' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Total Focus Time */}
                <div className="bg-surface rounded-xl p-6 border border-white/5 h-64 flex flex-col items-center justify-center relative">
                    <h3 className="absolute top-6 left-6 text-sm text-gray-400">Total Focus Time</h3>
                    <div className="w-32 h-32 rounded-full border-8 border-white/5 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-white">{stats.totalFocus} min</span>
                    </div>
                    <div className="mt-4 text-xs text-gray-500 text-center px-8">Total productive time this week.</div>
                </div>

                {/* Top Interruptors */}
                <div className="bg-surface rounded-xl p-6 border border-white/5 h-64">
                    <h3 className="text-sm text-gray-400 mb-4">Top Interruptors</h3>
                    <div className="space-y-3">
                        {stats.topInterruptors.map(item => (
                            <div key={item.name} className="flex justify-between text-sm">
                                <div className="text-gray-300">{item.name}</div>
                                <div className="text-gray-400">{item.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
