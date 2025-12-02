const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getActivity: () => ipcRenderer.invoke('get-activity'),
    resizeWidget: (width, height) => ipcRenderer.send('widget-resize', { width, height }),
    setMode: (mode) => ipcRenderer.send('set-mode', mode),
    windowControl: (action) => ipcRenderer.send('window-control', action),
    resizeWindow: (width, height) => ipcRenderer.send('resize-window', { width, height }),
    onForceWidget: (callback) => ipcRenderer.on('force-widget-mode', callback),
    removeForceWidgetListener: (callback) => ipcRenderer.removeListener('force-widget-mode', callback)
});
