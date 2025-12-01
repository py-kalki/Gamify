import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { fetchTodayActivity, calculateStats, getTimelineData, fetchActivityRange, type GamificationStats } from '../lib/gamification';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';

type ViewMode = 'Day' | 'Week' | 'Month' | 'Year';

export function ActivityPage() {
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [view, setView] = useState<ViewMode>('Day');
    const [chartData, setChartData] = useState<{ label: string; value: number; date: Date }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            let events = [];

            if (view === 'Day') {
                events = await fetchTodayActivity();
                const timelineData = getTimelineData(events);
                setTimeline(timelineData);
            } else {
                let start: Date, end: Date;
                const now = new Date();

                if (view === 'Week') {
                    start = startOfWeek(now, { weekStartsOn: 1 });
                    end = endOfWeek(now, { weekStartsOn: 1 });
                } else if (view === 'Month') {
                    start = startOfMonth(now);
                    end = endOfMonth(now);
                } else {
                    start = startOfYear(now);
                    end = endOfYear(now);
                }

                events = await fetchActivityRange(start, end);

                // Process chart data
                const dailyMap: Record<string, number> = {};
                events.forEach(e => {
                    const dateStr = e.timestamp.split('T')[0];
                    if (view === 'Year') {
                        const monthStr = dateStr.substring(0, 7);
                        dailyMap[monthStr] = (dailyMap[monthStr] || 0) + e.duration;
                    } else {
                        dailyMap[dateStr] = (dailyMap[dateStr] || 0) + e.duration;
                    }
                });

                let chartItems: { label: string; value: number; date: Date }[] = [];
                if (view === 'Week' || view === 'Month') {
                    const days = eachDayOfInterval({ start, end });
                    chartItems = days.map(d => {
                        const dateStr = format(d, 'yyyy-MM-dd');
                        return {
                            label: format(d, view === 'Week' ? 'EEE' : 'd'),
                            value: Math.round((dailyMap[dateStr] || 0) / 60),
                            date: d
                        };
                    });
                } else if (view === 'Year') {
                    const months = eachMonthOfInterval({ start, end });
                    chartItems = months.map(d => {
                        const monthStr = format(d, 'yyyy-MM');
                        return {
                            label: format(d, 'MMM'),
                            value: Math.round((dailyMap[monthStr] || 0) / 60),
                            date: d
                        };
                    });
                }
                setChartData(chartItems);
            }

            const calculatedStats = calculateStats(events);
            setStats(calculatedStats);
            setLoading(false);
        }
        loadData();
    }, [view]);

    if (loading) return <div className="p-8 text-gray-500">Loading activity...</div>;

    const apps = stats?.allApps || [];
    const pieData = apps.slice(0, 5); // Top 5 for pie chart

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    };

    return (
        <div className="flex-1 bg-background p-6 overflow-y-auto mb-20">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Activity</h1>
                <div className="flex bg-surface rounded-lg p-1">
                    {['Day', 'Week', 'Month', 'Year'].map(t => (
                        <button
                            key={t}
                            onClick={() => setView(t as ViewMode)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${view === t ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            {/* Timeline or Chart */}
            <div className="bg-surface rounded-xl p-6 mb-6 border border-white/5">
                <h3 className="text-sm text-gray-400 mb-4">{view === 'Day' ? 'Timeline (Today)' : `Activity Overview (${view})`}</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        {view === 'Day' ? (
                            <BarChart data={timeline} barSize={30}>
                                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Bar dataKey="focus" name="Minutes" fill="#bf00ff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        ) : (
                            <BarChart data={chartData}>
                                <XAxis dataKey="label" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 480]}
                                    ticks={[0, 120, 240, 360, 480]}
                                    tickFormatter={(val) => `${Math.floor(val / 60)}hr`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    formatter={(val: number) => [`${Math.floor(val / 60)}h ${val % 60}m`, 'Focus Time']}
                                />
                                <Bar dataKey="value" fill="#bf00ff" radius={[4, 4, 0, 0]} maxBarSize={60} />
                            </BarChart>
                        )}
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
                                <Tooltip formatter={(value: number) => formatDuration(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <div className="text-2xl font-bold">{formatDuration(stats?.productiveTime || 0)}</div>
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
