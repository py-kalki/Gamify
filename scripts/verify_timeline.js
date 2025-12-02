import { parseISO, differenceInSeconds } from 'date-fns';

// Mock helpers from gamification.ts
function cleanAppName(appName) {
    if (!appName) return 'Unknown';
    let name = appName.replace(/\.exe$/i, '');
    const map = {
        'code': 'Visual Studio Code',
        'explorer': 'File Explorer',
        'applicationframehost': 'System',
        'shellexperiencehost': 'ShellExperienceHost',
        'chrome': 'Google Chrome'
    };
    const lower = name.toLowerCase();
    return map[lower] || name;
}

function getAppCategory(appName) {
    const lower = appName.toLowerCase();
    if (lower.includes('code') || lower.includes('terminal')) return 'Code';
    if (lower.includes('chrome')) return 'Browsing';
    if (lower.includes('system') || lower.includes('host')) return 'Utility';
    return 'Uncategorized';
}

// Logic from timelineUtils.ts (adapted for Node.js execution)
const SYSTEM_APPS = ['ShellExperienceHost', 'RuntimeBroker', 'explorer.exe', 'SearchApp', 'LockApp'];
const IGNORE_DURATION_THRESHOLD = 30;
const MERGE_GAP_THRESHOLD = 10;
const MIN_BLOCK_DURATION = 10;

function processTimelineEvents(events) {
    if (events.length === 0) return [];

    console.log(`Processing ${events.length} raw events...`);

    // 1. Filter and Clean
    const cleanedEvents = events.filter(e => {
        const appName = cleanAppName(e.data.app);
        if (SYSTEM_APPS.some(sys => appName.includes(sys))) {
            const keep = e.duration > IGNORE_DURATION_THRESHOLD;
            if (!keep) console.log(`  - Filtering system app: ${appName} (${e.duration}s)`);
            return keep;
        }
        return true;
    });

    if (cleanedEvents.length === 0) return [];

    cleanedEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const blocks = [];
    let currentBlock = null;

    cleanedEvents.forEach(event => {
        const appName = cleanAppName(event.data.app);
        const category = getAppCategory(appName);
        const startTime = parseISO(event.timestamp);
        const endTime = new Date(startTime.getTime() + event.duration * 1000);

        if (!currentBlock) {
            currentBlock = {
                category,
                start: startTime,
                end: endTime,
                duration: event.duration,
                apps: new Set([appName]),
                primaryApp: appName
            };
            return;
        }

        const isSameCategory = currentBlock.category === category;
        const isSameApp = currentBlock.apps.has(appName);
        const gap = differenceInSeconds(startTime, currentBlock.end);

        if ((isSameCategory || isSameApp) && gap < MERGE_GAP_THRESHOLD) {
            // Merge
            console.log(`  - Merging ${appName} into ${currentBlock.category} block (Gap: ${gap}s)`);
            currentBlock.end = endTime;
            currentBlock.duration += event.duration + gap;
            currentBlock.apps.add(appName);
        } else if (event.duration < MIN_BLOCK_DURATION && gap < MERGE_GAP_THRESHOLD) {
            // Absorb
            console.log(`  - Absorbing micro-event ${appName} (${event.duration}s) into ${currentBlock.category} block`);
            currentBlock.end = endTime;
            currentBlock.duration += event.duration + gap;
        } else {
            blocks.push(currentBlock);
            currentBlock = {
                category,
                start: startTime,
                end: endTime,
                duration: event.duration,
                apps: new Set([appName]),
                primaryApp: appName
            };
        }
    });

    if (currentBlock) {
        blocks.push(currentBlock);
    }

    // Post-processing filter
    const finalBlocks = blocks.filter(b => {
        const keep = b.duration >= MIN_BLOCK_DURATION;
        if (!keep) console.log(`  - Removing short block: ${b.category} (${b.duration}s)`);
        return keep;
    });

    return finalBlocks;
}

// Mock Data
const now = new Date();
const baseTime = now.toISOString().split('T')[0] + 'T10:00:00'; // 10:00 AM

const mockEvents = [
    // Coding Session (Fragmented)
    { timestamp: baseTime + 'Z', duration: 120, data: { app: 'code.exe', title: 'Project' } }, // 2 mins Code
    { timestamp: baseTime.replace('00:00', '02:05') + 'Z', duration: 5, data: { app: 'ShellExperienceHost.exe', title: '' } }, // 5s System Noise (Should be filtered)
    { timestamp: baseTime.replace('00:00', '02:12') + 'Z', duration: 60, data: { app: 'code.exe', title: 'Project' } }, // 1 min Code (Gap 7s -> Should Merge)

    // Micro-event distraction
    { timestamp: baseTime.replace('00:00', '03:15') + 'Z', duration: 4, data: { app: 'explorer.exe', title: '' } }, // 4s Explorer (Should be absorbed or filtered)

    // Context Switch
    { timestamp: baseTime.replace('00:00', '03:25') + 'Z', duration: 300, data: { app: 'chrome.exe', title: 'StackOverflow' } }, // 5 mins Browsing (New Block)

    // Another Coding Session
    { timestamp: baseTime.replace('00:00', '08:30') + 'Z', duration: 200, data: { app: 'code.exe', title: '' } }, // 3+ mins Code
];

console.log("--- STARTING TIMELINE VERIFICATION ---");
const result = processTimelineEvents(mockEvents);

console.log("\n--- RESULT ---");
result.forEach(b => {
    console.log(`[${b.category}] ${b.duration}s | Apps: ${Array.from(b.apps).join(', ')}`);
});
console.log("--------------------------------------");
