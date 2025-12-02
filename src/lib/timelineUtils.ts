import { cleanAppName, getAppCategory } from './gamification';
import type { AWEvent, Category } from './gamification';
import { parseISO, differenceInSeconds } from 'date-fns';

export interface AggregatedBlock {
    category: Category;
    start: Date;
    end: Date;
    duration: number;
    apps: Set<string>;
    primaryApp: string; // The dominant app in this block
}

const SYSTEM_APPS = ['ShellExperienceHost', 'RuntimeBroker', 'explorer.exe', 'SearchApp', 'LockApp'];
const IGNORE_DURATION_THRESHOLD = 30; // Ignore system apps if < 30s
const MERGE_GAP_THRESHOLD = 10; // Merge if gap < 10s
const MIN_BLOCK_DURATION = 10; // Absorb blocks < 10s

export function processTimelineEvents(events: AWEvent[]): AggregatedBlock[] {
    if (events.length === 0) return [];

    // 1. Filter and Clean
    // Remove system noise unless it's a long duration
    const cleanedEvents = events.filter(e => {
        const appName = cleanAppName(e.data.app);
        if (SYSTEM_APPS.some(sys => appName.includes(sys))) {
            return e.duration > IGNORE_DURATION_THRESHOLD;
        }
        return true;
    });

    if (cleanedEvents.length === 0) return [];

    // Sort by timestamp
    cleanedEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const blocks: AggregatedBlock[] = [];
    let currentBlock: AggregatedBlock | null = null;

    cleanedEvents.forEach(event => {
        const appName = cleanAppName(event.data.app);
        const category = getAppCategory(appName, event.data.title);
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

        // 2. Merge Logic
        // Check if same category OR same app
        const isSameCategory = currentBlock.category === category;
        const isSameApp = currentBlock.apps.has(appName);

        // Check gap
        const gap = differenceInSeconds(startTime, currentBlock.end);

        // Merge if:
        // (Same Category OR Same App) AND Gap is small
        // OR
        // Event is very short (micro-event) -> absorb into previous block to avoid holes
        if ((isSameCategory || isSameApp) && gap < MERGE_GAP_THRESHOLD) {
            // Extend current block
            currentBlock.end = endTime;
            currentBlock.duration += event.duration + gap; // Include gap in duration
            currentBlock.apps.add(appName);

            // Update primary app if this event is longer (simple heuristic)
            // In a real implementation, we'd sum durations per app, but this is a good approx for now
            if (event.duration > (currentBlock.duration / 2)) {
                // If this new event is significant, maybe it's the primary? 
                // Actually, let's keep the first one as primary unless overridden by a very long one
            }
        } else if (event.duration < MIN_BLOCK_DURATION && gap < MERGE_GAP_THRESHOLD) {
            // 3. Absorb Micro-events
            // If it's a tiny event of a DIFFERENT category but very close, just absorb it 
            // to prevent a tiny 2px sliver.
            // We essentially "hide" this tiny distraction under the current block
            currentBlock.end = endTime;
            currentBlock.duration += event.duration + gap;
            // Don't add to apps list to keep it clean, or add it? 
            // Let's NOT add it to apps list if it's a different category, effectively hiding it.
        } else {
            // Finalize current block and start new one
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

    // 4. Post-Processing Filter
    // Remove any remaining blocks that are too short to be meaningful
    return blocks.filter(b => b.duration >= MIN_BLOCK_DURATION);
}
