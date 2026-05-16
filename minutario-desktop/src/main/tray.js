const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

let tray = null;

function createTrayIcon() {
    const sizes = [16, 24, 32];
    for (const size of sizes) {
        const iconPath = path.join(__dirname, `../../build/icon-${size}.png`);
        try {
            const img = nativeImage.createFromPath(iconPath);
            if (!img.isEmpty()) return img;
        } catch (e) {}
    }

    const iconPath = path.join(__dirname, '../../build/icon.png');
    try {
        const img = nativeImage.createFromPath(iconPath);
        if (!img.isEmpty()) return img;
    } catch (e) {}

    return nativeImage.createFromDataURL(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEoSURBVDiNpZMxTsNAEEX/rNeOAwUlHVdA4gJcAAkVHVdA4gJcAAkVFHeA4gJcAAkVHZyA4gJcAAlF4jjO7pdiYsexTRrJ0mh/esxv5o8YYyTVBJBKqQfOeQFCrXUAUPJ3KYByziAiYowAUNd1oaoqpJTqui4AgHMOYwySJEFd1wCAJEmQZRn6voemaZBlGX41TQMATdMgz3PEGJFlGQAgTdN/B3LOEUP4FMMYI8455Hn+P0Dvfcg5D4vFYty27eFyuZxOJpPp+Xwe1ut1F2PEl+M4nDEGY4wYYwAAYwxYawEAMQYAwDkP++5hjOGcc5ZlSJKk3u12kFKibduQZRkAgO/7ehhjZAyBAIvFAgBAVSGEYK0FACmlUkqN/+CccyEEpZQyxgAA8jzX3/gCLYMq7zz/SyIAAAAASUVORK5CYII='
    );
}

function initTray(mainWindow, createQuickAccessWindow) {
    const trayIcon = createTrayIcon();
    tray = new Tray(trayIcon);
    tray.setToolTip('Minutário - Clique para abrir');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Abrir Minutário',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            },
        },
        {
            label: 'Acesso Rápido (Ctrl+Shift+K)',
            click: () => {
                createQuickAccessWindow();
            },
        },
        { type: 'separator' },
        {
            label: 'Sincronizar Agora',
            click: () => {
                if (mainWindow && mainWindow.webContents) {
                    mainWindow.webContents.send('trigger-sync');
                }
            },
        },
        {
            label: 'Verificar Atualizações',
            click: () => {
                const { checkForUpdates } = require('./auto-updater');
                checkForUpdates(true);
            },
        },
        { type: 'separator' },
        {
            label: 'Sair',
            click: () => {
                app.isQuitting = true;
                app.quit();
            },
        },
    ]);

    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });

    return tray;
}

module.exports = { initTray };
