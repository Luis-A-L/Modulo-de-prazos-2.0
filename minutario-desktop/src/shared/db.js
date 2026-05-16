const Store = require('electron-store');

const store = new Store({
    name: 'minutario',
    defaults: {
        templates: [],
        folders: [],
        meta: {},
    },
});

function getAllTemplates() {
    return store.get('templates', []);
}

function getAllFolders() {
    return store.get('folders', []);
}

function getTemplateByShortcut(shortcut) {
    const templates = getAllTemplates();
    const lower = shortcut.toLowerCase();
    return templates.find(t => (t.shortcut || '').toLowerCase() === lower) || null;
}

function putTemplate(template) {
    const templates = getAllTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
        templates[index] = { ...templates[index], ...template };
    } else {
        templates.push(template);
    }
    store.set('templates', templates);
}

function deleteTemplate(id) {
    const templates = getAllTemplates().filter(t => t.id !== id);
    store.set('templates', templates);
}

function deleteAllTemplates() {
    store.set('templates', []);
}

function putFolder(folder) {
    const folders = getAllFolders();
    const index = folders.findIndex(f => f.id === folder.id);
    if (index >= 0) {
        folders[index] = { ...folders[index], ...folder };
    } else {
        folders.push(folder);
    }
    store.set('folders', folders);
}

function deleteFolder(id) {
    const folders = getAllFolders().filter(f => f.id !== id);
    store.set('folders', folders);
}

function deleteAllFolders() {
    store.set('folders', []);
}

function setMeta(key, value) {
    const meta = store.get('meta', {});
    meta[key] = value;
    store.set('meta', meta);
}

function getMeta(key) {
    const meta = store.get('meta', {});
    return meta[key];
}

function searchTemplates(query) {
    const templates = getAllTemplates();
    const lower = query.toLowerCase();
    return templates.filter(t =>
        (t.name || '').toLowerCase().includes(lower) ||
        (t.shortcut || '').toLowerCase().includes(lower)
    );
}

function importData(data) {
    if (data.templates) store.set('templates', data.templates);
    if (data.folders) store.set('folders', data.folders);
    if (data.meta) store.set('meta', data.meta);
}

function exportData() {
    return {
        templates: getAllTemplates(),
        folders: getAllFolders(),
        meta: store.get('meta', {}),
    };
}

module.exports = {
    getAllTemplates,
    getAllFolders,
    getTemplateByShortcut,
    putTemplate,
    deleteTemplate,
    deleteAllTemplates,
    putFolder,
    deleteFolder,
    deleteAllFolders,
    setMeta,
    getMeta,
    searchTemplates,
    importData,
    exportData,
};
