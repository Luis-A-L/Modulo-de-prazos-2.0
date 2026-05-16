let uIOhook = null;
try {
    uIOhook = require('uiohook-napi').uIOhook;
} catch (e) {
    console.warn('[Minutário] uiohook-napi não disponível (native addon):', e.message);
}

let hookActive = false;
let hookFailed = false;
let expanderCallback = null;
let buffer = '';
let appFocused = false;
const MAX_BUFFER_LENGTH = 50;

const KEY_CODE_MAP = {
    8: 'Backspace', 9: 'Tab', 13: 'Enter', 16: 'Shift', 17: 'Control', 18: 'Alt',
    19: 'Pause', 20: 'CapsLock', 27: 'Escape', 32: 'Space',
    33: 'PageUp', 34: 'PageDown', 35: 'End', 36: 'Home',
    37: 'Left', 38: 'Up', 39: 'Right', 40: 'Down',
    41: 'Select', 42: 'Print', 43: 'Execute', 44: 'PrintScreen',
    45: 'Insert', 46: 'Delete', 47: 'Help',
    48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9',
    65: 'A', 66: 'B', 67: 'C', 68: 'D', 69: 'E', 70: 'F', 71: 'G', 72: 'H',
    73: 'I', 74: 'J', 75: 'K', 76: 'L', 77: 'M', 78: 'N', 79: 'O', 80: 'P',
    81: 'Q', 82: 'R', 83: 'S', 84: 'T', 85: 'U', 86: 'V', 87: 'W', 88: 'X',
    89: 'Y', 90: 'Z',
    91: 'MetaLeft', 92: 'MetaRight',
    96: 'NumPad0', 97: 'NumPad1', 98: 'NumPad2', 99: 'NumPad3',
    100: 'NumPad4', 101: 'NumPad5', 102: 'NumPad6', 103: 'NumPad7',
    104: 'NumPad8', 105: 'NumPad9',
    106: 'Multiply', 107: 'Add', 108: 'Separator', 109: 'Subtract',
    110: 'Decimal', 111: 'Divide',
    112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4', 116: 'F5', 117: 'F6',
    118: 'F7', 119: 'F8', 120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12',
    144: 'NumLock', 145: 'ScrollLock',
    186: 'Semicolon', 187: 'Equal', 188: 'Comma', 189: 'Minus',
    190: 'Period', 191: 'Slash', 192: 'Backquote',
    219: 'BracketLeft', 220: 'Backslash', 221: 'BracketRight', 222: 'Quote',
};

function setExpanderCallback(callback) {
    expanderCallback = callback;
}

function getKeyChar(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return null;

    const keyName = KEY_CODE_MAP[event.keycode];

    if (keyName && keyName.length === 1) {
        const capsActive = (typeof event.capslock !== 'undefined') ? event.capslock : false;
        const shifted = event.shiftKey ? !capsActive : capsActive;
        return shifted ? keyName.toUpperCase() : keyName.toLowerCase();
    }

    if (event.keycode === 191 && !event.shiftKey) return '/';
    if (event.keycode === 191 && event.shiftKey) return '?';
    if (event.keycode === 186 && !event.shiftKey) return ';';
    if (event.keycode === 186 && event.shiftKey) return ':';
    if (event.keycode === 188 && !event.shiftKey) return ',';
    if (event.keycode === 188 && event.shiftKey) return '<';
    if (event.keycode === 190 && !event.shiftKey) return '.';
    if (event.keycode === 190 && event.shiftKey) return '>';

    return null;
}

function isSimulatedKey(event) {
    return event.reserved & 0x01;
}

function setAppFocused(focused) {
    appFocused = focused;
    if (focused) buffer = '';
}

function handleKeyDown(event) {
    if (isSimulatedKey(event)) return;
    if (appFocused) return;

    if (event.altKey || event.ctrlKey || event.metaKey) {
        buffer = '';
        return;
    }

    const char = getKeyChar(event);

    if (char === '/') {
        buffer = '/';
        return;
    }

    if (buffer === '/') {
        if (event.keycode === 32) {
            buffer = '';
            return;
        }
        if (char && /^[a-zA-Z0-9]$/.test(char)) {
            buffer += char;
            if (buffer.length > MAX_BUFFER_LENGTH) buffer = '';
            return;
        }
        buffer = '';
        return;
    }

    if (buffer.startsWith('/') && buffer.length > 1) {
        if (event.keycode === 32) {
            const shortcut = buffer.substring(1).toLowerCase();
            buffer = '';

            if (expanderCallback) {
                expanderCallback(shortcut);
            }
            return;
        }

        if (char && /^[a-zA-Z0-9]$/.test(char)) {
            buffer += char;
            if (buffer.length > MAX_BUFFER_LENGTH) buffer = '';
            return;
        }

        if (event.keycode === 8) {
            buffer = buffer.slice(0, -1);
            if (buffer === '/') buffer = '';
            return;
        }

        buffer = '';
        return;
    }

    if (event.keycode !== 32) {
        buffer = '';
    }
}

function initGlobalHook() {
    if (hookActive) return;

    if (!uIOhook) {
        hookFailed = true;
        console.warn('[Minutário] uiohook-napi não carregado. Hook global indisponível.');
        return;
    }

    try {
        uIOhook.on('keydown', handleKeyDown);
        uIOhook.start();
        hookActive = true;
        hookFailed = false;
        console.log('[Minutário] Global keyboard hook started');
    } catch (err) {
        hookFailed = true;
        console.error('[Minutário] Failed to start global keyboard hook:', err);
    }
}

function stopGlobalHook() {
    if (!hookActive || !uIOhook) return;

    try {
        uIOhook.stop();
        hookActive = false;
        console.log('[Minutário] Global keyboard hook stopped');
    } catch (err) {
        console.error('[Minutário] Failed to stop global keyboard hook:', err);
    }
}

function isHookActive() {
    return hookActive;
}

function isHookFailed() {
    return hookFailed;
}

module.exports = {
    initGlobalHook,
    stopGlobalHook,
    setExpanderCallback,
    setAppFocused,
    isHookActive,
    isHookFailed,
};
