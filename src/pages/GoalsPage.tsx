// import React from 'react';

const templates = [
    { title: "Minimum Work Hours", desc: "Set a goal for the minimum numbers of hours you want to work each day." },
    { title: "Maximizing Focus Time", desc: "Increase the amount of time for deep work. It's a skill that allows you to quickly master complicated information." },
    { title: "The 6-Hour Work Day", desc: "The eight-hour workday is a relic of the past. It's argued that the six-hour workday makes more sense." },
    { title: "Limiting Distracting Categories", desc: "Nothing zaps productivity and time wasted like social media does. This goal helps you minimize time spent." },
    { title: "Taking More Breaks", desc: "Increase the amount of time you spend on break at work. This goal helps you keep track of your break time." },
    { title: "Maximizing a Time Category", desc: "Track any time category and set a daily goal minimum for it. Useful for maximizing productive behaviors." },
    { title: "Reducing Meeting Time", desc: "Meetings can be one of the biggest productivity killers. Use this goal to help minimize them." },
    { title: "Increasing Meeting Time", desc: "For a few professions, meeting time is equivalent to productivity. Maximizing your meeting time correlates to success." },
];

export function GoalsPage() {
    return (
        <div className="flex-1 bg-background p-6 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold">Goal Templates</h1>
            </header>

            <div className="grid grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.title} className="bg-surface rounded-xl p-6 border border-white/5 hover:border-primary/50 transition-colors cursor-pointer group">
                        <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors">{template.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{template.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
