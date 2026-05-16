const { app } = require('electron');

function setupAutoLaunch() {
    try {
        app.setLoginItemSettings({
            openAtLogin: false,
            path: app.getPath('exe'),
        });
    } catch (err) {
        console.error('[Minutário] Failed to setup auto-launch:', err);
    }
}

function setAutoLaunch(enabled) {
    try {
        app.setLoginItemSettings({
            openAtLogin: enabled,
            path: app.getPath('exe'),
        });
    } catch (err) {
        console.error('[Minutário] Failed to set auto-launch:', err);
    }
}

function isAutoLaunchEnabled() {
    try {
        return app.getLoginItemSettings().openAtLogin;
    } catch (err) {
        return false;
    }
}

module.exports = { setupAutoLaunch, setAutoLaunch, isAutoLaunchEnabled };
