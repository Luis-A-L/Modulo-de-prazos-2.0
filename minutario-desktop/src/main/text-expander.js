const { clipboard, Notification, nativeImage } = require('electron');
const { execSync } = require('child_process');
const { setExpanderCallback } = require('./global-hook');

let mainWindow = null;
let templateCache = [];

function initTextExpander(mainWin) {
    mainWindow = mainWin;

    setExpanderCallback(async (shortcut) => {
        await expandShortcut(shortcut);
    });
}

function updateTemplateCache(templates) {
    if (Array.isArray(templates)) {
        templateCache = templates;
    }
}

function findTemplate(shortcut) {
    const lower = shortcut.toLowerCase();
    return templateCache.find((t) => {
        const s = (t.shortcut || '').toLowerCase();
        return s === lower;
    }) || null;
}

function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function simulateBackspaces(count) {
    if (count <= 0) return true;

    try {
        if (process.platform === 'win32') {
            execSync(
                `powershell -NoProfile -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('${'{BACKSPACE}'.repeat(count)}')"`,
                { timeout: 3000, windowsHide: true }
            );
            return true;
        } else if (process.platform === 'darwin') {
            for (let i = 0; i < count; i++) {
                execSync(`osascript -e 'tell application "System Events" to key code 51'`, { timeout: 1000 });
            }
            return true;
        } else {
            execSync(`xdotool key --repeat ${count} BackSpace`, { timeout: 3000 });
            return true;
        }
    } catch (err) {
        return false;
    }
}

function simulatePaste() {
    try {
        if (process.platform === 'win32') {
            execSync(
                `powershell -NoProfile -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('^v')"`,
                { timeout: 3000, windowsHide: true }
            );
            return true;
        } else if (process.platform === 'darwin') {
            execSync(
                `osascript -e 'tell application "System Events" to keystroke "v" using command down'`,
                { timeout: 3000 }
            );
            return true;
        } else {
            execSync(`xdotool key ctrl+v`, { timeout: 3000 });
            return true;
        }
    } catch (err) {
        return false;
    }
}

function showNotification(title, body) {
    try {
        new Notification({ title, body }).show();
    } catch (e) {}
}

function showCopiedNotification(templateName) {
    showNotification(
        'Minutário - Texto Expandido',
        `"${templateName}" copiado para área de transferência. Use Ctrl+V para colar.`
    );

    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('show-notification', {
            title: 'Texto copiado',
            body: `"${templateName}" copiado. Use Ctrl+V para colar.`,
        });
    }
}

async function expandShortcut(shortcut) {
    const template = findTemplate(shortcut);
    if (!template) return;

    const text = template.plain_text || stripHtml(template.content || template.html_content || '');
    if (!text) return;

    const shortcutLength = shortcut.length + 1;
    let expandedViaPaste = false;

    try {
        clipboard.writeText(text);

        const backspacesOk = simulateBackspaces(shortcutLength);

        if (backspacesOk) {
            const pasteOk = simulatePaste();
            if (pasteOk) {
                expandedViaPaste = true;
            }
        }
    } catch (err) {
        console.error('[Minutário] Expansion error:', err);
    }

    if (!expandedViaPaste) {
        showCopiedNotification(template.name);
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('shortcut-expanded', {
            shortcut,
            templateName: template.name,
            usedClipboard: !expandedViaPaste,
        });
    }
}

module.exports = {
    initTextExpander,
    updateTemplateCache,
};
