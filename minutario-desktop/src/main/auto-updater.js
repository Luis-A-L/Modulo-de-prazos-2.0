const { autoUpdater } = require('electron-updater');
const { Notification } = require('electron');

let mainWindow = null;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
    console.log('[Minutário] Checking for updates...');
    sendStatus('checking');
});

autoUpdater.on('update-available', (info) => {
    console.log('[Minutário] Update available:', info.version);
    sendStatus('available', info);

    new Notification({
        title: 'Minutário - Atualização Disponível',
        body: `Versão ${info.version} disponível. Baixando...`,
    }).show();
});

autoUpdater.on('update-not-available', (info) => {
    console.log('[Minutário] No update available');
    sendStatus('not-available', info);
});

autoUpdater.on('download-progress', (progress) => {
    const percent = Math.round(progress.percent);
    sendStatus('downloading', { percent });
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('[Minutário] Update downloaded:', info.version);
    sendStatus('downloaded', info);

    new Notification({
        title: 'Minutário - Atualização Pronta',
        body: `Versão ${info.version} baixada. A instalação ocorrerá ao sair.`,
    }).show();
});

autoUpdater.on('error', (err) => {
    console.error('[Minutário] Auto-updater error:', err.message);
    sendStatus('error', { message: err.message });
});

function sendStatus(channel, data) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-status', { channel, data });
    }
}

function setupAutoUpdater(mainWin) {
    mainWindow = mainWin;

    try {
        autoUpdater.checkForUpdates();
        setInterval(() => {
            try {
                autoUpdater.checkForUpdates();
            } catch (e) {
                // silent
            }
        }, 3600000);
    } catch (err) {
        console.error('[Minutário] Failed to start auto-updater:', err.message);
    }
}

async function checkForUpdates(force = false) {
    try {
        if (force) {
            await autoUpdater.checkForUpdates();
        } else {
            autoUpdater.checkForUpdates();
        }
    } catch (err) {
        console.error('[Minutário] Manual update check failed:', err.message);
    }
}

module.exports = { setupAutoUpdater, checkForUpdates };
