/**
 * @file MinutarioPage.js
 * Minutário - Dashboard para gerenciamento de modelos de texto para expansão
 */

const { useState, useEffect, useMemo } = React;

const STORAGE_KEY_TEMPLATES = 'minutario_templates';
const STORAGE_KEY_FOLDERS = 'minutario_folders';

const MinutarioPage = () => {
    const { user } = useAuth();
    const [allTemplates, setAllTemplates] = useState([]);
    const [allFolders, setAllFolders] = useState([]);
    const [activeFolderId, setActiveFolderId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTemplateId, setEditingTemplateId] = useState(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [editName, setEditName] = useState('');
    const [editShortcut, setEditShortcut] = useState('');
    const [editFolderId, setEditFolderId] = useState('');
    const [editContent, setEditContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [syncStatus, setSyncStatus] = useState('');

    const EXTENSION_FILES = [
        'manifest.json', 'background.js', 'content.js',
        'shared/config.js', 'shared/config.example.js', 'shared/db.js', 'shared/api.js', 'shared/sync.js',
        'popup/popup.html', 'popup/popup.js', 'popup/popup.css',
        'quick-access/quick-access.html', 'quick-access/quick-access.js', 'quick-access/quick-access.css',
        'dashboard/index.html', 'dashboard/dashboard.html', 'dashboard/dashboard.js', 'dashboard/dashboard.css',
        'dashboard/manifest.json', 'dashboard/sw.js',
        'dashboard/sync/index.js', 'dashboard/sync/csv.js', 'dashboard/sync/supabase.js',
        'icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png',
        'lib/papaparse.min.js', 'lib/supabase.min.js', 'lib/quill.min.js', 'lib/quill.snow.css',
        'README.md'
    ];

    const sb = window._supabaseClient;
    const uid = user?.id;

    const toLocalTemplate = (t) => ({
        id: t.id,
        name: t.name || '',
        shortcut: t.shortcut || '',
        folderId: t.folder_id || null,
        content: t.content || '',
        usageCount: 0,
        createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
        updatedAt: t.updated_at ? new Date(t.updated_at).getTime() : Date.now()
    });

    const toLocalFolder = (f) => ({
        id: f.id,
        name: f.name || '',
        createdAt: f.created_at ? new Date(f.created_at).getTime() : Date.now()
    });

    const toRemoteTemplate = (t) => ({
        id: t.id,
        user_id: uid,
        folder_id: t.folderId || null,
        name: t.name || '',
        shortcut: t.shortcut || '',
        content: t.content || '',
        created_at: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString()
    });

    const toRemoteFolder = (f) => ({
        id: f.id,
        user_id: uid,
        name: f.name || '',
        order_idx: 0,
        created_at: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString()
    });

    useEffect(() => {
        try {
            const t = localStorage.getItem(STORAGE_KEY_TEMPLATES);
            if (t) setAllTemplates(JSON.parse(t));
            const f = localStorage.getItem(STORAGE_KEY_FOLDERS);
            if (f) setAllFolders(JSON.parse(f));
        } catch (e) {
            console.error('Erro ao carregar Minutário:', e);
        }
        syncFromSupabase();
    }, []);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(allTemplates)); } catch (e) {}
    }, [allTemplates]);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(allFolders)); } catch (e) {}
    }, [allFolders]);

    const syncFromSupabase = async () => {
        if (!sb || !uid) return;
        try {
            const [tRes, fRes] = await Promise.all([
                sb.from('minutario_templates').select('*').eq('user_id', uid),
                sb.from('minutario_folders').select('*').eq('user_id', uid)
            ]);
            if (tRes.error) throw tRes.error;
            if (fRes.error) throw fRes.error;
            if (tRes.data && tRes.data.length > 0) {
                const remote = tRes.data.map(toLocalTemplate);
                setAllTemplates(prev => {
                    const merged = new Map();
                    prev.forEach(t => merged.set(t.id, t));
                    remote.forEach(t => merged.set(t.id, t));
                    return Array.from(merged.values());
                });
            }
            if (fRes.data && fRes.data.length > 0) {
                const remote = fRes.data.map(toLocalFolder);
                setAllFolders(prev => {
                    const merged = new Map();
                    prev.forEach(f => merged.set(f.id, f));
                    remote.forEach(f => merged.set(f.id, f));
                    return Array.from(merged.values());
                });
            }
        } catch (e) {
            console.warn('Erro ao sincronizar do Supabase:', e);
        }
    };

    const filteredTemplates = useMemo(() => {
        let list = allTemplates;
        if (activeFolderId) {
            list = list.filter(t => t.folderId === activeFolderId);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(t =>
                (t.name || '').toLowerCase().includes(q) ||
                (t.shortcut || '').toLowerCase().includes(q) ||
                (t.content || '').toLowerCase().includes(q)
            );
        }
        return [...list].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }, [allTemplates, activeFolderId, searchQuery]);

    const activeFolder = allFolders.find(f => f.id === activeFolderId);
    const editingTemplate = editingTemplateId ? allTemplates.find(t => t.id === editingTemplateId) : null;

    const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleSelectTemplate = (template) => {
        setEditingTemplateId(template.id);
        setIsCreatingNew(false);
        setEditName(template.name || '');
        setEditShortcut(template.shortcut || '');
        setEditFolderId(template.folderId || '');
        setEditContent(template.content || '');
    };

    const handleNewTemplate = () => {
        setEditingTemplateId(null);
        setIsCreatingNew(true);
        setEditName('');
        setEditShortcut('');
        setEditFolderId(activeFolderId || '');
        setEditContent('');
    };

    const handleSave = async () => {
        if (!editName.trim()) {
            window.showToast?.('O nome do modelo é obrigatório.', 'warning');
            return;
        }
        if (!editShortcut.trim()) {
            window.showToast?.('O atalho é obrigatório.', 'warning');
            return;
        }

        setSaving(true);
        const shortcut = editShortcut.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        if (!shortcut) {
            window.showToast?.('O atalho deve conter ao menos uma letra ou número.', 'warning');
            setSaving(false);
            return;
        }

        const duplicate = allTemplates.find(t =>
            t.shortcut === shortcut && t.id !== editingTemplateId
        );
        if (duplicate) {
            window.showToast?.('Já existe um modelo com este atalho.', 'error');
            setSaving(false);
            return;
        }

        let formattedContent = editContent;
        if (!/<[a-z][\s\S]*>/i.test(formattedContent)) {
            formattedContent = formattedContent.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
        }

        if (editingTemplateId) {
            const updated = { name: editName.trim(), shortcut, folderId: editFolderId || null, content: formattedContent, updatedAt: Date.now() };
            setAllTemplates(prev => prev.map(t =>
                t.id === editingTemplateId ? { ...t, ...updated } : t
            ));
            if (sb && uid) {
                sb.from('minutario_templates').upsert(toRemoteTemplate({ id: editingTemplateId, ...updated }), { onConflict: 'id' }).select().then(r => { if (r.error) { console.warn('Erro Supabase:', r.error); window.showToast?.('Erro no banco: ' + r.error.message, 'error'); } else window.postMessage({ type: 'MINUTARIO_WEBAPP_SYNC_REQUEST' }, '*'); });
            }
            window.showToast?.('Modelo atualizado!', 'success');
        } else {
            const newTemplate = {
                id: generateId(),
                name: editName.trim(),
                shortcut,
                folderId: editFolderId || null,
                content: formattedContent,
                usageCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            setAllTemplates(prev => [...prev, newTemplate]);
            setEditingTemplateId(newTemplate.id);
            setIsCreatingNew(false);
            if (sb && uid) {
                sb.from('minutario_templates').upsert(toRemoteTemplate(newTemplate), { onConflict: 'id' }).select().then(r => { if (r.error) { console.warn('Erro Supabase:', r.error); window.showToast?.('Erro no banco: ' + r.error.message, 'error'); } else window.postMessage({ type: 'MINUTARIO_WEBAPP_SYNC_REQUEST' }, '*'); });
            }
            window.showToast?.('Modelo criado!', 'success');
        }
        setSaving(false);
    };

    const confirmDelete = () => {
        if (!editingTemplateId) return;
        const id = editingTemplateId;
        setAllTemplates(prev => prev.filter(t => t.id !== id));
        setEditingTemplateId(null);
        setIsCreatingNew(false);
        setEditName('');
        setEditShortcut('');
        setEditFolderId('');
        setEditContent('');
        setShowDeleteConfirm(false);
        if (sb && uid) {
            sb.from('minutario_templates').delete().eq('id', id).then(r => { if (r.error) console.warn('Erro Supabase:', r.error); else window.postMessage({ type: 'MINUTARIO_WEBAPP_SYNC_REQUEST' }, '*'); });
        }
        window.showToast?.('Modelo excluído.', 'info');
    };

    const handleCopyTemplate = async (template) => {
        try {
            const content = template.content || template.name;
            const paragraphs = content.split('\n')
                .filter(p => p.trim().length > 0)
                .map(p => `<p style="margin-bottom:0.5em;line-height:1.5">${p}</p>`)
                .join('');

            const htmlBlob = new Blob([
                `<html><body>${paragraphs}</body></html>`
            ], { type: 'text/html' });
            const textBlob = new Blob([content], { type: 'text/plain' });

            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': htmlBlob,
                    'text/plain': textBlob
                })
            ]);

            setAllTemplates(prev => prev.map(t =>
                t.id === template.id
                    ? { ...t, usageCount: (t.usageCount || 0) + 1, updatedAt: Date.now() }
                    : t
            ));
            setCopiedId(template.id);
            setTimeout(() => setCopiedId(null), 2000);
            window.showToast?.(`"${template.name}" copiado!`, 'success');
        } catch (err) {
            try {
                await navigator.clipboard.writeText(template.content || template.name);
                setCopiedId(template.id);
                setTimeout(() => setCopiedId(null), 2000);
                window.showToast?.(`"${template.name}" copiado!`, 'success');
            } catch (e) {
                window.showToast?.('Erro ao copiar.', 'error');
            }
        }
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        const folder = {
            id: generateId(),
            name: newFolderName.trim(),
            createdAt: Date.now()
        };
        setAllFolders(prev => [...prev, folder]);
        setActiveFolderId(folder.id);
        setNewFolderName('');
        setShowNewFolderInput(false);
        if (sb && uid) {
            sb.from('minutario_folders').insert(toRemoteFolder(folder)).select().then(r => { if (r.error) { console.warn('Erro Supabase:', r.error); window.showToast?.('Erro no banco (Pasta): ' + r.error.message, 'error'); } });
        }
    };

    const handleDeleteFolder = (folderId) => {
        const folder = allFolders.find(f => f.id === folderId);
        if (!folder) return;
        const count = allTemplates.filter(t => t.folderId === folderId).length;
        if (!confirm(`Excluir a pasta "${folder.name}"?${count > 0 ? ` ${count} modelo(s) serão movido(s) para "Sem Pasta".` : ''}`)) return;
        setAllFolders(prev => prev.filter(f => f.id !== folderId));
        setAllTemplates(prev => prev.map(t =>
            t.folderId === folderId ? { ...t, folderId: null } : t
        ));
        if (activeFolderId === folderId) setActiveFolderId(null);
        if (sb && uid) {
            sb.from('minutario_folders').delete().eq('id', folderId).then(r => { if (r.error) console.warn('Erro Supabase:', r.error); });
            allTemplates.filter(t => t.folderId === folderId).forEach(t => {
                sb.from('minutario_templates').upsert(toRemoteTemplate({ ...t, folderId: null }), { onConflict: 'id' }).then(r => { if (r.error) console.warn('Erro Supabase:', r.error); else window.postMessage({ type: 'MINUTARIO_WEBAPP_SYNC_REQUEST' }, '*'); });
            });
        }
        window.showToast?.(`Pasta "${folder.name}" excluída.`, 'info');
    };

    const handleDownloadExtension = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            const a = document.createElement('a');
            a.href = 'minutario_ext.zip';
            a.download = 'minutario-extensao.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.showToast?.('Download iniciado!', 'success');
        } catch (err) {
            console.error('Erro ao baixar extensão:', err);
            window.showToast?.('Erro ao baixar extensão.', 'error');
        } finally {
            setDownloading(false);
        }
    };


    const totalTemplates = allTemplates.length;
    const folderCounts = {};
    allTemplates.forEach(t => {
        const key = t.folderId || '__none__';
        folderCounts[key] = (folderCounts[key] || 0) + 1;
    });

    const renderEditor = () => {
        const isEditing = !!editingTemplateId && !isCreatingNew;
        const currentTemplate = isEditing ? allTemplates.find(t => t.id === editingTemplateId) : null;

        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <span className="material-symbols-rounded text-indigo-500 text-xl">
                                {isEditing ? 'edit_note' : 'note_add'}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-black text-sm tjpr-text-main uppercase tracking-widest">
                                {isEditing ? 'Editar Modelo' : 'Novo Modelo'}
                            </h3>
                            {isEditing && currentTemplate && (
                                <p className="text-[10px] font-bold tjpr-text-dim uppercase tracking-wider">
                                    {currentTemplate.name}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isEditing && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                            >
                                <span className="material-symbols-rounded text-sm">delete</span>
                                Excluir
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider text-white transition-all flex items-center gap-2 ${
                                saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                            }`}
                        >
                            <span className="material-symbols-rounded text-sm">
                                {saving ? 'sync' : 'save'}
                            </span>
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <TJPRInput
                            label="Nome do Modelo"
                            placeholder="Ex: Despacho de Intimação"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            icon="badge"
                            required
                        />
                        <div className="relative">
                            <TJPRInput
                                label="Atalho"
                                placeholder="Ex: desp-int"
                                value={editShortcut}
                                onChange={e => setEditShortcut(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                                icon="keyboard"
                                required
                                helperText="Digite / + atalho + Espaço para expandir"
                            />
                            <span className="absolute left-[52px] top-[38px] text-slate-400 dark:text-slate-500 text-sm font-bold pointer-events-none">/</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <TJPRSelect
                            label="Pasta"
                            value={editFolderId}
                            onChange={e => setEditFolderId(e.target.value)}
                            icon="folder"
                            options={[
                                { value: '', label: 'Sem Pasta' },
                                ...allFolders.map(f => ({ value: f.id, label: f.name }))
                            ]}
                        />
                    </div>

                    <div>
                        <label className="tjpr-label mb-2">
                            Conteúdo (HTML)
                        </label>
                        <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full h-[280px] p-5 rounded-xl tjpr-bg-alt border tjpr-border-main focus:border-indigo-500/50 focus:ring-0 font-mono text-sm leading-relaxed tjpr-text-main resize-none transition-all custom-scrollbar shadow-inner"
                            placeholder="Digite o conteúdo do modelo aqui... Use tags HTML para formatação."
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                            {['<b>texto</b>', '<i>texto</i>', '<u>texto</u>', '<br>', '<p>parágrafo</p>'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setEditContent(prev => prev + tag)}
                                    className="px-3 py-1.5 rounded-lg tjpr-bg-main border tjpr-border-main text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-wider tjpr-bg-hover transition-all active:scale-95"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {editContent && (
                        <div>
                            <label className="tjpr-label mb-2">Pré-visualização</label>
                            <div className="p-5 rounded-xl tjpr-bg-alt border tjpr-border-main min-h-[100px] max-h-[300px] overflow-y-auto prose dark:prose-invert max-w-none text-sm">
                                <div dangerouslySetInnerHTML={{ __html: editContent.replace(/\n/g, '<br>') }} />
                            </div>
                        </div>
                    )}
                </div>

                <TJPRModal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    title="Excluir Modelo"
                    icon="warning"
                    maxWidth="sm"
                >
                    <div className="space-y-6 text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
                            <span className="material-symbols-rounded text-rose-500 text-3xl">delete_forever</span>
                        </div>
                        <div>
                            <h4 className="font-black tjpr-text-main uppercase tracking-tight text-lg">
                                Tem certeza?
                            </h4>
                            <p className="tjpr-text-dim text-xs font-bold uppercase tracking-widest mt-2 leading-relaxed">
                                Esta ação não pode ser desfeita. O modelo será excluído permanentemente.
                            </p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <TJPRButton variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                                Cancelar
                            </TJPRButton>
                            <TJPRButton variant="error" onClick={confirmDelete} className="flex-1" icon="delete">
                                Excluir
                            </TJPRButton>
                        </div>
                    </div>
                </TJPRModal>
            </div>
        );
    };

    const renderEmptyState = () => (
        <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-6">
                <span className="material-symbols-rounded text-indigo-400 text-5xl">description</span>
            </div>
            <h3 className="text-xl font-black tjpr-text-main uppercase tracking-widest mb-2">
                Minutário
            </h3>
            <p className="text-sm font-medium tjpr-text-dim max-w-md leading-relaxed">
                Crie modelos de texto com atalhos personalizados para agilizar a produção de documentos.
            </p>
            <div className="mt-8 flex items-center gap-3 px-5 py-3 rounded-xl tjpr-bg-alt border tjpr-border-main shadow-sm">
                <span className="material-symbols-rounded text-primary text-sm">keyboard</span>
                <span className="text-xs font-bold tjpr-text-dim">
                    Digite <code className="px-2 py-0.5 rounded bg-primary/10 text-primary">/</code> + atalho + <code className="px-2 py-0.5 rounded bg-primary/10 text-primary">Espaço</code> para expandir
                </span>
            </div>
            <button
                onClick={handleNewTemplate}
                className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
                <span className="material-symbols-rounded text-sm">add</span>
                Criar Primeiro Modelo
            </button>
        </div>
    );

    return (
        <div className="h-[calc(100vh-100px)] animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-t-xl shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <span className="material-symbols-rounded text-indigo-500 text-2xl">description</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black tjpr-text-main uppercase tracking-widest">Minutário</h1>
                        <p className="text-[10px] font-bold tjpr-text-dim uppercase tracking-wider">
                            {totalTemplates} modelo{totalTemplates !== 1 ? 's' : ''} cadastrado{totalTemplates !== 1 ? 's' : ''}
                            {sb && uid && (
                                <span className="ml-2 inline-flex items-center gap-1 text-emerald-500">
                                    <span className="material-symbols-rounded text-[10px]">cloud</span>
                                    Online
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowDownloadModal(true)}
                        className="px-3 py-2 rounded-lg tjpr-bg-alt border tjpr-border-main text-emerald-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                        title="Baixar extensão para o navegador"
                    >
                        <span className="material-symbols-rounded text-sm">extension</span>
                        Extensão
                    </button>
                    <button
                        onClick={async () => {
                            if (!sb || !uid) {
                                window.showToast?.('Faça login para sincronizar com o Supabase.', 'warning');
                                return;
                            }
                            setSyncing(true);
                            setSyncStatus('Baixando dados do servidor...');
                            try {
                                const [tRes, fRes] = await Promise.all([
                                    sb.from('minutario_templates').select('*').eq('user_id', uid),
                                    sb.from('minutario_folders').select('*').eq('user_id', uid)
                                ]);
                                if (tRes.error) throw tRes.error;
                                if (fRes.error) throw fRes.error;
                                let mergedT = [...allTemplates];
                                if (tRes.data && tRes.data.length > 0) {
                                    const remoteMap = new Map();
                                    tRes.data.forEach(t => remoteMap.set(t.id, toLocalTemplate(t)));
                                    mergedT = allTemplates.map(t => remoteMap.has(t.id) ? { ...remoteMap.get(t.id), usageCount: t.usageCount || 0 } : t);
                                    remoteMap.forEach((t, id) => { if (!mergedT.some(m => m.id === id)) mergedT.push(t); });
                                }
                                let mergedF = [...allFolders];
                                if (fRes.data && fRes.data.length > 0) {
                                    const remoteMap = new Map();
                                    fRes.data.forEach(f => remoteMap.set(f.id, toLocalFolder(f)));
                                    mergedF = allFolders.map(f => remoteMap.has(f.id) ? remoteMap.get(f.id) : f);
                                    remoteMap.forEach((f, id) => { if (!mergedF.some(m => m.id === id)) mergedF.push(f); });
                                }
                                setAllTemplates(mergedT);
                                setAllFolders(mergedF);
                                window.showToast?.(`Sincronizado! ${mergedT.length} modelos, ${mergedF.length} pastas.`, 'success');
                            } catch (e) {
                                console.error('Erro ao sincronizar:', e);
                                window.showToast?.('Erro ao sincronizar com o servidor.', 'error');
                            }
                            setSyncing(false);
                            setSyncStatus('');
                        }}
                        disabled={syncing}
                        className="px-3 py-2 rounded-lg tjpr-bg-alt border tjpr-border-main tjpr-text-dim hover:tjpr-text-main transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                        <span className={`material-symbols-rounded text-sm ${syncing ? 'animate-spin' : ''}`}>
                            {syncing ? 'sync' : 'sync'}
                        </span>
                        {syncing ? 'Sincronizando...' : 'Sincronizar'}
                    </button>
                    <button
                        onClick={handleNewTemplate}
                        className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <span className="material-symbols-rounded text-sm">add</span>
                        Novo Modelo
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden bg-white dark:bg-slate-900">
                {/* Left Panel - Folders + List */}
                <div className="w-72 lg:w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50/50 dark:bg-slate-800/30">
                    {/* Folders */}
                    <div className="px-4 pt-4 pb-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black tjpr-text-dim uppercase tracking-[0.2em]">Pastas</span>
                            <button
                                onClick={() => { setShowNewFolderInput(true); setNewFolderName(''); }}
                                className="w-6 h-6 rounded-md tjpr-text-dim hover:tjpr-text-main hover:tjpr-bg-alt transition-all flex items-center justify-center"
                                title="Nova Pasta"
                            >
                                <span className="material-symbols-rounded text-sm">add</span>
                            </button>
                        </div>
                        {showNewFolderInput && (
                            <div className="flex gap-1 mb-2">
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowNewFolderInput(false); }}
                                    placeholder="Nome da pasta"
                                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg tjpr-bg-main border tjpr-border-main focus:border-indigo-500/50 focus:ring-0 tjpr-text-main"
                                    autoFocus
                                />
                                <button onClick={handleCreateFolder} className="px-2 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold">OK</button>
                                <button onClick={() => setShowNewFolderInput(false)} className="px-2 py-1.5 rounded-lg tjpr-bg-alt tjpr-text-dim text-xs font-bold">X</button>
                            </div>
                        )}
                        <div className="space-y-0.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                            <button
                                onClick={() => setActiveFolderId(null)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                    !activeFolderId
                                        ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                        : 'tjpr-text-dim hover:tjpr-bg-alt hover:tjpr-text-main border border-transparent'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-rounded text-sm">inbox</span>
                                    Todas as Pastas
                                </span>
                                <span className="text-[10px] opacity-60">{totalTemplates}</span>
                            </button>
                            {allFolders.map(folder => (
                                <div key={folder.id} className="group flex items-center">
                                    <button
                                        onClick={() => setActiveFolderId(folder.id)}
                                        className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                            activeFolderId === folder.id
                                                ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                                : 'tjpr-text-dim hover:tjpr-bg-alt hover:tjpr-text-main border border-transparent'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-rounded text-sm">folder</span>
                                            {folder.name}
                                        </span>
                                        <span className="text-[10px] opacity-60">{folderCounts[folder.id] || 0}</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFolder(folder.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md tjpr-text-dim hover:text-rose-500 transition-all ml-1"
                                        title="Excluir pasta"
                                    >
                                        <span className="material-symbols-rounded text-sm">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="px-4 py-2">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-rounded text-slate-400 text-sm">search</span>
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar modelos..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg tjpr-bg-main border tjpr-border-main focus:border-indigo-500/50 focus:ring-0 tjpr-text-main placeholder:text-slate-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center tjpr-text-dim hover:tjpr-text-main"
                                >
                                    <span className="material-symbols-rounded text-sm">close</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Template List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
                        {filteredTemplates.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="material-symbols-rounded text-3xl tjpr-text-dim block mb-2">description</span>
                                <p className="text-xs font-bold tjpr-text-dim uppercase tracking-wider">
                                    {searchQuery || activeFolder ? 'Nenhum modelo encontrado' : 'Nenhum modelo ainda'}
                                </p>
                                {!searchQuery && !activeFolder && (
                                    <button onClick={handleNewTemplate} className="mt-3 text-xs font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-wider">
                                        Criar primeiro modelo
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredTemplates.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleSelectTemplate(template)}
                                        onDoubleClick={() => handleCopyTemplate(template)}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all group ${
                                            editingTemplateId === template.id
                                                ? 'bg-indigo-500/10 border-indigo-500/30 shadow-sm'
                                                : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${editingTemplateId === template.id ? 'text-indigo-500' : 'tjpr-text-main'}`}>
                                                    {template.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/5 px-1.5 py-0.5 rounded">
                                                        /{template.shortcut}
                                                    </span>
                                                    {(template.usageCount || 0) > 0 && (
                                                        <span className="text-[9px] tjpr-text-dim flex items-center gap-0.5">
                                                            <span className="material-symbols-rounded text-[10px]">content_copy</span>
                                                            {template.usageCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={e => { e.stopPropagation(); handleCopyTemplate(template); }}
                                                className={`p-1.5 rounded-lg transition-all ${
                                                    copiedId === template.id
                                                        ? 'bg-green-500/20 text-green-500'
                                                        : 'opacity-0 group-hover:opacity-100 tjpr-text-dim hover:text-indigo-500 hover:bg-indigo-500/10'
                                                }`}
                                                title="Copiar"
                                            >
                                                <span className="material-symbols-rounded text-sm">
                                                    {copiedId === template.id ? 'check' : 'content_copy'}
                                                </span>
                                            </button>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {editingTemplateId !== null || editingTemplate || isCreatingNew ? renderEditor() : renderEmptyState()}
                </div>
            </div>

            {/* Modal Download Extensão */}
            <TJPRModal
                isOpen={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                title="Instalar Extensão Minutário"
                icon="extension"
                maxWidth="lg"
            >
                <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                        <span className="material-symbols-rounded text-indigo-400 text-2xl flex-shrink-0">info</span>
                        <div className="text-xs font-medium tjpr-text-dim leading-relaxed">
                            A extensão permite expandir seus modelos com atalhos de texto em qualquer página do navegador.
                            Digite <code className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">/</code> + atalho + <code className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">Espaço</code> para expandir.
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-black text-sm tjpr-text-main uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-rounded text-sm">download</span>
                            Download
                        </h4>
                        <button
                            onClick={handleDownloadExtension}
                            disabled={downloading}
                            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-all ${
                                downloading
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            <span className={`material-symbols-rounded ${downloading ? 'animate-spin' : ''}`}>
                                {downloading ? 'sync' : 'extension'}
                            </span>
                            {downloading ? 'Gerando ZIP...' : 'Baixar Extensão (.zip)'}
                        </button>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-black text-sm tjpr-text-main uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-rounded text-sm">settings</span>
                            Instalação
                        </h4>
                        <ol className="space-y-3 text-sm">
                            {[
                                'Faça o download do arquivo ZIP acima e extraia em uma pasta.',
                                'Abra o Chrome e vá para <b>chrome://extensions</b>.',
                                'Ative o <b>Modo do Desenvolvedor</b> (canto superior direito).',
                                'Clique em <b>Carregar sem compactação</b> e selecione a pasta extraída.',
                                'Pronto! A extensão aparecerá no canto superior direito do navegador.'
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    <span className="tjpr-text-main font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: step }} />
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                        <span className="material-symbols-rounded text-amber-400 text-lg flex-shrink-0">warning</span>
                        <div className="text-xs font-medium tjpr-text-dim leading-relaxed">
                            Após instalar, acesse o Minutário pelo ícone da extensão ou atalho <code className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">Ctrl+Shift+K</code>.
                            Os modelos criados aqui serão sincronizados automaticamente com a extensão.
                        </div>
                    </div>
                </div>
            </TJPRModal>
        </div>
    );
};

window.MinutarioPage = MinutarioPage;
