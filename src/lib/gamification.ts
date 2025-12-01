import { startOfDay, endOfDay, format, subDays } from 'date-fns';

const AW_API_URL = 'http://localhost:5600/api/0';

export interface AWEvent {
    timestamp: string;
    duration: number;
    data: {
        app: string;
        title: string;
    };
}

export type Category =
    | 'Design' | 'Messaging' | 'Code' | 'Productivity' | 'Entertainment'
    | 'Browsing' | 'Writing' | 'Documenting' | 'Admin' | 'Utility'
    | 'Email' | 'Personal' | 'Miscellaneous' | 'Uncategorized';

export const CATEGORY_COLORS: Record<Category, string> = {
    'Design': '#ff00ff',
    'Messaging': '#00ff00',
    'Code': '#0000ff',
    'Productivity': '#00ffff',
    'Entertainment': '#ff0000',
    'Browsing': '#ffff00',
    'Writing': '#ffa500',
    'Documenting': '#808080',
    'Admin': '#800000',
    'Utility': '#808000',
    'Email': '#008000',
    'Personal': '#800080',
    'Miscellaneous': '#008080',
    'Uncategorized': '#ffffff'
};

export interface GamificationStats {
    xp: number;
    level: number;
    productiveTime: number; // in seconds
    topCategories: { name: string; percent: number; time: number; color: string }[];
    allApps: { name: string; percent: number; time: number; color: string }[];
}

export function cleanAppName(appName: string): string {
    if (!appName) return 'Unknown';

    // Remove .exe extension
    let name = appName.replace(/\.exe$/i, '');

    // Map common system apps
    const map: Record<string, string> = {
        'msedge': 'Microsoft Edge',
        'chrome': 'Google Chrome',
        'code': 'Visual Studio Code',
        'explorer': 'File Explorer',
        'spotify': 'Spotify',
        'python': 'Python',
        'electron': 'Gamify',
        'winword': 'Word',
        'excel': 'Excel',
        'powerpnt': 'PowerPoint',
        'notepad': 'Notepad',
        'cmd': 'Command Prompt',
        'powershell': 'PowerShell',
        'discord': 'Discord',
        'slack': 'Slack',
        'teams': 'Microsoft Teams',
        'obs64': 'OBS Studio',
        'vlc': 'VLC Media Player',
        'steam': 'Steam',
        'applicationframehost': 'System',
    };

    // Case-insensitive lookup
    const lowerName = name.toLowerCase();
    if (map[lowerName]) {
        return map[lowerName];
    }

    // Capitalize first letter if it's not mapped
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getAppCategory(appName: string, title: string = ''): Category {
    const lowerApp = appName.toLowerCase();
    const lowerTitle = title.toLowerCase();

    // Code
    if (['code', 'visual studio code', 'vscode', 'intellij', 'pycharm', 'webstorm', 'sublime', 'atom', 'vim', 'nvim', 'terminal', 'powershell', 'cmd', 'git', 'github'].some(k => lowerApp.includes(k))) return 'Code';
    if (lowerTitle.includes('github') || lowerTitle.includes('stackoverflow')) return 'Code';

    // Design
    if (['figma', 'photoshop', 'illustrator', 'xd', 'sketch', 'blender', 'canva', 'inkscape', 'gimp'].some(k => lowerApp.includes(k))) return 'Design';

    // Messaging
    if (['discord', 'slack', 'teams', 'whatsapp', 'telegram', 'signal', 'messenger', 'skype', 'zoom'].some(k => lowerApp.includes(k))) return 'Messaging';

    // Browsing
    if (['chrome', 'edge', 'firefox', 'safari', 'opera', 'brave', 'vivaldi'].some(k => lowerApp.includes(k))) return 'Browsing';

    // Entertainment
    if (['spotify', 'netflix', 'youtube', 'vlc', 'steam', 'epic', 'games', 'twitch'].some(k => lowerApp.includes(k))) return 'Entertainment';
    if (lowerTitle.includes('youtube') || lowerTitle.includes('netflix')) return 'Entertainment';

    // Productivity
    if (['notion', 'trello', 'asana', 'jira', 'linear', 'obsidian', 'evernote', 'todoist'].some(k => lowerApp.includes(k))) return 'Productivity';

    // Documenting / Writing
    if (['word', 'docs', 'writer', 'notepad', 'textedit'].some(k => lowerApp.includes(k))) return 'Writing';
    if (['excel', 'sheets', 'powerpoint', 'slides'].some(k => lowerApp.includes(k))) return 'Documenting';

    // Email
    if (['outlook', 'mail', 'thunderbird', 'superhuman'].some(k => lowerApp.includes(k))) return 'Email';
    if (lowerTitle.includes('gmail') || lowerTitle.includes('outlook')) return 'Email';

    // Admin / Utility
    if (['settings', 'control panel', 'task manager', 'explorer', 'finder', 'system'].some(k => lowerApp.includes(k))) return 'Utility';

    return 'Uncategorized';
}

export async function fetchTodayActivity(): Promise<AWEvent[]> {
    const start = startOfDay(new Date()).toISOString();
    const end = endOfDay(new Date()).toISOString();

    // Query to get all window events for today
    // We use a regex to find any window bucket
    const query = `
    events = query_bucket(find_bucket("aw-watcher-window_"));
    events = filter_period_intersect(events, filter_period_intersect(events, "${start}/${end}"));
    RETURN = events;
  `;

    try {
        const response = await fetch(`${AW_API_URL}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            console.error('Failed to fetch activity data:', response.statusText);
            return [];
        }

        const result = await response.json();
        return result[0] || [];
    } catch (error) {
        console.error('Error fetching activity data:', error);
        return [];
    }
}

export function calculateStats(events: AWEvent[]): GamificationStats {
    let totalDuration = 0;
    const categoryMap: Record<string, number> = {};

    events.forEach(event => {
        totalDuration += event.duration;
        const rawApp = event.data.app || 'Unknown';
        const app = cleanAppName(rawApp);
        categoryMap[app] = (categoryMap[app] || 0) + event.duration;
    });

    // XP Calculation: 10 XP per minute
    const xp = Math.floor((totalDuration / 60) * 10);

    // Level Calculation: Floor(Sqrt(XP / 100))
    const level = Math.floor(Math.sqrt(xp / 100));

    // Top Categories (Apps)
    const allApps = Object.entries(categoryMap)
        .sort(([, a], [, b]) => b - a)
        .map(([name, duration], index) => ({
            name,
            time: duration,
            percent: totalDuration > 0 ? Math.round((duration / totalDuration) * 100) : 0,
            color: ['#bf00ff', '#3b82f6', '#6366f1', '#ef4444', '#10b981', '#f59e0b'][index % 6]
        }));

    return {
        xp,
        level,
        productiveTime: totalDuration,
        topCategories: allApps.slice(0, 3),
        allApps
    };
}

export function getTimelineData(events: AWEvent[]) {
    const hourly: Record<string, number> = {};
    const hours = Array.from({ length: 24 }, (_, i) => {
        const h = i;
        return h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : h === 0 ? '12 AM' : `${h} AM`;
    });

    // Initialize
    hours.forEach(h => hourly[h] = 0);

    events.forEach(e => {
        const d = new Date(e.timestamp);
        const h = d.getHours();
        const hourStr = h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : h === 0 ? '12 AM' : `${h} AM`;
        hourly[hourStr] = (hourly[hourStr] || 0) + e.duration;
    });

    return hours.map(time => ({
        time,
        focus: Math.round((hourly[time] || 0) / 60), // minutes
        break: 0 // Placeholder for now
    }));
}

export interface HeatmapData {
    date: Date;
    value: number; // 0-4 scale based on duration
}

export async function fetchHeatmapData(): Promise<HeatmapData[]> {
    const end = new Date();
    const start = subDays(end, 90); // Last 90 days
    const events = await fetchActivityRange(start, end);

    const dailyMap: Record<string, number> = {};
    events.forEach(e => {
        const date = e.timestamp.split('T')[0];
        dailyMap[date] = (dailyMap[date] || 0) + e.duration;
    });

    const heatmap: HeatmapData[] = [];
    for (let i = 0; i <= 90; i++) {
        const d = subDays(end, i);
        const dateStr = d.toISOString().split('T')[0];
        const duration = dailyMap[dateStr] || 0;

        // Scale 0-4 based on hours (0, <1h, <3h, <6h, >6h)
        let value = 0;
        const hours = duration / 3600;
        if (hours > 6) value = 4;
        else if (hours > 3) value = 3;
        else if (hours > 1) value = 2;
        else if (hours > 0) value = 1;

        heatmap.push({ date: d, value });
    }
    return heatmap.reverse();
}

export interface HourlyData {
    hour: string;
    score: number; // 0-100 based on minutes active in that hour
}

export async function fetchHourlyStats(): Promise<HourlyData[]> {
    const end = new Date();
    const start = subDays(end, 7); // Last 7 days for better average
    const events = await fetchActivityRange(start, end);
    const hourlyTotals: Record<number, number> = {};

    events.forEach(e => {
        const date = new Date(e.timestamp);
        const hour = date.getHours();
        hourlyTotals[hour] = (hourlyTotals[hour] || 0) + e.duration;
    });

    const hourlyData: HourlyData[] = [];
    for (let h = 0; h < 24; h++) { // Full 24 hours
        const totalDuration = hourlyTotals[h] || 0;
        const avgDuration = totalDuration / 7; // Average per day over last 7 days
        const score = Math.min(100, Math.round((avgDuration / 3600) * 100)); // % of the hour spent productive

        const hourStr = h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : h === 0 ? '12 AM' : `${h} AM`;
        hourlyData.push({ hour: hourStr, score });
    }
    return hourlyData;
}

export async function fetchActivityRange(startDate: Date, endDate: Date): Promise<AWEvent[]> {
    const start = startOfDay(startDate).toISOString();
    const end = endOfDay(endDate).toISOString();

    const query = `
    events = query_bucket(find_bucket("aw-watcher-window_"));
    events = filter_period_intersect(events, filter_period_intersect(events, "${start}/${end}"));
    RETURN = events;
  `;

    try {
        const response = await fetch(`${AW_API_URL}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) return [];
        const result = await response.json();
        return result[0] || [];
    } catch (error) {
        console.error('Error fetching activity range:', error);
        return [];
    }
}

export interface DailyTrend {
    date: string; // YYYY-MM-DD
    day: string; // Mon, Tue, etc.
    score: number; // minutes of productive time
    totalTime: number;
}

export function calculateTrends(events: AWEvent[]): DailyTrend[] {
    const dailyMap: Record<string, number> = {};

    events.forEach(e => {
        const date = e.timestamp.split('T')[0];
        dailyMap[date] = (dailyMap[date] || 0) + e.duration;
    });

    // Generate last 7 days
    const trends: DailyTrend[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = format(d, 'EEE');

        trends.push({
            date: dateStr,
            day: dayName,
            score: Math.round((dailyMap[dateStr] || 0) / 60), // minutes
            totalTime: dailyMap[dateStr] || 0
        });
    }
    return trends;
}

export function calculateStreak(events: AWEvent[]): { current: number; longest: number } {
    const dailyMap: Record<string, number> = {};
    events.forEach(e => {
        const date = e.timestamp.split('T')[0];
        dailyMap[date] = (dailyMap[date] || 0) + e.duration;
    });

    const dates = Object.keys(dailyMap).sort().reverse(); // Newest first
    if (dates.length === 0) return { current: 0, longest: 0 };

    let current = 0;
    let longest = 0;
    let tempStreak = 0;

    // Check if today or yesterday has activity to start the streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = subDays(new Date(), 1).toISOString().split('T')[0];

    let lastDate = new Date();

    // Simple streak logic: check consecutive days
    // This is a simplified version. For robust streaks, we'd need to iterate back from today.

    // Let's iterate back from today
    for (let i = 0; i < 365; i++) {
        const d = subDays(new Date(), i);
        const dateStr = d.toISOString().split('T')[0];

        if (dailyMap[dateStr] && dailyMap[dateStr] > 0) {
            current++;
        } else {
            // If it's today and no activity yet, don't break streak if yesterday had activity
            if (i === 0) continue;
            break;
        }
    }

    // Longest streak calculation (simplified)
    // In a real app, we'd scan the whole history
    longest = Math.max(current, longest);

    return { current, longest };
}

export async function exportAllData(): Promise<any> {
    const end = new Date();
    const start = subDays(end, 365); // Last 1 year
    const events = await fetchActivityRange(start, end);

    const settings = {
        name: localStorage.getItem('gamify_user_name'),
        email: localStorage.getItem('gamify_user_email'),
        timer: localStorage.getItem('gamify_timer_settings'),
    };

    return {
        exportedAt: new Date().toISOString(),
        settings,
        activityCount: events.length,
        events
    };
}
