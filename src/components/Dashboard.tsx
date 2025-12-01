import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, getHours, getMinutes, parseISO } from 'date-fns';
import { DailySummary } from './DailySummary';
import { fetchTodayActivity, type AWEvent } from '../lib/gamification';

export function Dashboard() {
    const [events, setEvents] = useState<AWEvent[]>([]);
    const hours = Array.from({ length: 13 }, (_, i) => i + 9); // 9 AM to 9 PM

    useEffect(() => {
        async function loadData() {
            const data = await fetchTodayActivity();
            setEvents(data);
        }
        loadData();
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, []);

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

        return {
            top: `${top}%`,
            height: `${height}%`,
            minHeight: '20px' // Ensure visibility for short events
        };
    };

    return (
        <div className="flex h-full w-full">
            <div className="flex-1 bg-background p-6 overflow-y-auto relative">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">{format(new Date(), 'EEEE, MMMM d, yyyy')}</h1>
                    </div>
                    <div className="flex bg-surface rounded-lg p-1">
                        {['Day', 'Week', 'Month', 'Year'].map(t => (
                            <button key={t} className={`px-3 py-1 text-sm rounded-md ${t === 'Day' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Timeline Grid */}
                <div className="relative border-t border-white/10">
                    {hours.map(hour => (
                        <div key={hour} className="flex h-24 border-b border-white/5 group relative">
                            <div className="w-16 py-2 text-xs text-gray-500 text-right pr-4">
                                {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                            </div>
                            <div className="flex-1 relative">
                                {/* Grid Lines */}
                                <div className="absolute inset-x-0 top-1/2 border-t border-white/5 border-dashed" />

                                {/* Events for this hour */}
                                {events.map((event, index) => {
                                    const style = getEventStyle(event, hour);
                                    if (!style) return null;

                                    return (
                                        <motion.div
                                            key={`${event.timestamp}-${index}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="absolute left-4 right-4 bg-indigo-600/80 rounded-lg p-2 border-l-4 border-indigo-400 overflow-hidden z-10"
                                            style={style}
                                        >
                                            <div className="font-medium text-xs truncate">{event.data.app}</div>
                                            <div className="text-[10px] text-indigo-200 truncate">{event.data.title}</div>
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
                    ))}

                    {/* Current Time Line */}
                    <div
                        className="absolute left-16 right-0 border-t-2 border-green-500 z-20 flex items-center pointer-events-none"
                        style={{
                            top: `${(getHours(new Date()) - 9) * 96 + (getMinutes(new Date()) / 60) * 96}px`,
                            display: getHours(new Date()) >= 9 && getHours(new Date()) <= 21 ? 'flex' : 'none'
                        }}
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500 -ml-1" />
                    </div>
                </div>
            </div>
            <DailySummary />
        </div>
    );
}
