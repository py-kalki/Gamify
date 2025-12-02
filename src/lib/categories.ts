export type Category =
    | 'Entertainment'
    | 'Code'
    | 'Design'
    | 'Documenting'
    | 'Utility'
    | 'Browsing'
    | 'Messaging'
    | 'Miscellaneous'
    | 'Productivity'
    | 'Writing'
    | 'Admin'
    | 'Uncategorized';

export const APP_CATEGORIES: Record<Exclude<Category, 'Uncategorized'>, string[]> = {
    "Entertainment": [
        "vlc", "spotify", "netflix", "prime video", "xbox", "steam", "discord",
        "youtube music", "itunes", "lightroom"
    ],
    "Code": [
        "code", "devenv", "pycharm", "webstorm", "intellij", "clion", "github",
        "git", "docker desktop", "postman", "node", "python", "wsl", "notepad++",
        "xampp-control", "wampmanager", "mongodbcompass", "mysqlworkbench"
    ],
    "Design": [
        "photoshop", "illustrator", "figma", "canva", "xd", "blender",
        "resolve", "premiere pro", "afterfx", "krita", "gimp", "inkscape"
    ],
    "Documenting": [
        "winword", "excel", "powerpnt", "onenote", "notion", "obsidian",
        "evernote", "soffice", "typora", "acrobat", "foxitreader"
    ],
    "Utility": [
        "7zfm", "winrar", "sharex", "everything", "powertoys", "rufus",
        "cpuz", "hwmonitor", "crystaldiskinfo", "obs64", "nvidia control panel",
        "amd software"
    ],
    "Browsing": [
        "chrome", "msedge", "firefox", "brave", "opera", "tor browser"
    ],
    "Messaging": [
        "whatsapp", "telegram", "slack", "teams", "skype", "zoom"
    ],
    "Miscellaneous": [
        "googledrivesync", "onedrive", "dropbox", "steamcmd",
        "epicgameslauncher", "battle.net"
    ],
    "Productivity": [
        "todoist", "trello", "asana", "clockify", "rescuetime", "forest",
        "focustodo", "pomodone"
    ],
    "Writing": [
        "grammarly", "hemingway", "scrivener", "focuswriter"
    ],
    "Admin": [
        "taskmgr", "windowsterminal", "cmd", "powershell", "regedit",
        "diskmgmt", "devmgmt", "mmc"
    ]
};

export function getCategory(appName: string, windowTitle: string = ""): Category {
    const lowerApp = appName.toLowerCase();
    const lowerTitle = windowTitle.toLowerCase();

    // Check by app name (process name)
    for (const [category, apps] of Object.entries(APP_CATEGORIES)) {
        for (const app of apps) {
            if (lowerApp.includes(app)) {
                return category as Category;
            }
        }
    }

    // Fallback: Check window title for web wrappers or specific cases
    if (lowerTitle.includes("google docs")) return "Documenting";
    if (lowerTitle.includes("youtube")) return "Entertainment";
    if (lowerTitle.includes("github")) return "Code";

    return "Uncategorized";
}
