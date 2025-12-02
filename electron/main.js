import { app, BrowserWindow, shell, ipcMain, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { spawn } from 'child_process';

let mainWindow;
let pythonProcess;
let tray;
let isQuitting = false;

function startPythonBackend() {
    const scriptPath = path.join(app.getAppPath(), 'backend', 'main.py');
    console.log("Starting Python backend from:", scriptPath);

    // Assuming 'python' is in PATH. In production, you'd bundle a python executable.
    pythonProcess = spawn('python', [scriptPath]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
    });
}

function createTray() {
    try {
        // Try to resolve icon path for both dev and prod
        let iconPath = path.join(app.getAppPath(), 'public', 'vite.svg');
        if (process.env.NODE_ENV === 'development') {
            iconPath = path.join(__dirname, '../public/vite.svg');
        }

        console.log("Creating tray with icon:", iconPath);

        // Use nativeImage for better support
        const icon = nativeImage.createFromPath(iconPath);

        try {
            tray = new Tray(icon);
        } catch (e) {
            console.warn("Could not load tray icon, using default or empty:", e);
            return;
        }

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show App',
                click: () => {
                    mainWindow.show();
                }
            },
            {
                label: 'Quit',
                click: () => {
                    isQuitting = true;
                    app.quit();
                }
            }
        ]);
        tray.setToolTip('Gamify');
        tray.setContextMenu(contextMenu);

        tray.on('click', () => {
            if (mainWindow.isVisible()) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
            } else {
                mainWindow.show();
            }
        });
    } catch (error) {
        console.error("Failed to create tray:", error);
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 650,
        height: 100,
        frame: false, // Frameless for custom UI and widget shape
        transparent: true, // Transparent for widget shape
        hasShadow: true,
        resizable: true, // Allow resizing
        skipTaskbar: true, // Start hidden from taskbar (widget mode)
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(app.getAppPath(), 'electron/preload.js')
        }
    });

    // Load the local dev server
    mainWindow.loadURL('http://localhost:5173');

    // Open DevTools for debugging
    mainWindow.webContents.openDevTools({ mode: 'detach' });

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Window loaded successfully');
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load window:', errorCode, errorDescription);
    });

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    // Handle Close Event
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            // Force widget mode on close
            mainWindow.webContents.send('force-widget-mode');

            if (mainWindow.isMaximized()) mainWindow.unmaximize();
            mainWindow.setMinimumSize(0, 0);
            mainWindow.setSize(650, 100);
            mainWindow.setAlwaysOnTop(true, 'screen-saver');
            mainWindow.setSkipTaskbar(true);
        }
        return false;
    });
}

ipcMain.on('set-mode', (event, mode) => {
    console.log(`IPC: set-mode received with mode: ${mode}`);
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
        console.error('IPC: set-mode - Could not find window from sender');
        return;
    }

    if (mode === 'widget') {
        console.log('IPC: Switching to widget mode (600x80)');
        if (win.isMaximized()) win.unmaximize();
        win.setMinimumSize(0, 0); // Allow shrinking
        win.setResizable(true);
        win.setBounds({ width: 600, height: 80 });
        win.setAlwaysOnTop(true, 'screen-saver');
        win.setSkipTaskbar(true); // Hide from taskbar in widget mode

        // Double check bounds after a tick
        setTimeout(() => {
            console.log(`IPC: Bounds after resize: ${JSON.stringify(win.getBounds())}`);
        }, 100);
    } else if (mode === 'dashboard') {
        console.log('IPC: Switching to dashboard mode (1280x800)');
        win.setResizable(true); // Enable native resizing support
        win.setMinimumSize(0, 0); // Remove constraints
        win.setBounds({ width: 1280, height: 800 });
        win.center();
        win.setAlwaysOnTop(false);
        win.setSkipTaskbar(false); // Show in taskbar in dashboard mode
        console.log(`IPC: New bounds: ${JSON.stringify(win.getBounds())}`);
    }
});

ipcMain.on('window-control', (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    if (action === 'minimize') win.minimize();
    if (action === 'maximize') {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    }
    if (action === 'close') {
        // Custom Close Logic: Switch to Widget Mode
        win.webContents.send('force-widget-mode');

        if (win.isMaximized()) win.unmaximize();
        win.setMinimumSize(0, 0);
        win.setSize(650, 100);
        win.setAlwaysOnTop(true, 'screen-saver');
        win.setSkipTaskbar(true);
    }
    if (action === 'quit') {
        isQuitting = true;
        app.quit();
    }
});

ipcMain.on('widget-resize', (event, { width, height }) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        win.setSize(width, height);
    }
});

ipcMain.on('resize-window', (event, { width, height }) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        if (win.isMaximized()) {
            win.unmaximize();
        }
        win.setBounds({ width: Math.round(width), height: Math.round(height) });
    }
});



app.whenReady().then(() => {
    startPythonBackend();
    createTray();
    createWindow();

    // Autostart
    app.setLoginItemSettings({
        openAtLogin: true,
        path: app.getPath('exe')
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('will-quit', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // Do not quit, keep running in tray
        // app.quit(); 
    }
});
