
APP_CATEGORIES = {
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
}

def get_category(app_name, window_title=""):
    app_name = app_name.lower()
    window_title = window_title.lower()
    
    # Check by app name (process name)
    for category, apps in APP_CATEGORIES.items():
        for app in apps:
            if app in app_name:
                return category
                
    # Fallback: Check window title for web wrappers or specific cases
    if "google docs" in window_title:
        return "Documenting"
    if "youtube" in window_title:
        return "Entertainment"
    if "github" in window_title:
        return "Code"
        
    return "Uncategorized"
