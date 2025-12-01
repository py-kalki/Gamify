// import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const focusData = [
    { day: 'Mon', score: 0 },
    { day: 'Tue', score: 0 },
    { day: 'Wed', score: 0 },
    { day: 'Thu', score: 0 },
    { day: 'Fri', score: 0 },
    { day: 'Sat', score: 0 },
    { day: 'Sun', score: 0 },
];

export function TrendsPage() {
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
                        <span className="text-2xl font-bold text-gray-500">-</span>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">No score</div>
                </div>

                {/* Focus Score Per Day */}
                <div className="bg-surface rounded-xl p-6 border border-white/5 h-64">
                    <h3 className="text-sm text-gray-400 mb-4">Focus Score Per Day</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <LineChart data={focusData}>
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
                        <span className="text-2xl font-bold text-white">0 min</span>
                    </div>
                    <div className="mt-4 text-xs text-gray-500 text-center px-8">0% of your total work hours (0 min).</div>
                </div>

                {/* Top Interruptors */}
                <div className="bg-surface rounded-xl p-6 border border-white/5 h-64">
                    <h3 className="text-sm text-gray-400 mb-4">Top Interruptors</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'youtube.com', time: '7 min' },
                            { name: 'Spotify', time: '2 min' },
                            { name: 'keep.google.com', time: '1 min' },
                        ].map(item => (
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
