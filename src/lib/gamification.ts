import { startOfDay, endOfDay } from 'date-fns';

const AW_API_URL = 'http://localhost:5600/api/0';

export interface AWEvent {
    timestamp: string;
    duration: number;
    data: {
        app: string;
        title: string;
    };
}

export interface GamificationStats {
    xp: number;
    level: number;
    productiveTime: number; // in seconds
    topCategories: { name: string; percent: number; time: number; color: string }[];
    allApps: { name: string; percent: number; time: number; color: string }[];
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
        const app = event.data.app || 'Unknown';
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
    const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

    // Initialize
    hours.forEach(h => hourly[h] = 0);

    events.forEach(e => {
        const d = new Date(e.timestamp);
        const h = d.getHours();
        if (h >= 9 && h <= 17) {
            const hourStr = h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`;
            hourly[hourStr] = (hourly[hourStr] || 0) + e.duration;
        }
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
    // Return empty for now as we focus on real-time tracking
    return [];
}

export interface HourlyData {
    hour: string;
    score: number; // 0-100 based on minutes active in that hour
}

export async function fetchHourlyStats(): Promise<HourlyData[]> {
    const events = await fetchTodayActivity();
    const hourlyTotals: Record<number, number> = {};

    events.forEach(e => {
        const date = new Date(e.timestamp);
        const hour = date.getHours();
        hourlyTotals[hour] = (hourlyTotals[hour] || 0) + e.duration;
    });

    const hourlyData: HourlyData[] = [];
    for (let h = 9; h <= 17; h++) { // Work hours 9-5
        const duration = hourlyTotals[h] || 0;
        const score = Math.min(100, Math.round((duration / 3600) * 100));

        const hourStr = h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`;
        hourlyData.push({ hour: hourStr, score });
    }
    return hourlyData;
}
