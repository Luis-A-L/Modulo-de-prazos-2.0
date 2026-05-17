const { createClient } = require('@supabase/supabase-js');
const CONFIG = require('./config');

let client = null;

function getClient() {
    if (!client) {
        client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
    return client;
}

async function signIn(email, password) {
    const c = getClient();
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

async function signOut() {
    const c = getClient();
    const { error } = await c.auth.signOut();
    if (error) throw error;
}

async function getSession() {
    const c = getClient();
    const { data, error } = await c.auth.getSession();
    if (error) throw error;
    return data.session;
}

async function getTemplates(userId, options = {}) {
    const c = getClient();
    let query = c.from(CONFIG.TEMPLATES_TABLE).select('*').eq('user_id', userId);
    if (options.since) {
        query = query.gte('updated_at', options.since);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

async function createTemplate(template) {
    const c = getClient();
    const { data, error } = await c.from(CONFIG.TEMPLATES_TABLE).insert(template).select().single();
    if (error) throw error;
    return data;
}

async function updateTemplate(id, updates) {
    const c = getClient();
    const { data, error } = await c.from(CONFIG.TEMPLATES_TABLE).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

async function deleteTemplate(id) {
    const c = getClient();
    const { error } = await c.from(CONFIG.TEMPLATES_TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
}

async function getFolders(userId) {
    const c = getClient();
    const { data, error } = await c.from(CONFIG.FOLDERS_TABLE).select('*').eq('user_id', userId);
    if (error) throw error;
    return data || [];
}

async function createFolder(folder) {
    const c = getClient();
    const { data, error } = await c.from(CONFIG.FOLDERS_TABLE).insert(folder).select().single();
    if (error) throw error;
    return data;
}

async function deleteFolder(id) {
    const c = getClient();
    const { error } = await c.from(CONFIG.FOLDERS_TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
}

async function getInstallerDownloadUrl(platform) {
    const files = {
        win32: 'Minutario-Portable-latest.exe',
        darwin: 'Minutario-latest.dmg',
        linux: 'Minutario-latest.AppImage',
    };

    const fileName = files[platform] || files.win32;

    return 'https://github.com/Luis-A-L/Modulo-de-prazos-2.0/releases/download/v1.0.0/' + fileName;
}

module.exports = {
    getClient,
    signIn,
    signOut,
    getSession,
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getFolders,
    createFolder,
    deleteFolder,
    getInstallerDownloadUrl,
};
