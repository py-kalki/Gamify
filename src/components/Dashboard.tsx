import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, getHours, getMinutes, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { DailySummary } from './DailySummary';
import { fetchTodayActivity, fetchActivityRange, type AWEvent, cleanAppName, getAppCategory, type Category, CATEGORY_COLORS } from '../lib/gamification';
import { ZoomIn, ZoomOut, X, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type ViewMode = 'Day' | 'Week' | 'Month' | 'Year';

export function Dashboard() {
    const [events, setEvents] = useState<AWEvent[]>([]);
    const [view, setView] = useState<ViewMode>('Day');
    const [chartData, setChartData] = useState<{ label: string; value: number; date: Date }[]>([]);
    const [pixelsPerHour, setPixelsPerHour] = useState(96); // Default 96px per hour
    const [selectedEvent, setSelectedEvent] = useState<AWEvent | null>(null);
    const [categoryOverrides, setCategoryOverrides] = useState<Record<string, Category>>({});
    const hours = Array.from({ length: 24 }, (_, i) => i); // 0 AM to 11 PM

    useEffect(() => {
        async function loadData() {
            if (view === 'Day') {
                const data = await fetchTodayActivity();
                setEvents(data);
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

                const data = await fetchActivityRange(start, end);

                // Process data for chart
                const dailyMap: Record<string, number> = {};
                data.forEach(e => {
                    const dateStr = e.timestamp.split('T')[0];
                    // For Year view, maybe aggregate by month? For now let's do daily for Week/Month
                    // For Year, daily might be too much, let's do monthly
                    if (view === 'Year') {
                        const monthStr = dateStr.substring(0, 7); // YYYY-MM
                        dailyMap[monthStr] = (dailyMap[monthStr] || 0) + e.duration;
                    } else {
                        dailyMap[dateStr] = (dailyMap[dateStr] || 0) + e.duration;
                    }
                });

                let chartItems: { label: string; value: number; date: Date }[] = [];

                if (view === 'Week' || view === 'Month') {
                    const days = eachDayOfInterval({ start, end }); // Use full range (start to end of week/month)
                    chartItems = days.map(d => {
                        const dateStr = format(d, 'yyyy-MM-dd');
                        return {
                            label: format(d, view === 'Week' ? 'EEE' : 'd'),
                            value: Math.round((dailyMap[dateStr] || 0) / 60), // minutes
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
        }
        loadData();
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, [view]);

    const getEventStyle = (event: AWEvent, hour: number) => {
        const date = parseISO(event.timestamp);
        const eventHour = getHours(date);

        if (eventHour !== hour) return null;

        const startMinute = getMinutes(date);
        const durationMinutes = event.duration / 60;

        // Calculate top position (percentage of hour)
        const top = (startMinute / 60) * 100;
        // Calculate height (percentage of hour)
        const height = (durationMinutes / 60) * 100;

        const appName = cleanAppName(event.data.app);
        const category = categoryOverrides[appName] || getAppCategory(appName, event.data.title);
        const color = CATEGORY_COLORS[category];

        return {
            top: `${top}%`,
            height: `${height}%`,
            minHeight: '2px', // Reduced from 20px to prevent overlap
            backgroundColor: `${color}80`, // 50% opacity
            borderColor: color
        };
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            // e.preventDefault(); // React synthetic events might not support this for wheel in the same way, but let's try
            const delta = e.deltaY > 0 ? -24 : 24;
            setPixelsPerHour(p => Math.min(300, Math.max(48, p + delta)));
        }
    };

    return (
        <div className="flex h-full w-full">
            <div
                className="flex-1 bg-background p-6 overflow-y-auto relative"
                onWheel={handleWheel}
            >
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">{format(new Date(), 'EEEE, MMMM d, yyyy')}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-surface rounded-lg p-1 mr-4">
                            <button
                                onClick={() => setPixelsPerHour(p => Math.max(48, p - 24))}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <div className="w-px bg-white/10 my-1 mx-1" />
                            <button
                                onClick={() => setPixelsPerHour(p => Math.min(300, p + 24))}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>
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
                    </div>
                </header>

                {/* Content Area */}
                <div className="relative border-t border-white/10 min-h-[500px]">
                    {view === 'Day' ? (
                        // Timeline View
                        hours.map(hour => (
                            <div key={hour} className="flex border-b border-white/5 group relative" style={{ height: `${pixelsPerHour}px` }}>
                                <div className="w-16 py-2 text-xs text-gray-500 text-right pr-4">
                                    {hour > 12 ? hour - 12 : hour === 0 || hour === 24 ? 12 : hour} {hour >= 12 && hour < 24 ? 'PM' : 'AM'}
                                </div>
                                <div className="flex-1 relative">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-x-0 top-1/2 border-t border-white/5 border-dashed" />

                                    {events.map((event, index) => {
                                        const style = getEventStyle(event, hour);
                                        if (!style) return null;

                                        const startTime = parseISO(event.timestamp);
                                        const endTime = new Date(startTime.getTime() + event.duration * 1000);
                                        const timeRange = `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;

                                        return (
                                            <motion.div
                                                key={`${event.timestamp}-${index}`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="absolute left-16 right-4 rounded-md border-l-4 overflow-hidden hover:z-50 hover:brightness-110 transition-all cursor-pointer shadow-sm group"
                                                style={style}
                                                title={`${cleanAppName(event.data.app)} - ${event.data.title}\n${timeRange}`}
                                                onClick={() => setSelectedEvent(event)}
                                            >
                                                {/* Only show details if height is sufficient (e.g. > 20px) or if zoomed in */}
                                                {(parseFloat(style.height as string) > 5 || pixelsPerHour > 60) && (
                                                    <div className="px-3 py-1.5 h-full flex flex-col justify-center">
                                                        <div className="font-semibold text-xs text-white truncate leading-tight mb-0.5">
                                                            {event.data.title || cleanAppName(event.data.app)}
                                                        </div>
                                                        {parseFloat(style.height as string) > 10 && (
                                                            <div className="flex items-center justify-between text-[10px] text-white/70 leading-none">
                                                                <span className="truncate mr-2 opacity-80">{cleanAppName(event.data.app)}</span>
                                                                <span className="whitespace-nowrap font-mono opacity-60">{timeRange}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Right side activity indicator (cyan bar) */}
                                <div className="w-12 border-l border-white/5 relative">
                                    {/* Simplified activity indicator based on if there are events */}
                                    {events.some(e => getHours(parseISO(e.timestamp)) === hour) && (
                                        <div className="absolute inset-x-2 top-2 bottom-2 bg-cyan-500/20 rounded-sm">
                                            <div className="absolute inset-x-0 bottom-0 h-full bg-cyan-400 rounded-sm opacity-50" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        // Chart View
                        <div className="p-8 h-[500px]">
                            <h2 className="text-xl font-bold mb-6">Activity Overview ({view})</h2>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis
                                        dataKey="label"
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
                                        domain={[0, 480]}
                                        ticks={[0, 120, 240, 360, 480]}
                                        tickFormatter={(val) => `${Math.floor(val / 60)}hr`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        formatter={(val: number) => [`${Math.floor(val / 60)}h ${val % 60}m`, 'Focus Time']}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.value > 120 ? '#00f0ff' : '#374151'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Current Time Line (Only for Day view) */}
                    {view === 'Day' && (
                        <div
                            className="absolute left-16 right-0 border-t-2 border-green-500 z-20 flex items-center pointer-events-none"
                            style={{
                                top: `${getHours(new Date()) * pixelsPerHour + (getMinutes(new Date()) / 60) * pixelsPerHour}px`,
                                display: 'flex'
                            }}
                        >
                            <div className="w-2 h-2 rounded-full bg-green-500 -ml-1" />
                        </div>
                    )}
                </div>
            </div>
            <DailySummary />

            {/* Event Details Modal */}
            {
                selectedEvent && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setSelectedEvent(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 w-96 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white">{cleanAppName(selectedEvent.data.app)}</h3>
                                <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4 text-sm text-gray-300">
                                {/* Category Selector */}
                                <div className="bg-white/5 p-3 rounded-lg">
                                    <div className="text-gray-500 text-xs uppercase mb-2 font-semibold tracking-wider">Category</div>
                                    <div className="relative">
                                        <select
                                            value={categoryOverrides[cleanAppName(selectedEvent.data.app)] || getAppCategory(cleanAppName(selectedEvent.data.app), selectedEvent.data.title)}
                                            onChange={(e) => setCategoryOverrides(prev => ({
                                                ...prev,
                                                [cleanAppName(selectedEvent.data.app)]: e.target.value as Category
                                            }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-md py-2 px-3 text-white appearance-none focus:outline-none focus:border-primary cursor-pointer"
                                        >
                                            {Object.keys(CATEGORY_COLORS).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="bg-white/5 p-3 rounded-lg">
                                    <div className="text-gray-500 text-xs uppercase mb-1 font-semibold tracking-wider">Window Title</div>
                                    <div className="font-medium break-words leading-relaxed">{selectedEvent.data.title}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <div className="text-gray-500 text-xs uppercase mb-1 font-semibold tracking-wider">Duration</div>
                                        <div className="font-mono text-lg text-white">
                                            {Math.floor(selectedEvent.duration / 60)}m {Math.floor(selectedEvent.duration % 60)}s
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <div className="text-gray-500 text-xs uppercase mb-1 font-semibold tracking-wider">Time</div>
                                        <div className="font-mono text-lg text-white">
                                            {format(parseISO(selectedEvent.timestamp), 'h:mm a')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
}
