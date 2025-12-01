import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Clock, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchHeatmapData, fetchHourlyStats, fetchActivityRange, calculateStreak, type HeatmapData, type HourlyData } from '../lib/gamification';
import { subDays } from 'date-fns';

export function InsightsPage() {
    const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
    const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
    const [stats, setStats] = useState({
        dailyAverage: '0h 0m',
        mostProductiveHour: 'N/A',
        currentStreak: 0,
        longestStreak: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const [heatmap, hourly] = await Promise.all([
                fetchHeatmapData(),
                fetchHourlyStats()
            ]);
            setHeatmapData(heatmap);
            setHourlyData(hourly);

            // Calculate Daily Average (Real)
            const end = new Date();
            const start = subDays(end, 7);
            const rangeEvents = await fetchActivityRange(start, end);
            const totalDuration = rangeEvents.reduce((acc, curr) => acc + curr.duration, 0);
            const avgSeconds = totalDuration / 7;
            const avgHours = Math.floor(avgSeconds / 3600);
            const avgMinutes = Math.floor((avgSeconds % 3600) / 60);

            // Finding most productive hour
            const bestHour = hourly.reduce((max, curr) => curr.score > max.score ? curr : max, hourly[0]);

            // Calculate Streak
            // We need more history for streak, let's use the 90 days range we fetched for heatmap?
            // Actually fetchHeatmapData fetches range but returns heatmap data. 
            // Let's fetch a longer range for streak or reuse heatmap logic if we can access the raw events there?
            // fetchHeatmapData implementation in gamification.ts fetches events internally. 
            // Let's just fetch 30 days for streak here to be safe and quick.
            const streakStart = subDays(new Date(), 30);
            const streakEvents = await fetchActivityRange(streakStart, new Date());
            const streak = calculateStreak(streakEvents);

            setStats({
                dailyAverage: `${avgHours}h ${avgMinutes}m`,
                mostProductiveHour: bestHour ? bestHour.hour : 'N/A',
                currentStreak: streak.current,
                longestStreak: streak.longest
            });

            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return <div className="flex-1 bg-background p-8 flex items-center justify-center text-gray-500">Loading insights...</div>;
    }

    const getHeatmapColor = (value: number) => {
        if (value === 0) return 'bg-white/5';
        if (value === 1) return 'bg-primary/20';
        if (value === 2) return 'bg-primary/40';
        if (value === 3) return 'bg-primary/60';
        return 'bg-primary';
    };

    return (
        <div className="flex-1 bg-background p-8 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Insights</h1>
                <p className="text-gray-400">Deep dive into your productivity patterns.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-white/10 p-6 rounded-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-green-400 text-sm font-medium">+12% vs last week</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.dailyAverage}</div>
                    <div className="text-sm text-gray-400">Daily Average</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface border border-white/10 p-6 rounded-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-500" />
                        </div>
                        <span className="text-green-400 text-sm font-medium">Top 5%</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.mostProductiveHour}</div>
                    <div className="text-sm text-gray-400">Most Productive Time</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface border border-white/10 p-6 rounded-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <Award className="w-6 h-6 text-yellow-500" />
                        </div>
                        <span className="text-yellow-500 text-sm font-medium">Current Streak</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.currentStreak} Days</div>
                    <div className="text-sm text-gray-400">Longest: {stats.longestStreak} Days</div>
                </motion.div>
            </div>

            {/* Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-surface border border-white/10 p-6 rounded-xl mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                        Activity Heatmap
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Less</span>
                        <div className="w-3 h-3 bg-white/5 rounded-sm" />
                        <div className="w-3 h-3 bg-primary/20 rounded-sm" />
                        <div className="w-3 h-3 bg-primary/40 rounded-sm" />
                        <div className="w-3 h-3 bg-primary/60 rounded-sm" />
                        <div className="w-3 h-3 bg-primary rounded-sm" />
                        <span>More</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1">
                    {heatmapData.map((day, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.value)}`}
                            title={day.date.toDateString()}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Hourly Productivity Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-surface border border-white/10 p-6 rounded-xl"
            >
                <h2 className="text-xl font-bold mb-6">Productivity by Hour</h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyData}>
                            <XAxis
                                dataKey="hour"
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                {hourlyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#00f0ff' : '#374151'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}
