// HistoricoTriagensPage.js — Módulo de Histórico e Gestão de Triagens TJPR
// Exibe todas as triagens salvas, permite edição com rastreamento de autoria.

const HistoricoTriagensPage = () => {
    const { userData } = useAuth ? useAuth() : {};

    const [triagens, setTriagens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [triagemSelecionada, setTriagemSelecionada] = useState(null);
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [camposEditando, setCamposEditando] = useState({});
    const [notasOperador, setNotasOperador] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
    const [abaAtiva, setAbaAtiva] = useState('campos');
    const [showMobileDetalhe, setShowMobileDetalhe] = useState(false);

    useEffect(() => {
        carregarTriagens();
    }, []);

    const carregarTriagens = async () => {
        setLoading(true);
        setErro(null);
        try {
            const sb = window._supabaseClient;
            if (!sb) throw new Error('Supabase não inicializado');
            const { data, error } = await sb
                .from('analises_triagem')
                .select('id, created_at, document_names, modelo_ia, status, criado_por_nome, editado_por_nome, editado_em, notas_operador, historico_edicoes, resultado_final')
                .order('created_at', { ascending: false })
                .limit(200);
            if (error) throw error;
            setTriagens(data || []);
        } catch (err) {
            console.error('[HistoricoTriagens] Erro ao carregar:', err);
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    const abrirDetalhe = async (triagem) => {
        setLoadingDetalhe(true);
        setTriagemSelecionada(null);
        setModoEdicao(false);
        setCamposEditando({});
        setAbaAtiva('campos');
        setShowMobileDetalhe(true);
        try {
            const sb = window._supabaseClient;
            const { data, error } = await sb
                .from('analises_triagem')
                .select('*')
                .eq('id', triagem.id)
                .single();
            if (error) throw error;
            setTriagemSelecionada(data);
            setNotasOperador(data.notas_operador || '');
        } catch (err) {
            console.error('[HistoricoTriagens] Erro ao abrir detalhe:', err);
        } finally {
            setLoadingDetalhe(false);
        }
    };

    const salvarEdicoes = async () => {
        if (!triagemSelecionada) return;
        setSalvando(true);
        try {
            const sb = window._supabaseClient;
            const session = (await sb.auth.getSession()).data?.session;
            const userId = session?.user?.id;
            const userName = userData?.display_name || userData?.name || session?.user?.email || 'Usuário';

            const resultadoAtual = triagemSelecionada.resultado_final || {};
            const camposAtuais = resultadoAtual.campos_consolidados || [];

            // Detectar mudanças
            const camposAlterados = {};
            Object.entries(camposEditando).forEach(([campo, novoValor]) => {
                const campoAtual = camposAtuais.find(c => c.campo === campo);
                const valorAnterior = campoAtual?.informacao || '';
                if (valorAnterior !== novoValor) {
                    camposAlterados[campo] = { de: valorAnterior, para: novoValor };
                }
            });
            const notasAlteradas = notasOperador !== (triagemSelecionada.notas_operador || '');
            if (notasAlteradas) {
                camposAlterados['notas_operador'] = {
                    de: triagemSelecionada.notas_operador || '',
                    para: notasOperador
                };
            }
            if (Object.keys(camposAlterados).length === 0) {
                setModoEdicao(false);
                return;
            }

            // Atualizar campos no resultado
            const novosCampos = camposAtuais.map(c =>
                camposEditando[c.campo] !== undefined
                    ? { ...c, informacao: camposEditando[c.campo] }
                    : c
            );
            const novoResultado = {
                ...resultadoAtual,
                campos_consolidados: novosCampos,
                camposMap: Object.fromEntries(novosCampos.map(c => [c.campo, c.informacao]))
            };

            // Entrada no histórico de edições
            const historicoAtual = Array.isArray(triagemSelecionada.historico_edicoes)
                ? triagemSelecionada.historico_edicoes
                : [];
            const novaEntrada = {
                usuario_id: userId,
                usuario_nome: userName,
                data_hora: new Date().toISOString(),
                tipo: 'edicao',
                campos_alterados: camposAlterados
            };

            const { error } = await sb
                .from('analises_triagem')
                .update({
                    resultado_final: novoResultado,
                    notas_operador: notasOperador,
                    editado_por: userId,
                    editado_por_nome: userName,
                    editado_em: new Date().toISOString(),
                    historico_edicoes: [...historicoAtual, novaEntrada]
                })
                .eq('id', triagemSelecionada.id);
            if (error) throw error;

            await abrirDetalhe({ id: triagemSelecionada.id });
            await carregarTriagens();
            setModoEdicao(false);
            setCamposEditando({});
            const evt = new CustomEvent('showToast', { detail: { texto: 'Triagem atualizada com sucesso!', tipo: 'success' } });
            document.dispatchEvent(evt);
        } catch (err) {
            console.error('[HistoricoTriagens] Erro ao salvar edições:', err);
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setSalvando(false);
        }
    };

    const formatarData = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getCamara = (t) =>
        t?.resultado_final?.campos_consolidados?.find(c => c.campo === 'Câmara')?.informacao || '—';

    const getTipoRecurso = (t) =>
        t?.resultado_final?.campos_consolidados?.find(c => c.campo === 'Tipo do Recurso')?.informacao || '—';

    const getNomeArquivos = (t) =>
        Array.isArray(t.document_names) ? t.document_names.join(', ') : (t.document_names || '—');

    const getNumEdicoes = (t) =>
        Array.isArray(t.historico_edicoes)
            ? t.historico_edicoes.filter(h => h.tipo === 'edicao').length
            : 0;

    // Filtragem reativa
    const triagensFiltradas = (() => {
        let result = [...triagens];
        if (filtroTexto) {
            const t = filtroTexto.toLowerCase();
            result = result.filter(tr =>
                getNomeArquivos(tr).toLowerCase().includes(t) ||
                getCamara(tr).toLowerCase().includes(t) ||
                (tr.criado_por_nome || '').toLowerCase().includes(t) ||
                (tr.notas_operador || '').toLowerCase().includes(t)
            );
        }
        if (filtroPeriodo !== 'todos') {
            const dias = { '7dias': 7, '30dias': 30, '90dias': 90 }[filtroPeriodo] || 9999;
            const corte = new Date(Date.now() - dias * 86400000);
            result = result.filter(tr => new Date(tr.created_at) >= corte);
        }
        return result;
    })();

    const camposConsolidados = triagemSelecionada?.resultado_final?.campos_consolidados || [];

    const eventoAuditoria = (() => {
        if (!triagemSelecionada) return [];
        const hist = Array.isArray(triagemSelecionada.historico_edicoes)
            ? [...triagemSelecionada.historico_edicoes]
            : [];
        const criacao = {
            usuario_nome: triagemSelecionada.criado_por_nome || 'Desconhecido',
            data_hora: triagemSelecionada.created_at,
            tipo: 'criacao',
            campos_alterados: {}
        };
        return [criacao, ...hist].reverse(); // mais recente primeiro
    })();

    return (
        <div className="min-h-full">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* ── Header ── */}
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <span className="material-symbols-rounded text-3xl">manage_search</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tjpr-text-main tracking-tight uppercase">Histórico de Triagens</h1>
                            <p className="tjpr-text-dim text-xs font-bold tracking-widest uppercase mt-1">
                                {loading ? 'Carregando...' : `${triagens.length} triagem(ns) registrada(s)`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={carregarTriagens}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 tjpr-text-dim border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95"
                    >
                        <span className={`material-symbols-rounded text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
                        Atualizar
                    </button>
                </div>

                {/* ── SQL Alert ── */}
                {erro && erro.includes('column') && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                        <span className="material-symbols-rounded text-amber-400 text-xl flex-shrink-0 mt-0.5">construction</span>
                        <div>
                            <p className="text-xs font-black text-amber-400 uppercase tracking-wider">Migração do banco necessária</p>
                            <p className="text-[10px] tjpr-text-dim mt-1">
                                Execute o SQL de migração no Supabase para adicionar as colunas de auditoria. Consulte o plano de implementação.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Layout Principal: Lista + Detalhe ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

                    {/* ── Painel Esquerdo — Lista ── */}
                    <div className={`lg:col-span-2 space-y-4 ${showMobileDetalhe ? 'hidden lg:block' : 'block'}`}>

                        {/* Filtros */}
                        <div className="tjpr-card p-4 space-y-3">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-500 text-sm">search</span>
                                <input
                                    type="text"
                                    value={filtroTexto}
                                    onChange={e => setFiltroTexto(e.target.value)}
                                    placeholder="Câmara, arquivo, operador, notas..."
                                    className="w-full pl-9 pr-4 py-2.5 tjpr-bg-alt border border-white/10 rounded-xl text-xs tjpr-text-main placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-colors"
                                />
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {[
                                    { id: 'todos', label: 'Todos' },
                                    { id: '7dias', label: '7 dias' },
                                    { id: '30dias', label: '30 dias' },
                                    { id: '90dias', label: '90 dias' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFiltroPeriodo(f.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                            filtroPeriodo === f.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white/5 tjpr-text-dim hover:bg-white/10'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="space-y-2">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                                ))
                            ) : erro ? (
                                <div className="p-6 text-center tjpr-card border border-rose-500/20 rounded-2xl">
                                    <span className="material-symbols-rounded text-rose-400 text-3xl block mb-2">error</span>
                                    <p className="text-xs text-rose-400 font-bold">{erro}</p>
                                </div>
                            ) : triagensFiltradas.length === 0 ? (
                                <div className="p-12 text-center tjpr-card rounded-2xl">
                                    <span className="material-symbols-rounded text-5xl text-slate-700 block mb-3">inbox</span>
                                    <p className="text-sm tjpr-text-dim font-semibold">Nenhuma triagem encontrada</p>
                                    <p className="text-xs tjpr-text-dim mt-1">Analise e salve triagens na tela de Análise de Triagem</p>
                                </div>
                            ) : (
                                triagensFiltradas.map((triagem) => {
                                    const camara = getCamara(triagem);
                                    const tipoRecurso = getTipoRecurso(triagem);
                                    const nomes = getNomeArquivos(triagem);
                                    const numEdicoes = getNumEdicoes(triagem);
                                    const isSelected = triagemSelecionada?.id === triagem.id;
                                    const isSalvo = triagem.status === 'salvo';

                                    return (
                                        <button
                                            key={triagem.id}
                                            onClick={() => abrirDetalhe(triagem)}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                                                isSelected
                                                    ? 'border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
                                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${
                                                    isSelected
                                                        ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                                                        : 'bg-white/5 border-white/10 tjpr-text-dim'
                                                }`}>
                                                    <span className="material-symbols-rounded text-base">description</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className={`text-xs font-black truncate ${
                                                            camara === '—' || camara === 'Não encontrado ou não informado'
                                                                ? 'tjpr-text-dim italic'
                                                                : 'text-rose-400'
                                                        }`}>
                                                            {camara === '—' || camara === 'Não encontrado ou não informado'
                                                                ? 'Câmara não identificada'
                                                                : camara}
                                                        </span>
                                                        {tipoRecurso !== '—' && tipoRecurso !== 'Não encontrado ou não informado' && (
                                                            <span className="px-1.5 py-0.5 bg-indigo-500/15 text-indigo-400 text-[8px] font-black uppercase rounded border border-indigo-500/20 flex-shrink-0 truncate max-w-[80px]">
                                                                {tipoRecurso}
                                                            </span>
                                                        )}
                                                        {!isSalvo && (
                                                            <span className="px-1.5 py-0.5 bg-slate-700/60 text-slate-400 text-[8px] font-black uppercase rounded border border-white/10 flex-shrink-0">
                                                                Rascunho
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] tjpr-text-dim truncate">{nomes}</p>
                                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                        <span className="text-[9px] tjpr-text-dim flex items-center gap-0.5">
                                                            <span className="material-symbols-rounded text-[10px]">schedule</span>
                                                            {formatarData(triagem.created_at)}
                                                        </span>
                                                        {triagem.criado_por_nome && (
                                                            <span className="text-[9px] tjpr-text-dim flex items-center gap-0.5">
                                                                <span className="material-symbols-rounded text-[10px]">person</span>
                                                                {triagem.criado_por_nome}
                                                            </span>
                                                        )}
                                                        {numEdicoes > 0 && (
                                                            <span className="text-[9px] text-amber-400 flex items-center gap-0.5">
                                                                <span className="material-symbols-rounded text-[10px]">edit</span>
                                                                {numEdicoes} edição(ões)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <span className="material-symbols-rounded text-indigo-400 text-base flex-shrink-0 mt-1">chevron_right</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── Painel Direito — Detalhe ── */}
                    <div className={`lg:col-span-3 ${showMobileDetalhe ? 'block' : 'hidden lg:block'}`}>

                        {!triagemSelecionada && !loadingDetalhe ? (
                            <div className="tjpr-card p-16 flex flex-col items-center justify-center text-center rounded-3xl border border-white/5 min-h-[400px]">
                                <span className="material-symbols-rounded text-6xl text-slate-700 mb-4">touch_app</span>
                                <p className="text-sm tjpr-text-dim font-bold">Selecione uma triagem para ver os detalhes</p>
                                <p className="text-xs tjpr-text-dim mt-1 max-w-xs">Clique em qualquer registro na lista à esquerda para visualizar os campos, notas e histórico de edições</p>
                            </div>
                        ) : loadingDetalhe ? (
                            <div className="tjpr-card p-16 flex flex-col items-center justify-center min-h-[400px] rounded-3xl">
                                <div className="animate-spin w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
                                <p className="text-sm tjpr-text-dim">Carregando detalhes...</p>
                            </div>
                        ) : triagemSelecionada ? (
                            <div className="space-y-4">

                                {/* Header do Detalhe */}
                                <div className="tjpr-card p-5 rounded-2xl border border-white/5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={() => { setShowMobileDetalhe(false); setTriagemSelecionada(null); }}
                                                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all flex-shrink-0"
                                            >
                                                <span className="material-symbols-rounded">arrow_back</span>
                                            </button>
                                            <div>
                                                <h2 className="text-base font-black">
                                                    {getCamara(triagemSelecionada) === '—' || getCamara(triagemSelecionada) === 'Não encontrado ou não informado'
                                                        ? <span className="tjpr-text-dim italic text-sm">Câmara não identificada</span>
                                                        : <span className="text-rose-400">{getCamara(triagemSelecionada)}</span>
                                                    }
                                                </h2>
                                                <p className="text-[10px] tjpr-text-dim mt-0.5 max-w-sm truncate">
                                                    {getNomeArquivos(triagemSelecionada)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {modoEdicao ? (
                                                <>
                                                    <button
                                                        onClick={() => { setModoEdicao(false); setCamposEditando({}); setNotasOperador(triagemSelecionada.notas_operador || ''); }}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 tjpr-text-dim border border-white/10 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95"
                                                    >
                                                        <span className="material-symbols-rounded text-sm">close</span>
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={salvarEdicoes}
                                                        disabled={salvando}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-emerald-600/10"
                                                    >
                                                        <span className="material-symbols-rounded text-sm">
                                                            {salvando ? 'hourglass_empty' : 'save'}
                                                        </span>
                                                        {salvando ? 'Salvando...' : 'Salvar'}
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setModoEdicao(true)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-600/20 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95"
                                                >
                                                    <span className="material-symbols-rounded text-sm">edit</span>
                                                    Editar
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Meta informações de autoria */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
                                        <div>
                                            <p className="text-[9px] font-black tjpr-text-dim uppercase tracking-wider mb-0.5">Criado em</p>
                                            <p className="text-[10px] tjpr-text-main font-bold">{formatarData(triagemSelecionada.created_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black tjpr-text-dim uppercase tracking-wider mb-0.5">Criado por</p>
                                            <p className="text-[10px] tjpr-text-main font-bold">{triagemSelecionada.criado_por_nome || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black tjpr-text-dim uppercase tracking-wider mb-0.5">Última edição</p>
                                            <p className="text-[10px] tjpr-text-main font-bold">
                                                {triagemSelecionada.editado_em ? formatarData(triagemSelecionada.editado_em) : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black tjpr-text-dim uppercase tracking-wider mb-0.5">Editado por</p>
                                            <p className="text-[10px] tjpr-text-main font-bold">{triagemSelecionada.editado_por_nome || '—'}</p>
                                        </div>
                                    </div>

                                    {modoEdicao && (
                                        <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse flex-shrink-0"></span>
                                            <p className="text-[10px] text-amber-400 font-black uppercase tracking-wider">
                                                Modo de Edição — Todas as alterações serão registradas com seu nome e hora
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Abas de Conteúdo */}
                                <div className="flex gap-1 p-1 bg-black/30 rounded-2xl border border-white/5">
                                    {[
                                        { id: 'campos', label: 'Campos TRIARIO', icon: 'list_alt' },
                                        { id: 'notas', label: 'Notas', icon: 'sticky_note_2' },
                                        { id: 'auditoria', label: 'Auditoria', icon: 'history' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setAbaAtiva(tab.id)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                                abaAtiva === tab.id
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                                    : 'tjpr-text-dim hover:tjpr-text-main hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="material-symbols-rounded text-sm">{tab.icon}</span>
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Conteúdo das Abas */}
                                <div className="tjpr-card p-5 rounded-2xl border border-white/5">

                                    {/* ABA: Campos TRIARIO */}
                                    {abaAtiva === 'campos' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xs font-black tjpr-text-dim uppercase tracking-wider">
                                                    {camposConsolidados.length} campos extraídos
                                                </h3>
                                                {modoEdicao && Object.keys(camposEditando).length > 0 && (
                                                    <span className="text-[9px] text-amber-400 flex items-center gap-1 font-black">
                                                        <span className="material-symbols-rounded text-[10px]">edit</span>
                                                        {Object.keys(camposEditando).length} campo(s) alterado(s)
                                                    </span>
                                                )}
                                            </div>
                                            {camposConsolidados.length === 0 ? (
                                                <div className="text-center py-10">
                                                    <span className="material-symbols-rounded text-4xl text-slate-700 block mb-2">data_object</span>
                                                    <p className="text-sm tjpr-text-dim">Campos não disponíveis</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    {camposConsolidados.map((campo, idx) => {
                                                        const isAusente = !campo.informacao
                                                            || campo.informacao === 'Não encontrado ou não informado'
                                                            || campo.informacao === 'Não informado';
                                                        const valorAtual = camposEditando[campo.campo] !== undefined
                                                            ? camposEditando[campo.campo]
                                                            : campo.informacao;
                                                        const foiEditado = camposEditando[campo.campo] !== undefined
                                                            && camposEditando[campo.campo] !== campo.informacao;

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                                                                    foiEditado
                                                                        ? 'border-amber-500/30 bg-amber-500/5'
                                                                        : isAusente
                                                                            ? 'border-rose-500/10 bg-rose-500/[0.03]'
                                                                            : 'border-white/5 bg-black/20'
                                                                }`}
                                                            >
                                                                <span className="text-[10px] font-black text-slate-600 w-5 text-right flex-shrink-0 mt-0.5 font-mono">
                                                                    {campo.etapa}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[9px] font-black tjpr-text-dim uppercase tracking-wider">{campo.campo}</p>
                                                                    {modoEdicao ? (
                                                                        <input
                                                                            type="text"
                                                                            value={valorAtual || ''}
                                                                            onChange={e => setCamposEditando(prev => ({ ...prev, [campo.campo]: e.target.value }))}
                                                                            className="w-full mt-1 px-2.5 py-1.5 bg-black/40 border border-white/10 focus:border-indigo-500 rounded-lg text-xs tjpr-text-main outline-none transition-colors"
                                                                        />
                                                                    ) : (
                                                                        <p className={`text-xs font-bold mt-0.5 ${isAusente ? 'text-rose-400/60 italic' : 'tjpr-text-main'}`}>
                                                                            {isAusente ? 'Não encontrado ou não informado' : campo.informacao}
                                                                        </p>
                                                                    )}
                                                                    {campo.movimento && campo.movimento !== '-' && campo.movimento !== 'Não informado' && campo.movimento !== 'Atualizado via Copilot' && (
                                                                        <p className="text-[8px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                                                                            <span className="material-symbols-rounded text-[9px]">description</span>
                                                                            {campo.movimento}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {foiEditado && (
                                                                    <span className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-1.5"></span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ABA: Notas */}
                                    {abaAtiva === 'notas' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black tjpr-text-dim uppercase tracking-wider flex items-center gap-2">
                                                    <span className="material-symbols-rounded text-amber-400 text-base">sticky_note_2</span>
                                                    Notas do Operador
                                                </h3>
                                                {!modoEdicao && (
                                                    <button
                                                        onClick={() => setModoEdicao(true)}
                                                        className="text-[9px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                                                    >
                                                        <span className="material-symbols-rounded text-[11px]">edit</span>
                                                        Editar notas
                                                    </button>
                                                )}
                                            </div>
                                            {modoEdicao ? (
                                                <textarea
                                                    value={notasOperador}
                                                    onChange={e => setNotasOperador(e.target.value)}
                                                    rows={12}
                                                    placeholder="Adicione observações, retornos do processo, pendências ou qualquer informação relevante sobre esta triagem..."
                                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 focus:border-indigo-500 rounded-2xl text-xs tjpr-text-main outline-none resize-none transition-colors font-medium leading-relaxed"
                                                />
                                            ) : (
                                                <div className="min-h-[200px] px-4 py-3 bg-black/20 border border-white/5 rounded-2xl">
                                                    {notasOperador ? (
                                                        <p className="text-xs tjpr-text-main whitespace-pre-wrap leading-relaxed font-medium">{notasOperador}</p>
                                                    ) : (
                                                        <p className="text-xs tjpr-text-dim italic">Nenhuma nota registrada. Clique em "Editar" ou no botão acima para adicionar observações.</p>
                                                    )}
                                                </div>
                                            )}
                                            <p className="text-[10px] tjpr-text-dim flex items-center gap-1.5">
                                                <span className="material-symbols-rounded text-[11px] text-indigo-400">tips_and_updates</span>
                                                Use este campo para registrar retornos do processo, decisões pós-triagem, pendências e observações da equipe. Cada edição é registrada na trilha de auditoria.
                                            </p>
                                        </div>
                                    )}

                                    {/* ABA: Auditoria */}
                                    {abaAtiva === 'auditoria' && (
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black tjpr-text-dim uppercase tracking-wider flex items-center gap-2">
                                                <span className="material-symbols-rounded text-indigo-400 text-base">history</span>
                                                Timeline de Auditoria — {eventoAuditoria.length} evento(s)
                                            </h3>
                                            {eventoAuditoria.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <span className="material-symbols-rounded text-4xl text-slate-700 block mb-2">timeline</span>
                                                    <p className="text-sm tjpr-text-dim">Nenhum evento registrado</p>
                                                    <p className="text-xs tjpr-text-dim mt-1">O histórico será registrado a partir das próximas edições</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {eventoAuditoria.map((evento, idx) => {
                                                        const nCampos = Object.keys(evento.campos_alterados || {}).length;
                                                        const isCriacao = evento.tipo === 'criacao';
                                                        const isLast = idx === eventoAuditoria.length - 1;

                                                        return (
                                                            <div key={idx} className="flex gap-3">
                                                                {/* Timeline connector */}
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 ${
                                                                        isCriacao
                                                                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                                                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                                                    }`}>
                                                                        <span className="material-symbols-rounded text-sm">
                                                                            {isCriacao ? 'add_circle' : 'edit'}
                                                                        </span>
                                                                    </div>
                                                                    {!isLast && (
                                                                        <div className="w-px flex-1 bg-white/5 mt-1 min-h-[24px]"></div>
                                                                    )}
                                                                </div>

                                                                {/* Conteúdo do evento */}
                                                                <div className={`flex-1 ${!isLast ? 'pb-4' : ''}`}>
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="text-xs font-black tjpr-text-main">{evento.usuario_nome}</span>
                                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                                                            isCriacao
                                                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                                                : 'bg-amber-500/15 text-amber-400'
                                                                        }`}>
                                                                            {isCriacao ? 'Criou a triagem' : `Editou ${nCampos} campo(s)`}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[9px] tjpr-text-dim mt-0.5 flex items-center gap-1">
                                                                        <span className="material-symbols-rounded text-[10px]">schedule</span>
                                                                        {formatarData(evento.data_hora)}
                                                                    </p>

                                                                    {/* Campos alterados */}
                                                                    {nCampos > 0 && (
                                                                        <div className="mt-2 space-y-1.5">
                                                                            {Object.entries(evento.campos_alterados).map(([campo, alteracao], cIdx) => (
                                                                                <div key={cIdx} className="text-[9px] bg-black/30 rounded-xl p-2.5 border border-white/5">
                                                                                    <p className="font-black text-slate-400 uppercase tracking-wider mb-1.5">{campo}</p>
                                                                                    <div className="space-y-1">
                                                                                        <div className="flex items-start gap-2">
                                                                                            <span className="text-[8px] font-black text-rose-400/70 uppercase tracking-wider w-8 flex-shrink-0 mt-0.5">Antes</span>
                                                                                            <span className="text-rose-400 line-through break-all flex-1 leading-relaxed">
                                                                                                {alteracao.de || <em className="not-italic text-slate-600">vazio</em>}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex items-start gap-2">
                                                                                            <span className="text-[8px] font-black text-emerald-400/70 uppercase tracking-wider w-8 flex-shrink-0 mt-0.5">Após</span>
                                                                                            <span className="text-emerald-400 break-all flex-1 leading-relaxed">{alteracao.para}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

window.HistoricoTriagensPage = HistoricoTriagensPage;
