import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import { spawn } from 'child_process';

let mainWindow;
let pythonProcess;

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

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(app.getAppPath(), 'electron/preload.js')
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#0a0a0a',
            symbolColor: '#ffffff',
            height: 30
        }
    });

    // Load the local dev server
    mainWindow.loadURL('http://localhost:5173');

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url, frameName }) => {
        if (url.includes('/widget') || frameName === 'GamifyWidget') {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    width: 650,
                    height: 100,
                    frame: false,
                    transparent: true,
                    alwaysOnTop: true,
                    resizable: false,
                    hasShadow: true,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true,
                        preload: path.join(app.getAppPath(), 'electron/preload.js')
                    }
                }
            };
        }
        if (url.startsWith('http')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
}

app.whenReady().then(() => {
    startPythonBackend();
    createWindow();

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
        app.quit();
    }
});
