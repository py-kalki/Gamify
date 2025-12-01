import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Target, CheckCircle2 } from 'lucide-react';

interface GoalTemplate {
    title: string;
    desc: string;
    type: 'min_time' | 'max_time';
    defaultTarget: number; // in minutes
}

const templates: GoalTemplate[] = [
    { title: "Minimum Work Hours", desc: "Set a goal for the minimum numbers of hours you want to work each day.", type: 'min_time', defaultTarget: 360 },
    { title: "Maximizing Focus Time", desc: "Increase the amount of time for deep work.", type: 'min_time', defaultTarget: 120 },
    { title: "Limiting Social Media", desc: "Minimize time spent on distracting sites.", type: 'max_time', defaultTarget: 30 },
];

interface ActiveGoal {
    id: string;
    templateTitle: string;
    targetMinutes: number;
    currentMinutes: number; // Mocked for now, would come from stats
    type: 'min_time' | 'max_time';
}

export function GoalsPage() {
    const [goals, setGoals] = useState<ActiveGoal[]>(() => {
        const saved = localStorage.getItem('gamify_goals');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
    const [targetInput, setTargetInput] = useState(60);

    useEffect(() => {
        localStorage.setItem('gamify_goals', JSON.stringify(goals));
    }, [goals]);

    const handleCreateGoal = () => {
        if (!selectedTemplate) return;
        const newGoal: ActiveGoal = {
            id: Date.now().toString(),
            templateTitle: selectedTemplate.title,
            targetMinutes: targetInput,
            currentMinutes: Math.floor(Math.random() * targetInput), // Mock progress
            type: selectedTemplate.type
        };
        setGoals([...goals, newGoal]);
        setSelectedTemplate(null);
    };

    const deleteGoal = (id: string) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    return (
        <div className="flex-1 bg-background p-6 overflow-y-auto relative">
            <header className="mb-8">
                <h1 className="text-2xl font-bold">Goals</h1>
                <p className="text-gray-400 text-sm mt-1">Set daily targets to gamify your productivity.</p>
            </header>

            {/* Active Goals */}
            {goals.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Active Goals
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {goals.map(goal => {
                            const progress = Math.min(100, Math.round((goal.currentMinutes / goal.targetMinutes) * 100));
                            const isMet = goal.type === 'min_time' ? progress >= 100 : progress <= 100;

                            return (
                                <div key={goal.id} className="bg-surface rounded-xl p-5 border border-white/5 relative group">
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="absolute top-3 right-3 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium">{goal.templateTitle}</h3>
                                    </div>
                                    <div className="flex items-end justify-between mb-2">
                                        <div className="text-2xl font-bold">
                                            {Math.floor(goal.currentMinutes / 60)}h {goal.currentMinutes % 60}m
                                            <span className="text-sm text-gray-500 font-normal ml-1">
                                                / {Math.floor(goal.targetMinutes / 60)}h {goal.targetMinutes % 60}m
                                            </span>
                                        </div>
                                        {isMet && <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />}
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${isMet ? 'bg-green-500' : 'bg-primary'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <h2 className="text-lg font-semibold mb-4">Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div
                        key={template.title}
                        onClick={() => {
                            setSelectedTemplate(template);
                            setTargetInput(template.defaultTarget);
                        }}
                        className="bg-surface rounded-xl p-6 border border-white/5 hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{template.title}</h3>
                            <Plus className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">{template.desc}</p>
                    </div>
                ))}
            </div>

            {/* Create Goal Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedTemplate(null)}>
                    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Setup Goal</h3>
                            <button onClick={() => setSelectedTemplate(null)}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Goal Template</label>
                            <div className="text-white font-medium">{selectedTemplate.title}</div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm text-gray-400 mb-2">Daily Target (Minutes)</label>
                            <input
                                type="number"
                                value={targetInput}
                                onChange={e => setTargetInput(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                = {Math.floor(targetInput / 60)} hours {targetInput % 60} minutes
                            </div>
                        </div>

                        <button
                            onClick={handleCreateGoal}
                            className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 rounded-lg transition-colors"
                        >
                            Create Goal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
