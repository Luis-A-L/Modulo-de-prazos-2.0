const DB = require('./db');
const SupabaseAPI = require('./supabase');
const CONFIG = require('./config');

let syncState = 'idle';
let listeners = [];

function setState(newState) {
    syncState = newState;
    listeners.forEach((listener) => listener(newState));
}

function getSyncState() {
    return syncState;
}

function onSyncStateChange(listener) {
    listeners.push(listener);
    return () => {
        const idx = listeners.indexOf(listener);
        if (idx !== -1) listeners.splice(idx, 1);
    };
}

function mergeTemplates(localTemplates, remoteTemplates) {
    const merged = {};

    localTemplates.forEach((t) => {
        merged[t.id] = t;
    });

    remoteTemplates.forEach((remote) => {
        const local = merged[remote.id];
        if (!local) {
            merged[remote.id] = remote;
        } else {
            const localTime = new Date(local.updated_at || local.updatedAt || 0).getTime();
            const remoteTime = new Date(remote.updated_at || remote.updatedAt || 0).getTime();
            if (remoteTime >= localTime) {
                merged[remote.id] = remote;
            }
        }
    });

    return Object.values(merged);
}

function mergeFolders(localFolders, remoteFolders) {
    const merged = {};

    localFolders.forEach((f) => {
        merged[f.id] = f;
    });

    remoteFolders.forEach((remote) => {
        const local = merged[remote.id];
        if (!local) {
            merged[remote.id] = remote;
        } else {
            const localTime = new Date(local.updated_at || local.updatedAt || 0).getTime();
            const remoteTime = new Date(remote.updated_at || remote.updatedAt || 0).getTime();
            if (remoteTime >= localTime) {
                merged[remote.id] = remote;
            }
        }
    });

    return Object.values(merged);
}

async function syncTemplates(userId) {
    setState('syncing');

    try {
        const lastSync = await DB.getMeta(CONFIG.LAST_SYNC_KEY);
        const remoteTemplates = await SupabaseAPI.getTemplates(userId, { since: lastSync });
        const remoteFolders = await SupabaseAPI.getFolders(userId);
        const localTemplates = DB.getAllTemplates();
        const localFolders = DB.getAllFolders();

        const merged = mergeTemplates(localTemplates, remoteTemplates);
        const mergedFolders = mergeFolders(localFolders, remoteFolders);

        for (const template of merged) {
            DB.putTemplate(template);
        }

        for (const folder of mergedFolders) {
            DB.putFolder(folder);
        }

        const now = new Date().toISOString();
        DB.setMeta(CONFIG.LAST_SYNC_KEY, now);
        setState('updated');

        return {
            success: true,
            count: merged.length,
            folderCount: mergedFolders.length,
            templates: merged,
        };
    } catch (err) {
        setState('offline');
        return { success: false, error: err.message };
    }
}

async function fullSync(userId) {
    setState('syncing');

    try {
        const remoteTemplates = await SupabaseAPI.getTemplates(userId);
        const remoteFolders = await SupabaseAPI.getFolders(userId);

        DB.deleteAllTemplates();
        DB.deleteAllFolders();

        for (const template of remoteTemplates) {
            DB.putTemplate(template);
        }

        for (const folder of remoteFolders) {
            DB.putFolder(folder);
        }

        const now = new Date().toISOString();
        DB.setMeta(CONFIG.LAST_SYNC_KEY, now);
        setState('updated');

        return {
            success: true,
            count: remoteTemplates.length,
            folderCount: remoteFolders.length,
            templates: remoteTemplates,
        };
    } catch (err) {
        setState('offline');
        return { success: false, error: err.message };
    }
}

async function pushTemplateToRemote(template, userId) {
    try {
        template.user_id = userId;
        const existing = DB.getTemplateByShortcut(template.shortcut);

        if (existing) {
            await SupabaseAPI.updateTemplate(existing.id, template);
            DB.putTemplate({ ...template, id: existing.id });
        } else {
            const created = await SupabaseAPI.createTemplate(template);
            DB.putTemplate(created);
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

module.exports = {
    syncTemplates,
    fullSync,
    pushTemplateToRemote,
    onSyncStateChange,
    getSyncState,
    mergeTemplates,
    mergeFolders,
};
