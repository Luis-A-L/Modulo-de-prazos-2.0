const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('MinutarioDesktop', {
    updateTemplatesCache: (templates) => {
        ipcRenderer.send('update-templates-cache', templates);
    },

    getAutoLaunch: () => {
        ipcRenderer.send('get-auto-launch');
    },
    setAutoLaunch: (enabled) => {
        ipcRenderer.send('set-auto-launch', enabled);
    },
    onAutoLaunchStatus: (callback) => {
        ipcRenderer.on('auto-launch-status', (event, enabled) => callback(enabled));
    },

    checkForUpdates: (silent = true) => {
        ipcRenderer.send('check-for-updates', silent);
    },
    onUpdateStatus: (callback) => {
        ipcRenderer.on('update-status', (event, status) => callback(status));
    },

    openQuickAccess: () => {
        ipcRenderer.send('open-quick-access');
    },
    openExternal: (url) => {
        ipcRenderer.send('open-external', url);
    },
    getAppVersion: () => {
        ipcRenderer.send('get-app-version');
    },
    onAppVersion: (callback) => {
        ipcRenderer.on('app-version', (event, version) => callback(version));
    },
    onShortcutExpanded: (callback) => {
        ipcRenderer.on('shortcut-expanded', (event, data) => callback(data));
    },
    onShowNotification: (callback) => {
        ipcRenderer.on('show-notification', (event, data) => callback(data));
    },
    onTriggerSync: (callback) => {
        ipcRenderer.on('trigger-sync', () => callback());
    },
    onAppReady: (callback) => {
        ipcRenderer.on('app-ready', () => callback());
    },
    onHookStatus: (callback) => {
        ipcRenderer.on('hook-status', (event, status) => callback(status));
    },
    showSaveDialog: (options) => {
        return ipcRenderer.invoke('show-save-dialog', options);
    },
    platform: process.platform,
    quitApp: () => ipcRenderer.send('quit-app'),
    showMainWindow: () => ipcRenderer.send('show-main-window'),
});
