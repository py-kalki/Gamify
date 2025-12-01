import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { fetchTodayActivity, calculateStats, getTimelineData, type GamificationStats } from '../lib/gamification';

export function ActivityPage() {
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const events = await fetchTodayActivity();
            const calculatedStats = calculateStats(events);
            const timelineData = getTimelineData(events);

            setStats(calculatedStats);
            setTimeline(timelineData);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) return <div className="p-8 text-gray-500">Loading activity...</div>;

    const apps = stats?.allApps || [];
    const pieData = apps.slice(0, 5); // Top 5 for pie chart

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h} hr ${m} min`;
        return `${m} min`;
    };

    return (
        <div className="flex-1 bg-background p-6 overflow-y-auto mb-20">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Activity</h1>
                <div className="flex bg-surface rounded-lg p-1">
                    {['Day', 'Week', 'Month', 'Year'].map(t => (
                        <button key={t} className={`px-3 py-1 text-sm rounded-md ${t === 'Day' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            {/* Timeline */}
            <div className="bg-surface rounded-xl p-6 mb-6 border border-white/5">
                <h3 className="text-sm text-gray-400 mb-4">Timeline (Today)</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeline} barSize={30}>
                            <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            />
                            <Bar dataKey="focus" name="Minutes" fill="#bf00ff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="bg-surface rounded-xl p-6 border border-white/5">
                    <h3 className="text-sm text-gray-400 mb-4">Top Apps</h3>
                    <div className="h-48 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="time"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <div className="text-2xl font-bold">{Math.floor((stats?.productiveTime || 0) / 3600)}h</div>
                            <div className="text-xs text-gray-500">Total</div>
                        </div>
                    </div>
                </div>

                {/* Categories (Apps List) */}
                <div className="bg-surface rounded-xl p-6 border border-white/5 md:col-span-2">
                    <h3 className="text-sm text-gray-400 mb-4">Apps & Websites</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {apps.map(app => (
                            <div key={app.name} className="flex items-center text-sm group hover:bg-white/5 p-2 rounded-lg transition-colors">
                                <div className="w-12 text-gray-400 font-mono">{app.percent}%</div>
                                <div className="w-1 h-4 bg-white/10 rounded-full mr-3 relative overflow-hidden">
                                    <div className="absolute inset-y-0 left-0" style={{ width: `100%`, backgroundColor: app.color }} />
                                </div>
                                <div className="flex-1 text-gray-300 truncate font-medium">{app.name}</div>
                                <div className="text-gray-400 font-mono">{formatDuration(app.time)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
