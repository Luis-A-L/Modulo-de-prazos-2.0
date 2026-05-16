const { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, ipcMain, Notification } = require('electron');
const path = require('path');
const { initTray } = require('./tray');
const { initGlobalHook, stopGlobalHook, setAppFocused, isHookFailed, isHookActive } = require('./global-hook');
const { initTextExpander } = require('./text-expander');
const { registerIpcHandlers } = require('./ipc');
const { setupAutoLaunch } = require('./auto-launch');
const { setupAutoUpdater } = require('./auto-updater');

let mainWindow = null;
let quickAccessWindow = null;
let tray = null;

const isDev = !app.isPackaged;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'Minutário',
        icon: path.join(__dirname, '../../build/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
        show: false,
    });

    if (isDev) {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        if (process.argv.includes('--show')) {
            mainWindow.show();
        }
    });

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('focus', () => setAppFocused(true));
    mainWindow.on('blur', () => setAppFocused(false));

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('app-ready');
    });

    return mainWindow;
}

function createQuickAccessWindow() {
    if (quickAccessWindow && !quickAccessWindow.isDestroyed()) {
        quickAccessWindow.show();
        quickAccessWindow.focus();
        return quickAccessWindow;
    }

    quickAccessWindow = new BrowserWindow({
        width: 480,
        height: 600,
        resizable: true,
        frame: true,
        title: 'Minutário - Acesso Rápido',
        icon: path.join(__dirname, '../../build/icon.png'),
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
        show: false,
    });

    quickAccessWindow.loadFile(path.join(__dirname, '../renderer/quick-access.html'));

    quickAccessWindow.once('ready-to-show', () => {
        quickAccessWindow.show();
    });

    quickAccessWindow.on('focus', () => setAppFocused(true));
    quickAccessWindow.on('blur', () => setAppFocused(false));

    quickAccessWindow.on('closed', () => {
        quickAccessWindow = null;
    });

    return quickAccessWindow;
}

app.on('ready', () => {
    createMainWindow();
    tray = initTray(mainWindow, createQuickAccessWindow);

    setupAutoLaunch();
    setupAutoUpdater(mainWindow);

    // Ordem correta: IPC handlers primeiro, depois expander
    registerIpcHandlers(mainWindow, createQuickAccessWindow);
    initTextExpander(mainWindow);

    // Inicia o hook global após um delay para garantir que o sistema estabilizou
    setTimeout(() => {
        initGlobalHook();

        // Se o hook falhou, notifica o usuário
        setTimeout(() => {
            if (!isHookActive() && isHookFailed() && mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('hook-status', { active: false, failed: true });
            } else if (isHookActive() && mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('hook-status', { active: true, failed: false });
            }
        }, 500);
    }, 2000);

    globalShortcut.register('CommandOrControl+Shift+K', () => {
        createQuickAccessWindow();
    });
    globalShortcut.register('CommandOrControl+Shift+M', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
});

app.on('will-quit', () => {
    stopGlobalHook();
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    // Don't quit - keep running in tray
});

app.on('activate', () => {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
    }
});

let isQuitting = false;
app.on('before-quit', () => {
    isQuitting = true;
    app.isQuitting = true;
});

ipcMain.on('quit-app', () => {
    isQuitting = true;
    app.isQuitting = true;
    app.quit();
});

ipcMain.on('show-main-window', () => {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
    }
});
