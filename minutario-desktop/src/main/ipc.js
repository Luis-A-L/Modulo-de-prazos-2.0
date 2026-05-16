const { ipcMain, shell, dialog, app } = require('electron');
const { updateTemplateCache } = require('./text-expander');
const { setAutoLaunch, isAutoLaunchEnabled } = require('./auto-launch');
const { checkForUpdates } = require('./auto-updater');

function registerIpcHandlers(mainWindow, createQuickAccessWindow) {

    ipcMain.on('update-templates-cache', (event, templates) => {
        updateTemplateCache(templates || []);
    });

    ipcMain.on('get-auto-launch', (event) => {
        event.reply('auto-launch-status', isAutoLaunchEnabled());
    });

    ipcMain.on('set-auto-launch', (event, enabled) => {
        setAutoLaunch(enabled);
    });

    ipcMain.on('check-for-updates', (event, silent = true) => {
        checkForUpdates(silent);
    });

    ipcMain.on('open-quick-access', () => {
        createQuickAccessWindow();
    });

    ipcMain.on('open-external', (event, url) => {
        if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
            shell.openExternal(url);
        }
    });

    ipcMain.on('get-app-version', (event) => {
        event.reply('app-version', app.getVersion());
    });

    ipcMain.handle('show-save-dialog', async (event, options) => {
        const result = await dialog.showSaveDialog(mainWindow, options);
        return result;
    });
}

module.exports = { registerIpcHandlers };
