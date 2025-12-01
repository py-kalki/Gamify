const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getActivity: () => ipcRenderer.invoke('get-activity')
});
