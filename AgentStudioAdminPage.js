const { useState, useEffect, useCallback, useRef } = React;

const MODELOS_IA = [
    { id: 'deepseek-v4-flash-free', nome: 'DeepSeek V4 Flash Free', recomendado: true },
    { id: 'qwen-qwq-32b-preview', nome: 'Qwen QwQ 32B Preview', recomendado: false },
    { id: 'minimax-m2.5-free', nome: 'MiniMax M2.5 Free', recomendado: false },
    { id: 'ring-2.6-1t-free', nome: 'Ring 2.6 1T Free', recomendado: false },
    { id: 'nemotron-3-super-free', nome: 'Nemotron 3 Super Free', recomendado: false },
    { id: 'llama-3.1-nemotron-70b', nome: 'Llama 3.1 Nemotron 70B', recomendado: false },
    { id: 'mistral-small-3.1-24b', nome: 'Mistral Small 3.1 24B', recomendado: false },
    { id: 'big-pickle', nome: 'Big Pickle', recomendado: false },
];

const AgentStudioAdminPage = () => {
    const { userData } = useAuth();
    const [agentes, setAgentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formNome, setFormNome] = useState('');
    const [formDescricao, setFormDescricao] = useState('');
    const [formPrompt, setFormPrompt] = useState('');
    const [formModelo, setFormModelo] = useState('deepseek-v4-flash-free');
    const [formTemperatura, setFormTemperatura] = useState(0.3);
    const [formConhecimento, setFormConhecimento] = useState('');
    const [formAgentePai, setFormAgentePai] = useState('');
    const [formOrdem, setFormOrdem] = useState(0);
    const [formAtivo, setFormAtivo] = useState(true);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteHasChildren, setDeleteHasChildren] = useState(false);

    const [testModal, setTestModal] = useState(false);
    const [testingAgent, setTestingAgent] = useState(null);
    const [testMessages, setTestMessages] = useState([]);
    const [testInput, setTestInput] = useState('');
    const [testRunning, setTestRunning] = useState(false);
    const testRef = useRef(null);

    const carregarAgentes = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await window._supabaseClient
                .from('agentes_triagem')
                .select('*')
                .order('ordem', { ascending: true });
            if (error) throw error;
            setAgentes(data || []);
        } catch (err) {
            console.error('Erro ao carregar agentes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { carregarAgentes(); }, [carregarAgentes]);

    const agentesPai = agentes.filter(a => !a.agente_pai_id);
    const agentesFiltrados = agentes.filter(a =>
        a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAgenteNome = (id) => {
        const a = agentes.find(x => x.id === id);
        return a ? a.nome : '(Orquestrador)';
    };

    const getModeloNome = (id) => {
        const m = MODELOS_IA.find(x => x.id === id);
        return m ? m.nome : id;
    };

    const getFilhosCount = (id) => agentes.filter(a => a.agente_pai_id === id).length;

    const openCreate = () => {
        setEditingId(null);
        setFormNome('');
        setFormDescricao('');
        setFormPrompt('Você é um especialista em triagem do TJPR. Analise o documento e responda conforme suas instruções.');
        setFormModelo('deepseek-v4-flash-free');
        setFormTemperatura(0.3);
        setFormConhecimento('');
        setFormAgentePai('');
        setFormOrdem(agentes.length + 1);
        setFormAtivo(true);
        setShowModal(true);
    };

    const openEdit = (agente) => {
        setEditingId(agente.id);
        setFormNome(agente.nome || '');
        setFormDescricao(agente.descricao || '');
        setFormPrompt(agente.prompt || '');
        setFormModelo(agente.modelo_ia || 'deepseek-v4-flash-free');
        setFormTemperatura(agente.temperatura ?? 0.3);
        setFormConhecimento(agente.conhecimento_anexo || '');
        setFormAgentePai(agente.agente_pai_id || '');
        setFormOrdem(agente.ordem ?? 0);
        setFormAtivo(agente.ativo !== false);
        setShowModal(true);
    };

    const openDelete = (agente) => {
        setDeletingId(agente.id);
        setDeleteHasChildren(getFilhosCount(agente.id) > 0);
        setShowDeleteConfirm(true);
    };

    const handleSave = async () => {
        if (!formNome.trim()) return alert('Nome é obrigatório');
        if (!formPrompt.trim()) return alert('Prompt é obrigatório');
        setSaving(true);
        try {
            const payload = {
                nome: formNome.trim(),
                descricao: formDescricao.trim(),
                prompt: formPrompt.trim(),
                modelo_ia: formModelo,
                temperatura: parseFloat(formTemperatura),
                conhecimento_anexo: formConhecimento.trim() || null,
                agente_pai_id: formAgentePai || null,
                ordem: parseInt(formOrdem) || 0,
                ativo: formAtivo,
                updated_at: new Date().toISOString(),
            };

            if (editingId) {
                const { error } = await window._supabaseClient
                    .from('agentes_triagem')
                    .update(payload)
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                payload.created_at = new Date().toISOString();
                const { error } = await window._supabaseClient
                    .from('agentes_triagem')
                    .insert(payload);
                if (error) throw error;
            }

            setShowModal(false);
            await carregarAgentes();
        } catch (err) {
            console.error('Erro ao salvar agente:', err);
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setSaving(true);
        try {
            if (deleteHasChildren) {
                const { error: upErr } = await window._supabaseClient
                    .from('agentes_triagem')
                    .update({ agente_pai_id: null })
                    .eq('agente_pai_id', deletingId);
                if (upErr) throw upErr;
            }
            const { error } = await window._supabaseClient
                .from('agentes_triagem')
                .delete()
                .eq('id', deletingId);
            if (error) throw error;
            setShowDeleteConfirm(false);
            setDeletingId(null);
            await carregarAgentes();
        } catch (err) {
            console.error('Erro ao deletar:', err);
            alert('Erro ao deletar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const openTest = (agente) => {
        setTestingAgent(agente);
        setTestMessages([
            { role: 'system', content: `Modo teste para: ${agente.nome}\nPrompt: ${agente.prompt?.slice(0, 200)}...\n\nEnvie uma mensagem para testar o comportamento do agente.` }
        ]);
        setTestModal(true);
    };

    const runTest = async () => {
        if (!testInput.trim() || !testingAgent || testRunning) return;
        const pergunta = testInput.trim();
        setTestInput('');
        setTestMessages(prev => [...prev, { role: 'user', content: pergunta }]);
        setTestRunning(true);

        try {
            const { data: raw, error } = await window._supabaseClient.functions.invoke('ai-proxy', {
                body: {
                    model: testingAgent.modelo_ia || 'deepseek-v4-flash-free',
                    messages: [
                        { role: 'system', content: testingAgent.prompt || '' },
                        ...(testingAgent.conhecimento_anexo
                            ? [{ role: 'system', content: `Conhecimento anexado:\n${testingAgent.conhecimento_anexo}` }]
                            : []),
                        { role: 'user', content: pergunta }
                    ],
                    temperature: testingAgent.temperatura ?? 0.3,
                    max_tokens: 2000,
                }
            });
            const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
            const content = data?.choices?.[0]?.message?.content || 'Sem resposta';
            setTestMessages(prev => [...prev, { role: 'assistant', content }]);
        } catch (err) {
            setTestMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${err.message}` }]);
        } finally {
            setTestRunning(false);
        }
    };

    useEffect(() => {
        if (testRef.current) {
            testRef.current.scrollTop = testRef.current.scrollHeight;
        }
    }, [testMessages]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="tjpr-card p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-violet-500/10 text-violet-400 rounded-xl flex items-center justify-center border border-violet-500/20">
                            <span className="material-symbols-rounded text-2xl">smart_toy</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black tjpr-text-main tracking-tight">Studio de Agentes IA</h2>
                            <p className="text-xs tjpr-text-dim tracking-wider mt-0.5">Gerencie os agentes de triagem inteligente</p>
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                        <span className="material-symbols-rounded text-sm">add</span>
                        Novo Agente
                    </button>
                </div>

                <div className="mt-6 relative">
                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                    <input
                        type="text"
                        placeholder="Buscar agente por nome ou descrição..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 tjpr-bg-alt border border-white/10 rounded-xl text-sm tjpr-text-main placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="tjpr-card p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-sm tjpr-text-dim">Carregando agentes...</p>
                </div>
            ) : agentesFiltrados.length === 0 ? (
                <div className="tjpr-card p-12 text-center">
                    <span className="material-symbols-rounded text-5xl text-slate-600 mb-4">smart_toy</span>
                    <p className="text-lg font-bold tjpr-text-main mb-2">Nenhum agente encontrado</p>
                    <p className="text-sm tjpr-text-dim mb-6">{searchTerm ? 'Nenhum resultado para a busca.' : 'Crie seu primeiro agente de IA para começar.'}</p>
                    {!searchTerm && (
                        <button onClick={openCreate} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                            <span className="material-symbols-rounded text-sm mr-2 align-middle">add</span>
                            Criar Primeiro Agente
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {agentesFiltrados.map(agente => {
                        const filhos = getFilhosCount(agente.id);
                        const isOrquestrador = !agente.agente_pai_id;
                        return (
                            <div key={agente.id} className={`tjpr-card p-5 hover:border-indigo-500/20 transition-all ${!agente.ativo ? 'opacity-50' : ''}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="text-sm font-black tjpr-text-main tracking-tight">{agente.nome}</h3>
                                            {isOrquestrador ? (
                                                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Orquestrador</span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">Subagente</span>
                                            )}
                                            {!agente.ativo && (
                                                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-slate-500/10 text-slate-400 border border-slate-500/20">Inativo</span>
                                            )}
                                        </div>
                                        {agente.descricao && (
                                            <p className="text-xs tjpr-text-dim mt-1 line-clamp-1">{agente.descricao}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-[10px] tjpr-text-dim flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-rounded text-xs">model_training</span>
                                                {getModeloNome(agente.modelo_ia)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-rounded text-xs">thermostat</span>
                                                {agente.temperatura?.toFixed(1) || '0.3'}
                                            </span>
                                            {agente.agente_pai_id && (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-rounded text-xs">account_tree</span>
                                                    Pai: {getAgenteNome(agente.agente_pai_id)}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-rounded text-xs">format_list_numbered</span>
                                                Ordem: {agente.ordem ?? 0}
                                            </span>
                                            {filhos > 0 && (
                                                <span className="flex items-center gap-1 text-violet-400">
                                                    <span className="material-symbols-rounded text-xs">layers</span>
                                                    {filhos} filho(s)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                            onClick={() => openTest(agente)}
                                            className="p-2 text-slate-500 hover:text-emerald-400 transition-all rounded-lg hover:bg-emerald-400/10"
                                            title="Testar Agente"
                                        >
                                            <span className="material-symbols-rounded text-lg">play_arrow</span>
                                        </button>
                                        <button
                                            onClick={() => openEdit(agente)}
                                            className="p-2 text-slate-500 hover:text-indigo-400 transition-all rounded-lg hover:bg-indigo-400/10"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-rounded text-lg">edit</span>
                                        </button>
                                        <button
                                            onClick={() => openDelete(agente)}
                                            className="p-2 text-slate-500 hover:text-rose-400 transition-all rounded-lg hover:bg-rose-400/10"
                                            title="Excluir"
                                        >
                                            <span className="material-symbols-rounded text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Criar/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto" onClick={() => !saving && setShowModal(false)}>
                    <div className="w-full max-w-3xl tjpr-card p-8 mt-8 mb-8 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black tjpr-text-main tracking-tight">{editingId ? 'Editar Agente' : 'Novo Agente'}</h3>
                            <button onClick={() => setShowModal(false)} disabled={saving} className="p-2 tjpr-text-dim hover:tjpr-text-main rounded-lg hover:tjpr-bg-alt transition-all">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold tjpr-text-dim uppercase tracking-wider mb-2">Nome *</label>
                                    <input
                                        type="text"
                                        value={formNome}
                                        onChange={e => setFormNome(e.target.value)}
                                        placeholder="Ex: Analisador de Documentos"
                                        className="w-full px-4 py-3 tjpr-bg-alt border border-white/10 rounded-xl text-sm tjpr-text-main placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold tjpr-text-dim uppercase tracking-wider mb-2">Modelo de IA</label>
                                    <select
                                        value={formModelo}
                                        onChange={e => setFormModelo(e.target.value)}
                                        className="w-full px-4 py-3 tjpr-bg-alt border border-white/10 rounded-xl text-sm tjpr-text-main focus:border-indigo-500 outline-none"
                                    >
                                        {MODELOS_IA.map(m => (
                                            <option key={m.id} value={m.id}>{m.nome}{m.recomendado ? ' (Recomendado)' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold tjpr-text-dim uppercase tracking-wider mb-2">Descrição</label>
                                <input
                                    type="text"
                                    value={formDescricao}
                                    onChange={e => setFormDescricao(e.target.value)}
                                    placeholder="Ex: Extrai metadados do processo: número, classe, partes"
                                    className="w-full px-4 py-3 tjpr-bg-alt border border-white/10 rounded-xl text-sm tjpr-text-main placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold tjpr-text-dim uppercase tracking-wider mb-2">Prompt *</label>
                                <textarea
                                    value={formPrompt}
                                    onChange={e => setFormPrompt(e.target.value)}
                                    rows={10}
                                    placeholder="Instruções detalhadas para o agente..."
                                    className="w-full px-4 py-3 tjpr-bg-alt border border-white/10 rounded-xl text-sm tjpr-text-main placeholder:text-slate-500 focus:border-indigo-500 outline-none font-mono resize-y"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold tjpr-text-dim uppercase tracking-wider mb-2">Conhecimento Anexado</label>
                                <textarea
                                    value={formConhecimento}
                                    onChange={e => setFormConhecimento(e.target.value)}
                                    rows={4}
                                    placeholder="Texto, regras, ou referências que o agente deve usar como base..."
                                    className="w-full px-4 py-3 tjpr-bg-alt border border-white/10 rounded-xl text-sm tjpr-text-main placeholder:text-slate-500 focus:border-indigo-500 outline-none font-mono resize-y"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-xs font-bold tjpr-text-dim uppercase tracking-wider mb-2">Temperatura (0-1)</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={formTemperatura}
                                            onChange={e => setFormTemperatura(parseFloat(e.target.value))}
                                            className="flex-1 accent-indigo-500"
                                        />
                                        <span className="text-sm font-bold tjpr-text-main w-8 text-right">{formTemperatura.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold tjpr-text-dim uppercase tracking-wider mb-2">Ordem</label>
                                    <input
                                        type="number"
                                        value={formOrdem}
                                        onChange={e => setFormOrdem(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 tjpr-bg-alt border border-white/10 rounded-xl text-sm tjpr-text-main focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold tjpr-text-dim uppercase tracking-wider mb-2">Ativo</label>
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            onClick={() => setFormAtivo(!formAtivo)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${formAtivo ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                        >
                                            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow ${formAtivo ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                                        </button>
                                        <span className="text-sm tjpr-text-dim">{formAtivo ? 'Ativo' : 'Inativo'}</span>
                                    </div>
                                </div>
                            </div>

                            {editingId && (
                                <div>
                                    <label className="block text-xs font-bold tjpr-text-dim uppercase tracking-wider mb-2">Agente Pai (Orquestrador)</label>
                                    <select
                                        value={formAgentePai}
                                        onChange={e => setFormAgentePai(e.target.value)}
                                        className="w-full px-4 py-3 tjpr-bg-alt border border-white/10 rounded-xl text-sm tjpr-text-main focus:border-indigo-500 outline-none"
                                    >
                                        <option value="">Nenhum (é Orquestrador)</option>
                                        {agentesPai.filter(a => a.id !== editingId).map(a => (
                                            <option key={a.id} value={a.id}>{a.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {!editingId && agentesPai.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold tjpr-text-dim uppercase tracking-wider mb-2">Agente Pai (Opcional)</label>
                                    <select
                                        value={formAgentePai}
                                        onChange={e => setFormAgentePai(e.target.value)}
                                        className="w-full px-4 py-3 tjpr-bg-alt border border-white/10 rounded-xl text-sm tjpr-text-main focus:border-indigo-500 outline-none"
                                    >
                                        <option value="">Nenhum (é Orquestrador)</option>
                                        {agentesPai.map(a => (
                                            <option key={a.id} value={a.id}>{a.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={saving}
                                className="px-6 py-3 tjpr-bg-alt tjpr-text-dim hover:tjpr-text-main border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving && <span className="animate-spin material-symbols-rounded text-sm">sync</span>}
                                {saving ? 'Salvando...' : (editingId ? 'Atualizar' : 'Criar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Delete */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => !saving && setShowDeleteConfirm(false)}>
                    <div className="w-full max-w-md tjpr-card p-8 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-rounded text-2xl">warning</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black tjpr-text-main">Excluir Agente</h3>
                                <p className="text-sm tjpr-text-dim mt-1">Esta ação não pode ser desfeita.</p>
                            </div>
                        </div>
                        <p className="text-sm tjpr-text-main mb-2">
                            Tem certeza que deseja excluir <strong className="text-rose-400">{agentes.find(a => a.id === deletingId)?.nome}</strong>?
                        </p>
                        {deleteHasChildren && (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                                <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                                    <span className="material-symbols-rounded text-lg">info</span>
                                    Este agente possui {getFilhosCount(deletingId)} subagente(s). Eles serão movidos para o nível raiz (sem pai).
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={saving}
                                className="px-5 py-2.5 tjpr-bg-alt tjpr-text-dim hover:tjpr-text-main border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                                {saving && <span className="animate-spin material-symbols-rounded text-sm">sync</span>}
                                {saving ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Testar Agente */}
            {testModal && testingAgent && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto" onClick={() => setTestModal(false)}>
                    <div className="w-full max-w-2xl tjpr-card p-6 mt-8 mb-8 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-violet-500/10 text-violet-400 rounded-xl flex items-center justify-center border border-violet-500/20">
                                    <span className="material-symbols-rounded">smart_toy</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-black tjpr-text-main">Testar: {testingAgent.nome}</h3>
                                    <p className="text-[10px] tjpr-text-dim tracking-wider">{getModeloNome(testingAgent.modelo_ia)} • Temp: {testingAgent.temperatura?.toFixed(1)}</p>
                                </div>
                            </div>
                            <button onClick={() => setTestModal(false)} className="p-2 tjpr-text-dim hover:tjpr-text-main rounded-lg hover:tjpr-bg-alt transition-all">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>

                        <div ref={testRef} className="h-80 overflow-y-auto p-4 tjpr-bg-alt rounded-xl border border-white/10 space-y-3 mb-4 custom-scrollbar">
                            {testMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                                        msg.role === 'user'
                                            ? 'bg-indigo-600 text-white'
                                            : msg.role === 'system'
                                                ? 'bg-slate-600/30 text-slate-300 border border-white/5'
                                                : 'bg-slate-700/50 tjpr-text-main border border-white/5'
                                    }`}>
                                        <pre className="whitespace-pre-wrap font-sans text-xs">{msg.content}</pre>
                                    </div>
                                </div>
                            ))}
                            {testRunning && (
                                <div className="flex justify-start">
                                    <div className="p-3 rounded-xl bg-slate-700/50 border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                                            <span className="text-xs tjpr-text-dim">Pensando...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={testInput}
                                onChange={e => setTestInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && runTest()}
                                placeholder="Digite uma mensagem para testar o agente..."
                                disabled={testRunning}
                                className="flex-1 px-4 py-3 tjpr-bg-alt border border-white/10 rounded-xl text-sm tjpr-text-main placeholder:text-slate-500 focus:border-indigo-500 outline-none"
                            />
                            <button
                                onClick={runTest}
                                disabled={!testInput.trim() || testRunning}
                                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 active:scale-95"
                            >
                                <span className="material-symbols-rounded text-lg">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.AgentStudioAdminPage = AgentStudioAdminPage;
