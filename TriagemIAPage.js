const PROMPT_MONOLITICO = `Você é o Agente Revisor e Triador Central do Tribunal de Justiça do Paraná (TJPR).
Sua tarefa é analisar o texto extraído por OCR de um processo de segundo grau (recursos para tribunais superiores) e fazer a triagem completa preenchendo as 18 etapas da metodologia TRIARIO.

Analise com muito cuidado e critério o texto do processo e retorne APENAS um JSON estruturado (sem formatação markdown, sem \`\`\`json na resposta, apenas o texto do JSON puro) contendo as informações das etapas abaixo:

Etapas do TRIARIO a preencher na chave "campos_consolidados":
1. Tipo do Recurso: Identifique se é Recurso Especial, Recurso Extraordinário, Agravo em Recurso Especial, Agravo em Recurso Extraordinário, etc.
2. Acordo: Verifique se houve proposta ou homologação de acordo recente entre as partes. Se sim, informe se foi homologado e o número do movimento.
3. Desistência: Verifique se houve pedido de desistência do recurso por parte do recorrente.
4. Sigla: Identifique a sigla da classe processual (ex: REsp, RE, AREsp, ARE, etc.).
5. Interposição: Identifique a data exata de interposição do recurso.
6. Decisão Recorrida: Identifique se a decisão recorrida é acórdão ou decisão monocrática e o número do movimento Projudi dela.
7. Câmara: Identifique o órgão julgador que proferiu a decisão recorrida (ex: 1ª Câmara Cível, etc.).
8. Prazo em Aberto: Identifique se há prazo em aberto para interposição ou resposta e qual é o evento gerador.
9. Envio da Intimação: Data do envio/registro da intimação da decisão recorrida (Projudi).
10. Consulta Eletrônica: Data da consulta eletrônica da intimação ou data do decurso do prazo dela.
11. Prazo: Quantidade de dias úteis do prazo (normalmente 15 dias úteis, ou em dobro para fazenda pública/defensoria).
12. Multa: Verifique se há aplicação de multa processual pendente de recolhimento (especialmente multa dos embargos de declaração protelatórios, art. 1026, §2º do CPC).
13. Justiça Gratuita: Verifique se o recorrente é beneficiário da justiça gratuita ou se recolheu as custas/preparo.
14. Subscritor: Identifique o nome do advogado ou procurador que assina a petição recursal e se há procuração/substabelecimento nos autos.
15. Efeito Suspensivo: Verifique se houve pedido de efeito suspensivo e qual a sua situação.
16. Exclusividade Intimação: Verifique se há pedido expresso de intimação exclusiva em nome de algum advogado específico.
17. Contrarrazões: Verifique se foram apresentadas contrarrazões ao recurso e por quem.
18. Intervenção MP: Verifique se há manifestação ou necessidade de intimação do Ministério Público (MPPR/Custos Legis/Promotoria).

Adicionalmente, você deve analisar e preencher na chave "vicios" qualquer vício formal crítico de admissibilidade localizado, tais como:
- Ausência de procuração ou representação processual irregular.
- Intempestividade (recurso interposto fora do prazo legal).
- Deserção (falta de recolhimento das custas de preparo sem benefício de justiça gratuita).
- Pendência de recolhimento de multa do art. 1026, § 2º do CPC.

Retorne os resultados RIGOROSAMENTE no formato JSON abaixo, sem qualquer texto explicativo antes ou depois, sem blocos markdown:
{
  "campos_consolidados": [
    { "etapa": 1, "campo": "Tipo do Recurso", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 2, "campo": "Acordo", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 3, "campo": "Desistência", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 4, "campo": "Sigla", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente or '-'" },
    { "etapa": 5, "campo": "Interposição", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 6, "campo": "Decisão Recorrida", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 7, "campo": "Câmara", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 8, "campo": "Prazo em Aberto", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 9, "campo": "Envio da Intimação", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 10, "campo": "Consulta Eletrônica", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 11, "campo": "Prazo", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 12, "campo": "Multa", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 13, "campo": "Justiça Gratuita", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 14, "campo": "Subscritor", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 15, "campo": "Efeito Suspensivo", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 16, "campo": "Exclusividade Intimação", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 17, "campo": "Contrarrazões", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" },
    { "etapa": 18, "campo": "Intervenção MP", "informacao": "Informação extraída ou 'Não encontrado ou não informado'", "movimento": "Movimento Projudi correspondente ou '-'" }
  ],
  "vicios": [
    { "tipo": "Vício Formal", "descricao": "Descrição detalhada do vício se houver" }
  ],
  "mp_resumo": { "localizado": true, "movimento": "movimento do MP", "contexto": "trecho de manifestação do MP" },
  "inconsistencias": [
    "Mensagem de inconsistência ou contradição se houver"
  ],
  "observacoes_gerais": "Resumo geral da admissibilidade do processo"
}
`;

const { useState, useCallback, useEffect, useRef } = React;

const TriagemIAPage = () => {
    const auth = typeof useAuth === 'function' ? useAuth() : {};
    const setCurrentArea = auth?.setCurrentArea;
    const [documentos, setDocumentos] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultado, setResultado] = useState(() => {
        try {
            const cached = localStorage.getItem('tjpr_triagem_resultado');
            return cached ? JSON.parse(cached) : null;
        } catch (e) { return null; }
    });
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [modeloSelecionado, setModeloSelecionado] = useState(() => {
        return localStorage.getItem('tjpr_triagem_modeloSelecionado') || 'deepseek-v4-flash-free';
    });
    const [logProcessamento, setLogProcessamento] = useState('');
    const [mostrarRespostaRaw, setMostrarRespostaRaw] = useState(false);
    const [agentesResults, setAgentesResults] = useState(null);
    const [analiseId, setAnaliseId] = useState(() => {
        return localStorage.getItem('tjpr_triagem_analiseId') || null;
    });
    const [chatMessages, setChatMessages] = useState(() => {
        try {
            const cached = localStorage.getItem('tjpr_triagem_chatMessages');
            return cached ? JSON.parse(cached) : [];
        } catch (e) { return []; }
    });
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const [conversaId, setConversaId] = useState(() => {
        return localStorage.getItem('tjpr_triagem_conversaId') || null;
    });
    const chatEndRef = useRef(null);
    const textoOcrRef = useRef(localStorage.getItem('tjpr_triagem_textoOcr') || '');
    const [modoTriagem, setModoTriagem] = useState(() => {
        return localStorage.getItem('tjpr_triagem_modoTriagem') || 'economico';
    });
    const [mostrarTextoOcr, setMostrarTextoOcr] = useState(false);
    const [textoOcrExtraido, setTextoOcrExtraido] = useState(() => {
        return localStorage.getItem('tjpr_triagem_textoOcr') || '';
    });
    const [fichaResumo, setFichaResumo] = useState(() => {
        try {
            const cached = localStorage.getItem('tjpr_triagem_fichaResumo');
            return cached ? JSON.parse(cached) : null;
        } catch (e) { return null; }
    });
    const [opencodeApiKey, setOpencodeApiKey] = useState(() => {
        return localStorage.getItem('tjpr_opencode_api_key') || '';
    });
    const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
    const [etapaSelecionada, setEtapaSelecionada] = useState(null);
    const [ocrProgresso, setOcrProgresso] = useState(null); // { pagina, total, pct, tipo }
    const [ocrScore, setOcrScore] = useState(null); // 0-100 score de confiança
    const [exportandoPdf, setExportandoPdf] = useState(false);
    const [showHistorico, setShowHistorico] = useState(false);
    const [historico, setHistorico] = useState([]);
    const [loadingHistorico, setLoadingHistorico] = useState(false);
    const fichaRef = useRef(null);
    const [camposEditados, setCamposEditados] = useState(new Set()); // rastrear campos confirmados

    useEffect(() => {
        if (opencodeApiKey) {
            localStorage.setItem('tjpr_opencode_api_key', opencodeApiKey);
        } else {
            localStorage.removeItem('tjpr_opencode_api_key');
        }
    }, [opencodeApiKey]);


    // Persistir alterações no localStorage
    useEffect(() => {
        if (resultado) {
            localStorage.setItem('tjpr_triagem_resultado', JSON.stringify(resultado));
        } else {
            localStorage.removeItem('tjpr_triagem_resultado');
        }
    }, [resultado]);

    useEffect(() => {
        if (textoOcrExtraido) {
            localStorage.setItem('tjpr_triagem_textoOcr', textoOcrExtraido);
        } else {
            localStorage.removeItem('tjpr_triagem_textoOcr');
        }
    }, [textoOcrExtraido]);

    useEffect(() => {
        if (analiseId) {
            localStorage.setItem('tjpr_triagem_analiseId', analiseId);
        } else {
            localStorage.removeItem('tjpr_triagem_analiseId');
        }
    }, [analiseId]);

    useEffect(() => {
        if (conversaId) {
            localStorage.setItem('tjpr_triagem_conversaId', conversaId);
        } else {
            localStorage.removeItem('tjpr_triagem_conversaId');
        }
    }, [conversaId]);

    useEffect(() => {
        if (chatMessages && chatMessages.length > 0) {
            localStorage.setItem('tjpr_triagem_chatMessages', JSON.stringify(chatMessages));
        } else {
            localStorage.removeItem('tjpr_triagem_chatMessages');
        }
    }, [chatMessages]);

    useEffect(() => {
        localStorage.setItem('tjpr_triagem_modeloSelecionado', modeloSelecionado);
    }, [modeloSelecionado]);

    useEffect(() => {
        localStorage.setItem('tjpr_triagem_modoTriagem', modoTriagem);
    }, [modoTriagem]);

    // Derivar e Sincronizar Ficha de Resumo
    useEffect(() => {
        if (!resultado) {
            setFichaResumo(null);
            return;
        }

        const cachedFicha = localStorage.getItem('tjpr_triagem_fichaResumo');
        if (cachedFicha) {
            try {
                setFichaResumo(JSON.parse(cachedFicha));
                return;
            } catch(e) {}
        }

        const camposMap = resultado.camposMap || {};
        const getCampoVal = (nome) => {
            const val = camposMap[nome];
            if (!val || val === 'Não informado' || val === 'Não encontrado ou não informado') {
                return 'Não encontrado ou não informado';
            }
            return val;
        };

        const camaraVal = getCampoVal('Câmara');
        const interposicaoVal = getCampoVal('Interposição');

        const contrarrazoesVal = getCampoVal('Contrarrazões');
        const mpVal = resultado.resumo?.mpLocalizado === true ? 'sim' : 'não';
        const justicaGratuitaVal = getCampoVal('Justiça Gratuita');
        const multaVal = getCampoVal('Multa');
        const procuracaoVal = getCampoVal('Subscritor');
        const exclusividadeVal = getCampoVal('Exclusividade Intimação');

        const decisaoRecorridaVal = getCampoVal('Decisão Recorrida');
        const colegiadaVal = (decisaoRecorridaVal.toLowerCase().includes('acórdão') || decisaoRecorridaVal.toLowerCase().includes('acordao') || decisaoRecorridaVal.toLowerCase().includes('colegiada')) ? 'sim' : 'não';

        const obsVal = resultado.observacoes || '//';

        setFichaResumo({
            camara: camaraVal,
            dataDecisao: interposicaoVal,
            contrarrazoes: contrarrazoesVal,
            mp: mpVal,
            gru: justicaGratuitaVal,
            funjus: multaVal,
            procuracao: procuracaoVal,
            exclusividade: exclusividadeVal,
            decisaoColegiada: colegiadaVal,
            obs: obsVal
        });
    }, [resultado]);

    useEffect(() => {
        if (fichaResumo) {
            localStorage.setItem('tjpr_triagem_fichaResumo', JSON.stringify(fichaResumo));
        } else {
            localStorage.removeItem('tjpr_triagem_fichaResumo');
        }
    }, [fichaResumo]);

    // Função para parsear a resposta da IA e extrair os campos
    const parseRespostaIA = useCallback((resposta) => {
        const linhas = resposta.split('\n');
        const campos = [];
        let resumoVicios = [];
        let mpLocalizado = undefined;
        let observacoes = '';

        // Regex para capturar tabela com 4 colunas: | Etapa | Campo TRIARIO | Informação Extraída | Movimento |
        const regexTabela4 = /\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/;
        // Regex para capturar tabela com 2 colunas: | Campo | Valor |
        const regexTabela2 = /\|\s*(.+?)\s*\|\s*(.+?)\s*\|/;

        const camposTRIARIO = [
            'Tipo do Recurso', 'Acordo', 'Desistência', 'Sigla',
            'Interposição', 'Decisão Recorrida', 'Câmara', 'Prazo em Aberto',
            'Envio da Intimação', 'Consulta Eletrônica', 'Prazo',
            'Multa', 'Justiça Gratuita', 'Subscritor',
            'Efeito Suspensivo', 'Exclusividade Intimação', 'Contrarrazões',
            'Intervenção MP'
        ];

        for (const linha of linhas) {
            if (linha.includes('---') || linha.includes('===')) continue;
            
            // Tenta primeiro o formato de 4 colunas (TRIARIO)
            const match4 = linha.match(regexTabela4);
            if (match4) {
                const etapa = parseInt(match4[1].trim());
                const campo = match4[2].trim();
                const info = match4[3].trim();
                const movimento = match4[4].trim();
                
                if (etapa >= 1 && etapa <= 18) {
                    campos.push({
                        etapa,
                        campo,
                        informacao: info,
                        movimento: movimento !== '-' && movimento !== '' ? movimento : 'Não informado'
                    });
                }
                continue;
            }

            // Fallback para formato de 2 colunas
            const match2 = linha.match(regexTabela2);
            if (match2 && campos.length === 0) {
                const nomeCampo = match2[1].trim();
                const valorCampo = match2[2].trim();
                
                const idx = camposTRIARIO.findIndex(c => 
                    nomeCampo.toLowerCase().includes(c.toLowerCase()) || 
                    c.toLowerCase().includes(nomeCampo.toLowerCase())
                );
                
                if (idx >= 0) {
                    campos.push({
                        etapa: idx + 1,
                        campo: camposTRIARIO[idx],
                        informacao: valorCampo,
                        movimento: 'Não informado'
                    });
                }
            }

            // Capturar observações
            if (linha.toLowerCase().includes('observaç') || linha.toLowerCase().includes('obs:')) {
                const parts = linha.split(':');
                if (parts.length > 1) {
                    observacoes = parts.slice(1).join(':').trim();
                }
            }
        }

        // Detectar MP e vícios na resposta completa
        if (resposta.includes('⭐') || resposta.toLowerCase().includes('mp localizado') || resposta.toLowerCase().includes('ministério público localizado')) {
            mpLocalizado = true;
        } else if (resposta.includes('🔍') || resposta.toLowerCase().includes('mp não encontrado') || resposta.toLowerCase().includes('mp não localizado')) {
            mpLocalizado = false;
        }

        const linhasVicio = linhas.filter(l => 
            l.toLowerCase().includes('vício') || 
            l.toLowerCase().includes('defeito') ||
            l.toLowerCase().includes('irregularidade') ||
            l.toLowerCase().includes('ausência')
        );
        
        if (linhasVicio.length > 0) {
            resumoVicios = linhasVicio.map(v => ({ tipo: 'Vício Identificado', descricao: v.trim() }));
        }

        return {
            campos: campos,
            camposMap: Object.fromEntries(campos.map(c => [c.campo, c.informacao])),
            resumo: {
                vicios: resumoVicios,
                mpLocalizado: mpLocalizado
            },
            observacoes: observacoes,
            respostaOriginal: resposta
        };
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files).filter(file => {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            return validTypes.includes(file.type);
        });
        
        setDocumentos(prev => [...prev, ...files]);
        setResultado(null);
        setError(null);
        setAgentesResults(null);
        setAnaliseId(null);
    }, []);

    const handleFileSelect = useCallback((e) => {
        const files = Array.from(e.target.files).filter(file => {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            return validTypes.includes(file.type);
        });
        
        setDocumentos(prev => [...prev, ...files]);
        setResultado(null);
        setError(null);
        setAgentesResults(null);
        setAnaliseId(null);
    }, []);

    const handleRemoveDocument = useCallback((index) => {
        setDocumentos(prev => prev.filter((_, i) => i !== index));
        setResultado(null);
        setAgentesResults(null);
        setAnaliseId(null);
    }, []);

    const handleClearAll = useCallback(() => {
        setDocumentos([]);
        setResultado(null);
        setError(null);
        setAgentesResults(null);
        setAnaliseId(null);
        setChatMessages([]);
        setConversaId(null);
        setChatInput('');
        setFichaResumo(null);
        localStorage.removeItem('tjpr_triagem_resultado');
        localStorage.removeItem('tjpr_triagem_textoOcr');
        localStorage.removeItem('tjpr_triagem_analiseId');
        localStorage.removeItem('tjpr_triagem_conversaId');
        localStorage.removeItem('tjpr_triagem_chatMessages');
        localStorage.removeItem('tjpr_triagem_fichaResumo');
    }, []);

    // Helper robusto para tratar erros retornados pelo Supabase Edge Functions (e do OpenCode)
    const tratarErroChamadaSupabase = useCallback((error, prefixo = 'Erro') => {
        if (!error) return null;
        console.error('[Supabase Invoke Error Details]', error);
        
        let status = error.status || error.statusCode || error.status_code;
        if (!status && error.context) {
            status = error.context.status || error.context.statusCode || error.context.status_code;
        }
        
        let apiMsg = '';
        if (error.context) {
            if (typeof error.context === 'string') {
                apiMsg = error.context;
            } else if (typeof error.context === 'object') {
                const ctxErr = error.context.error || error.context;
                if (typeof ctxErr === 'object') {
                    apiMsg = ctxErr.message || ctxErr.error || JSON.stringify(ctxErr);
                } else if (typeof ctxErr === 'string') {
                    apiMsg = ctxErr;
                }
            }
        }
        
        const msgBase = apiMsg || error.message || String(error);
        const msgLower = msgBase.toLowerCase();
        
        if (status === 429 || msgLower.includes('429') || msgLower.includes('rate limit') || msgLower.includes('too many requests') || msgLower.includes('limite de requisições')) {
            return new Error('Limite de requisições excedido (HTTP 429) no provedor de IA (OpenCode/OpenRouter). Isso ocorre devido ao limite rígido de requisições por minuto na API. Para resolver este problema, utilize o "Modo Econômico" (1 chamada) no seletor de configurações da tela.');
        }
        if (status === 401 || msgLower.includes('401') || msgLower.includes('unauthorized') || msgLower.includes('invalid api key') || msgLower.includes('chave de api inválida')) {
            return new Error('Erro de autenticação na API (HTTP 401). A chave de API do OpenCode configurada nas Edge Functions do Supabase está inválida, expirou, não foi salva corretamente ou o ambiente de nuvem do Supabase ainda está se atualizando. Verifique o cadastro do secret ou aguarde 1 minuto.');
        }
        
        return new Error(status ? `${prefixo} (HTTP ${status}): ${msgBase}` : `${prefixo}: ${msgBase}`);
    }, []);

    const sendChatMessage = useCallback(async () => {
        if (!chatInput.trim() || chatSending) return;
        const texto = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: texto }]);
        setChatSending(true);
        try {
            const sb = window._supabaseClient;
            const userId = sb?.auth?.currentSession?.user?.id ||
                (await sb.auth.getSession()).data?.session?.user?.id;
            const headers = opencodeApiKey ? { 'x-opencode-key': opencodeApiKey } : {};
            const { data: raw, error } = await sb.functions.invoke('ai-triagem-orchestrator', {
                headers,
                body: {
                    action: 'chat',
                    userId,
                    conversa_id: conversaId,
                    mensagem: texto,
                    contexto_documento: textoOcrRef.current || null,
                    analise_id: analiseId,
                }
            });

            if (error) throw tratarErroChamadaSupabase(error, 'Falha no chat');
            const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (data?.error) throw new Error(data.error);

            if (data.conversa_id && !conversaId) setConversaId(data.conversa_id);

            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: data.mensagem || 'Sem resposta',
                agente: data.agente || 'Orquestrador'
            }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${err.message}`, agente: 'Sistema' }]);
        } finally {
            setChatSending(false);
        }
    }, [chatInput, chatSending, conversaId, documentos, analiseId]);

    // Scroll automático do chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    const analisarDocumentos = useCallback(async () => {
        if (documentos.length === 0) {
            setError('Por favor, adicione pelo menos um documento para análise.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            if (typeof Tesseract === 'undefined' || typeof pdfjsLib === 'undefined') {
                throw new Error('Bibliotecas de OCR não carregadas. Recarregue a página.');
            }

            function readFileAsArrayBuffer(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(file);
                });
            }

            const conteudoDocumentos = [];
            for (const file of documentos) {
                const nome = file.name;
                const tipo = file.type;
                let conteudo = '';

                try {
                    if (tipo === 'application/pdf') {
                        setOcrProgresso({ pagina: 0, total: 1, pct: 0, tipo: 'lendo' });
                        setLogProcessamento(`📄 Lendo PDF "${nome}"...`);
                        const arrayBuffer = await readFileAsArrayBuffer(file);
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                        const totalPags = pdf.numPages;
                        setOcrProgresso({ pagina: 0, total: totalPags, pct: 0, tipo: 'pdf' });
                        setLogProcessamento(`📄 ${nome}: ${totalPags} página(s) encontrada(s)`);
                        let fullText = '';
                        let totalConfianca = 0;
                        let paginasOcr = 0;

                        for (let i = 1; i <= totalPags; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items.map(item => item.str).join(' ');

                            if (pageText.trim().length > 100) {
                                fullText += pageText.trim() + '\n\n';
                                setOcrProgresso({ pagina: i, total: totalPags, pct: Math.round((i / totalPags) * 100), tipo: 'texto' });
                            } else {
                                setOcrProgresso({ pagina: i, total: totalPags, pct: Math.round(((i - 1) / totalPags) * 100), tipo: 'ocr' });
                                const viewport = page.getViewport({ scale: 2 });
                                const canvas = document.createElement('canvas');
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;
                                const ctx = canvas.getContext('2d');
                                await page.render({ canvasContext: ctx, viewport }).promise;

                                const result = await Tesseract.recognize(canvas, 'por', {
                                    logger: (m) => {
                                        if (m.status === 'recognizing text') {
                                            const pctOcr = Math.round(((i - 1) / totalPags + m.progress / totalPags) * 100);
                                            setOcrProgresso({ pagina: i, total: totalPags, pct: pctOcr, tipo: 'ocr' });
                                        }
                                    }
                                });
                                fullText += result.data.text.trim() + '\n\n';
                                if (result.data.confidence) {
                                    totalConfianca += result.data.confidence;
                                    paginasOcr++;
                                }
                            }
                        }

                        if (paginasOcr > 0) setOcrScore(Math.round(totalConfianca / paginasOcr));
                        conteudo = fullText.trim() || '(Nenhum texto extraído)';
                        setOcrProgresso({ pagina: totalPags, total: totalPags, pct: 100, tipo: 'pronto' });
                        setLogProcessamento(`✅ ${nome}: ${conteudo.length} caracteres extraídos`);
                    } else {
                        setOcrProgresso({ pagina: 1, total: 1, pct: 0, tipo: 'imagem' });
                        setLogProcessamento(`🖼️ ${nome}: aplicando OCR...`);
                        const result = await Tesseract.recognize(file, 'por', {
                            logger: (m) => {
                                if (m.status === 'recognizing text') {
                                    setOcrProgresso({ pagina: 1, total: 1, pct: Math.round(m.progress * 100), tipo: 'imagem' });
                                }
                            }
                        });
                        if (result.data.confidence) setOcrScore(Math.round(result.data.confidence));
                        conteudo = result.data.text.trim() || '(Nenhum texto extraído)';
                        setOcrProgresso({ pagina: 1, total: 1, pct: 100, tipo: 'pronto' });
                        setLogProcessamento(`✅ ${nome}: ${conteudo.length} caracteres extraídos`);
                    }

                    conteudoDocumentos.push(`[${tipo === 'application/pdf' ? 'PDF' : 'IMAGEM'}] ${nome}\n\n--- CONTEÚDO EXTRAÍDO (${conteudo.length} caracteres) ---\n${conteudo}\n--- FIM ---`);
                } catch (err) {
                    console.error(`Erro ao processar ${nome}:`, err);
                    conteudoDocumentos.push(`[${tipo === 'application/pdf' ? 'PDF' : 'IMAGEM'}] ${nome} - ERRO AO EXTRAIR TEXTO: ${err.message}`);
                    setLogProcessamento(`❌ ${nome}: erro - ${err.message}`);
                }
            }

            const textoEntrada = conteudoDocumentos.join('\n\n');

            const totalCaracteres = textoEntrada.length;
            const textoExtraidoreal = conteudoDocumentos.reduce((acc, doc) => {
                const match = doc.match(/--- CONTEÚDO EXTRAÍDO \((\d+) caracteres\) ---/);
                return acc + (match ? parseInt(match[1]) : 0);
            }, 0);

            setLogProcessamento(`📊 Total: ${totalCaracteres} caracteres (${textoExtraidoreal} extraídos dos documentos)`);

            if (textoExtraidoreal < 200 && documentos.length > 0) {
                setLogProcessamento(`⚠️ Pouco texto extraído (${textoExtraidoreal} caracteres). O OCR pode não ter funcionado. Verifique o console (F12) para detalhes.`);
            }

            setLogProcessamento('🧠 Iniciando análise multi-agente...');

            const userId = window._supabaseClient?.auth?.currentSession?.user?.id ||
                           (await window._supabaseClient.auth.getSession()).data?.session?.user?.id;
            if (!userId) throw new Error('Usuário não autenticado');

            const textoOcr = conteudoDocumentos.join('\n\n=== PRÓXIMO DOCUMENTO ===\n\n');
            textoOcrRef.current = textoOcr;
            setTextoOcrExtraido(textoOcr);
            const documentNames = documentos.map(f => f.name);
            const sb = window._supabaseClient;

            // 1. Criar registro da análise no DB
            setLogProcessamento('📝 Registrando análise...');
            const { data: rawAnalise, error: invokeErr } = await sb.functions.invoke('ai-triagem-orchestrator', {
                headers: opencodeApiKey ? { 'x-opencode-key': opencodeApiKey } : {},
                body: { action: 'create_analise', userId, document_names: documentNames, texto_ocr: textoOcr, modelo_ia: modeloSelecionado }
            });
            if (invokeErr) throw tratarErroChamadaSupabase(invokeErr, 'Falha ao criar análise');
            const analiseCriada = typeof rawAnalise === 'string' ? JSON.parse(rawAnalise) : rawAnalise;
            if (analiseCriada?.error) throw new Error('Falha ao criar análise: ' + analiseCriada.error);
            if (!analiseCriada?.ok) throw new Error('Falha ao criar análise: resposta inesperada');
            const analiseId = analiseCriada.analise_id;
            setAnaliseId(analiseId);

            // 2. Definir os 13 agentes
            const AGENTES = [
                { nome: 'classificador', temp: 0.05, max: 800, prompt: 'Classifique o documento. Extraia APENAS: tipo_recurso (Especial/Extraordinario), sigla, camara, num_processo, recorrente, recorrido. Responda APENAS com JSON valido, sem markdown.' },
                { nome: 'acordo', temp: 0.05, max: 400, prompt: 'ETAPA 2 TRIARIO: ACORDO. Houve acordo? Valido? Movimento? JSON.' },
                { nome: 'desistencia', temp: 0.05, max: 400, prompt: 'ETAPA 3: DESISTENCIA. Houve? Valida? Movimento? JSON.' },
                { nome: 'decisao_recorrida', temp: 0.05, max: 400, prompt: 'ETAPA 6: DECISAO RECORRIDA. Colegiada/Monocratica? Mov acordao? JSON.' },
                { nome: 'prazo', temp: 0.05, max: 400, prompt: 'ETAPAS 8 e 11: PRAZO. Aberto? Simples/Dobro? JSON.' },
                { nome: 'intimacao', temp: 0.05, max: 400, prompt: 'ETAPAS 9 e 10: INTIMACAO. Data envio? Consulta? JSON.' },
                { nome: 'custas', temp: 0.05, max: 500, prompt: 'ETAPAS 12 e 13: CUSTAS. Multa (CPC 1026)? Justica Gratuita? JSON.' },
                { nome: 'subscritor', temp: 0.05, max: 500, prompt: 'ETAPA 14: SUBSCRITOR. Tipo, nome, procuracao? JSON.' },
                { nome: 'efeito_suspensivo', temp: 0.05, max: 400, prompt: 'ETAPA 15: EFEITO SUSPENSIVO. Requerido? Autuado? JSON.' },
                { nome: 'exclusividade', temp: 0.05, max: 400, prompt: 'ETAPA 16: EXCLUSIVIDADE. Requerida? Nomes? JSON.' },
                { nome: 'contrarrazoes', temp: 0.05, max: 500, prompt: 'ETAPA 17: CONTRARRAZOES. Apresentadas? Intimado? JSON.' },
                { nome: 'mp', temp: 0.05, max: 600, prompt: 'ETAPA 18: MP. Procure: Ministerio Publico, MP, Promotor, parquet, MPPR, PGJ, custos legis. Diferencie MP de Medida Provisoria. JSON.' },
                { nome: 'revisor', temp: 0.1, max: 1500, prompt: 'CONSOLIDACAO FINAL. Receba outputs de 12 agentes. 1) Ache inconsistencias. 2) Detecte vicios (falta preparo, representacao irregular, MP nao intimado, multa nao recolhida). 3) Gere campos_consolidados com etapa(1-18), campo, informacao, movimento. JSON valido.' }
            ];

            const outputs = {};
            const MODELS = ['minimax-m2.5-free', 'deepseek-v4-flash-free', 'ring-2.6-1t-free'];

            async function chamarIA(cfg, mensagem) {
                for (const model of MODELS) {
                    try {
                        const { data: rawData, error } = await sb.functions.invoke('ai-proxy', {
                            headers: opencodeApiKey ? { 'x-opencode-key': opencodeApiKey } : {},
                            body: { model, messages: [
                                { role: 'system', content: cfg.prompt },
                                { role: 'user', content: mensagem }
                            ], temperature: cfg.temp, max_tokens: cfg.max }
                        });
                        
                        if (error) {
                            throw tratarErroChamadaSupabase(error, `Falha no agente ${cfg.nome}`);
                        }
                        
                        const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                        
                        // Captura erros retornados no corpo da resposta com status 200/sucesso pelo proxy
                        if (data?.error) {
                            const apiErr = data.error;
                            const apiMsg = typeof apiErr === 'object' ? (apiErr.message || JSON.stringify(apiErr)) : String(apiErr);
                            console.warn('[ai-proxy] Erro retornado pela API no JSON:', apiMsg);
                            
                            // Cria um erro mockado para passar pelo tratarErroChamadaSupabase
                            const mockError = {
                                message: apiMsg,
                                status: 200,
                                context: data
                            };
                            throw tratarErroChamadaSupabase(mockError, `Erro retornado pelo agente ${cfg.nome}`);
                        }
                        
                        const content = data?.choices?.[0]?.message?.content;
                        if (content) return content;
                    } catch (e) {
                        // Desmascara o erro usando o helper para obter a mensagem detalhada em português
                        const erroTratado = tratarErroChamadaSupabase(e, `Falha no agente ${cfg.nome}`);
                        const msg = erroTratado.message || '';
                        
                        console.error(`[chamarIA Catch - Modelo ${model}]`, erroTratado);
                        
                        // Se for erro de autenticação ou limite de requisições, aborta o loop imediatamente
                        if (msg.includes('Limite de requisições excedido') || msg.includes('Erro de autenticação')) {
                            throw erroTratado;
                        }
                        
                        // Se for o último modelo do loop, lança o erro tratado
                        if (model === MODELS[MODELS.length - 1]) {
                            throw erroTratado;
                        }
                    }
                }
            }

            function parseJSON(raw) {
                if (!raw || typeof raw !== 'string') return null;
                
                // 1. Limpeza inicial de blocos markdown
                let s = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
                
                // 2. Tenta parse simples
                try { return JSON.parse(s); } catch {}
                
                // 3. Tenta extrair apenas a parte que está entre a primeira chave { e a última }
                const firstBrace = s.indexOf('{');
                const lastBrace = s.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    s = s.slice(firstBrace, lastBrace + 1);
                    try { return JSON.parse(s); } catch {}
                }
                
                // 4. Se falhou, realiza limpezas agressivas
                try {
                    // Substitui aspas inteligentes por normais
                    let limpo = s
                        .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
                        .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
                        .replace(/\r/g, '')
                        .replace(/\t/g, '    ');
                        
                    try { return JSON.parse(limpo); } catch {}
                    
                    // 5. Tenta corrigir truncamento de JSON (se a IA parou de responder antes de fechar colchetes/chaves)
                    let chavesAbertas = 0;
                    let colchetesAbertos = 0;
                    let dentroDeString = false;
                    let escapado = false;
                    
                    for (let i = 0; i < limpo.length; i++) {
                        const char = limpo[i];
                        if (escapado) {
                            escapado = false;
                            continue;
                        }
                        if (char === '\\') {
                            escapado = true;
                            continue;
                        }
                        if (char === '"') {
                            dentroDeString = !dentroDeString;
                            continue;
                        }
                        if (!dentroDeString) {
                            if (char === '{') chavesAbertas++;
                            else if (char === '}') chavesAbertas--;
                            else if (char === '[') colchetesAbertos++;
                            else if (char === ']') colchetesAbertos--;
                        }
                    }
                    
                    if (chavesAbertas > 0 || colchetesAbertos > 0) {
                        let reparado = limpo;
                        if (dentroDeString) {
                            reparado += '"';
                        }
                        while (colchetesAbertos > 0) {
                            reparado += ']';
                            colchetesAbertos--;
                        }
                        while (chavesAbertas > 0) {
                            reparado += '}';
                            chavesAbertas--;
                        }
                        try { return JSON.parse(reparado); } catch {}
                    }
                } catch (e) {
                    console.error('Erro na limpeza agressiva de JSON:', e);
                }
                
                return null;
            }

            function extrairCamposHeuristicosDoTexto(texto) {
                console.log('[Heurística] Iniciando extração via Regex do retorno da IA...');
                const campos = [];
                const camposPadrao = [
                    "Tipo do Recurso", "Acordo", "Desistência", "Sigla",
                    "Interposição", "Decisão Recorrida", "Câmara", "Prazo em Aberto",
                    "Envio da Intimação", "Consulta Eletrônica", "Prazo",
                    "Multa", "Justiça Gratuita", "Subscritor",
                    "Efeito Suspensivo", "Exclusividade Intimação", "Contrarrazões",
                    "Intervenção MP"
                ];
                
                for (let e = 1; e <= 18; e++) {
                    campos.push({
                        etapa: e,
                        campo: camposPadrao[e - 1],
                        informacao: "Não encontrado ou não informado",
                        movimento: "-"
                    });
                }
                
                try {
                    // Regex flexíveis para extrair campos
                    const matchesObj = texto.match(/\{[^\}]*\}/g) || [];
                    
                    const regexEtapaNum = /["']?etapa["']?\s*:\s*(\d+)/i;
                    const regexCampoNome = /["']?campo["']?\s*:\s*["']([^"']+)["']/i;
                    const regexInfoVal = /["']?(?:informacao|informação|valor)["']?\s*:\s*["']([^"']+)["']/i;
                    const regexMovVal = /["']?movimento["']?\s*:\s*["']([^"']*)["']/i;
                    
                    for (const objStr of matchesObj) {
                        const mEtapa = objStr.match(regexEtapaNum);
                        if (mEtapa) {
                            const num = parseInt(mEtapa[1]);
                            if (num >= 1 && num <= 18) {
                                const idx = num - 1;
                                const mInfo = objStr.match(regexInfoVal);
                                const mMov = objStr.match(regexMovVal);
                                
                                if (mInfo) {
                                    campos[idx].informacao = mInfo[1].trim();
                                }
                                if (mMov) {
                                    campos[idx].movimento = mMov[1].trim() || "-";
                                }
                            }
                        }
                    }
                    
                    // Fallback se poucos campos forem capturados
                    const camposPreenchidos = campos.filter(c => c.informacao !== "Não encontrado ou não informado").length;
                    if (camposPreenchidos < 5) {
                        console.log('[Heurística] Poucos campos via blocos. Tentando busca direta...');
                        camposPadrao.forEach((nomeCampo, idx) => {
                            const regexChaveValor = new RegExp(`["']?${nomeCampo}["']?\\s*:\\s*["']([^"']+)["']`, 'i');
                            const match = texto.match(regexChaveValor);
                            if (match) {
                                campos[idx].informacao = match[1].trim();
                            }
                        });
                    }
                    
                    // Extrair vícios
                    const vicios = [];
                    const matchViciosText = texto.match(/["']?vicios["']?\s*:\s*\[([\s\S]*?)\]/i);
                    if (matchViciosText) {
                        const viciosBloco = matchViciosText[1];
                        const matchesVicioObj = viciosBloco.match(/\{[^\}]*\}/g) || [];
                        for (const vObj of matchesVicioObj) {
                            const mDesc = vObj.match(/["']?(?:descricao|descrição)["']?\s*:\s*["']([^"']+)["']/i);
                            const mTipo = vObj.match(/["']?tipo["']?\s*:\s*["']([^"']+)["']/i);
                            if (mDesc) {
                                vicios.push({
                                    tipo: mTipo ? mTipo[1].trim() : "Vício Formal",
                                    descricao: mDesc[1].trim()
                                });
                            }
                        }
                    }
                    
                    if (vicios.length === 0 && (texto.toLowerCase().includes('vício') || texto.toLowerCase().includes('intempestiv') || texto.toLowerCase().includes('deserção'))) {
                        const linhas = texto.split('\n');
                        linhas.forEach(linha => {
                            if ((linha.includes('vicio') || linha.includes('vício') || linha.includes('intempestiv') || linha.includes('desert') || linha.includes('multa')) && linha.includes(':')) {
                                const partes = linha.split(':');
                                vicios.push({
                                    tipo: "Vício Formal",
                                    descricao: partes.slice(1).join(':').replace(/[\[\]\{\}"']/g, '').trim()
                                });
                            }
                        });
                    }
                    
                    // MP e inconsistências
                    let mpLocalizado = null;
                    let mpMovimento = "";
                    let mpContexto = "";
                    
                    const mMpLocalizado = texto.match(/["']?localizado["']?\s*:\s*(true|false|["']?[^"'\s,}]+["']?)/i);
                    if (mMpLocalizado) {
                        const val = mMpLocalizado[1].toLowerCase().replace(/["']/g, '');
                        mpLocalizado = val === 'true' || val === 'sim' || val === '1';
                    }
                    const mMpMov = texto.match(/["']?movimento["']?\s*:\s*["']([^"']*)["']/i);
                    if (mMpMov) mpMovimento = mMpMov[1];
                    const mMpCtx = texto.match(/["']?contexto["']?\s*:\s*["']([^"']*)["']/i);
                    if (mMpCtx) mpContexto = mMpCtx[1];
                    
                    const inconsistencias = [];
                    const matchIncon = texto.match(/["']?inconsistencias["']?\s*:\s*\[([\s\S]*?)\]/i);
                    if (matchIncon) {
                        const itens = matchIncon[1].match(/"([^"]+)"|'([^']+)'/g) || [];
                        itens.forEach(it => {
                            inconsistencias.push(it.replace(/["']/g, '').trim());
                        });
                    }
                    
                    let obsGerais = "Triagem monolítica consolidada por parser de contingência regex.";
                    const mObs = texto.match(/["']?observacoes_gerais["']?\s*:\s*["']([^"']+)["']/i);
                    if (mObs) obsGerais = mObs[1];
                    
                    return {
                        campos_consolidados: campos,
                        vicios: vicios,
                        mp_resumo: { localizado: mpLocalizado, movimento: mpMovimento, contexto: mpContexto },
                        inconsistencias: inconsistencias,
                        observacoes_gerais: obsGerais
                    };
                } catch (errHeuristica) {
                    console.error('Falha crítica na heurística de parser regex do Modo Econômico:', errHeuristica);
                    return null;
                }
            }

            function montarMsg(nome, outs, texto) {
                if (nome === 'classificador') return `Documento:\n${texto}`;
                if (nome === 'revisor') {
                    let msg = 'Consolide os outputs abaixo:\n';
                    for (const [k, v] of Object.entries(outs)) {
                        msg += `\n=== ${k} ===\n${v.status === 'success' ? JSON.stringify(v.data, null, 2) : 'ERRO: ' + (v.error || 'falhou')}`;
                    }
                    return msg + `\n\nTexto original:\n${texto}`;
                }
                const meta = outs.classificador?.status === 'success' ? `Metadados: ${JSON.stringify(outs.classificador.data)}\n` : '';
                return `${meta}Documento:\n${texto}`;
            }

            // 3. Executar análise baseada no modo escolhido
            let rev = null;
            if (modoTriagem === 'economico') {
                setLogProcessamento('🧠 Executando triagem rápida em Modo Econômico (1 chamada)...');
                const start = Date.now();
                const cfgMonolitico = {
                    nome: 'revisor_monolitico',
                    temp: 0.1,
                    max: 2000,
                    prompt: PROMPT_MONOLITICO
                };

                try {
                    const raw = await chamarIA(cfgMonolitico, `Analise o seguinte processo extraído por OCR e retorne o JSON estruturado do TRIARIO:\n\n${textoOcr}`);
                    let parsed = parseJSON(raw);
                    
                    if (!parsed || !parsed.campos_consolidados || parsed.campos_consolidados.length === 0) {
                        console.warn('[Modo Econômico] JSON inválido ou incompleto da IA. Tentando extração heurística via Regex...');
                        const heuristico = extrairCamposHeuristicosDoTexto(raw);
                        if (heuristico && heuristico.campos_consolidados && heuristico.campos_consolidados.length > 0) {
                            parsed = heuristico;
                            console.log('[Modo Econômico] Extração heurística via Regex concluída com sucesso!');
                        } else {
                            throw new Error('O retorno da IA não pôde ser interpretado como um JSON válido e a extração alternativa via Regex também falhou. Tente novamente ou mude o modelo de IA.');
                        }
                    }
                    
                    rev = parsed;
                    outputs['revisor_monolitico'] = { status: 'success', data: parsed, tempo_ms: Date.now() - start };

                    // Salvar no DB como agente revisor no formato unificado
                    await sb.functions.invoke('ai-triagem-orchestrator', {
                        body: { action: 'save_agente', analise_id: analiseId, agentes: { nome: 'revisor_monolitico', status: 'success', data: parsed, prompt: PROMPT_MONOLITICO } }
                    }).catch(() => {});
                    
                    setLogProcessamento('✅ Análise consolidada em Modo Econômico com sucesso!');
                } catch (e) {
                    console.error('Erro na análise monolítica:', e);
                    throw e;
                }
            } else {
                // Modo Multiagente (Esteira de 13 agentes sequenciais)
                const agentesStatus = {};
                for (const cfg of AGENTES) {
                    const status = { status: 'pending', nome: cfg.nome };
                    agentesStatus[cfg.nome] = status;
                    setAgentesResults({ ...agentesStatus });
                    setLogProcessamento(`🤖 ${cfg.nome.replace(/_/g, ' ')}...`);
                    await new Promise(r => setTimeout(r, 500));

                    const start = Date.now();
                    try {
                        const raw = await chamarIA(cfg, montarMsg(cfg.nome, outputs, textoOcr));
                        const parsed = parseJSON(raw);
                        const result = { status: parsed ? 'success' : 'failed', data: parsed, raw: raw.slice(0, 500), error: parsed ? null : 'JSON inválido', tempo_ms: Date.now() - start };
                        outputs[cfg.nome] = result;
                        status.status = result.status;

                        // Salvar no DB
                        await sb.functions.invoke('ai-triagem-orchestrator', {
                            body: { action: 'save_agente', analise_id: analiseId, agentes: { nome: cfg.nome, ...result, prompt: cfg.prompt } }
                        }).catch(() => {});
                    } catch (e) {
                        const result = { status: 'failed', data: null, error: e.message, tempo_ms: Date.now() - start };
                        outputs[cfg.nome] = result;
                        status.status = 'failed';
                        status.error = e.message;
                    }
                    setAgentesResults({ ...agentesStatus });
                    await new Promise(r => setTimeout(r, 1500));
                }
            }

            // 4. Processar resultado do revisor (ou aplicar fallback local heurístico em caso de falha no modo multiagente)
            if (modoTriagem !== 'economico') {
                if (outputs.revisor?.status === 'success' && outputs.revisor.data) {
                    rev = outputs.revisor.data;
                    setLogProcessamento('✅ Análise consolidada com sucesso pelo revisor!');
                } else {
                setLogProcessamento('⚠️ Revisor falhou. Aplicando consolidação heurística local...');
                
                // Mapeamento dos campos do TRIARIO
                const camposConsolidados = [];
                const vicios = [];
                let mpLocalizado = null;
                let mpContexto = '';
                
                // Função auxiliar para obter valor de um objeto por chaves aproximadas
                const getVal = (obj, keys, defaultVal = 'Não encontrado ou não informado') => {
                    if (!obj) return defaultVal;
                    for (const key of keys) {
                        if (obj[key] !== undefined && obj[key] !== null) {
                            if (typeof obj[key] === 'object') return JSON.stringify(obj[key]);
                            const valStr = String(obj[key]);
                            return (valStr === 'Não informado' || valStr === 'Não encontrado ou não informado') ? defaultVal : valStr;
                        }
                    }
                    // Tenta busca case-insensitive
                    const objKeys = Object.keys(obj);
                    for (const key of keys) {
                        const match = objKeys.find(k => k.toLowerCase() === key.toLowerCase());
                        if (match && obj[match] !== undefined && obj[match] !== null) {
                            if (typeof obj[match] === 'object') return JSON.stringify(obj[match]);
                            const valStr = String(obj[match]);
                            return (valStr === 'Não informado' || valStr === 'Não encontrado ou não informado') ? defaultVal : valStr;
                        }
                    }
                    // Se houver apenas um campo no objeto, retorna ele
                    if (objKeys.length === 1) {
                        const valStr = String(obj[objKeys[0]]);
                        return (valStr === 'Não informado' || valStr === 'Não encontrado ou não informado') ? defaultVal : valStr;
                    }
                    // Se não achar nada mas tiver dados, stringifica de forma amigável
                    if (objKeys.length > 0) {
                        return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ');
                    }
                    return defaultVal;
                };

                // 1. Tipo do Recurso (Etapa 1), Sigla (Etapa 4), Câmara (Etapa 7)
                if (outputs.classificador?.status === 'success') {
                    const d = outputs.classificador.data;
                    camposConsolidados.push({
                        etapa: 1,
                        campo: 'Tipo do Recurso',
                        informacao: getVal(d, ['tipo_recurso', 'tipo', 'recurso']),
                        movimento: 'Extraído por Classificador'
                    });
                    camposConsolidados.push({
                        etapa: 4,
                        campo: 'Sigla',
                        informacao: getVal(d, ['sigla', 'sigla_classe']),
                        movimento: 'Extraído por Classificador'
                    });
                    camposConsolidados.push({
                        etapa: 7,
                        campo: 'Câmara',
                        informacao: getVal(d, ['camara', 'orgao_julgador']),
                        movimento: 'Extraído por Classificador'
                    });
                } else {
                    camposConsolidados.push({ etapa: 1, campo: 'Tipo do Recurso', informacao: 'Não encontrado ou não informado', movimento: '-' });
                    camposConsolidados.push({ etapa: 4, campo: 'Sigla', informacao: 'Não encontrado ou não informado', movimento: '-' });
                    camposConsolidados.push({ etapa: 7, campo: 'Câmara', informacao: 'Não encontrado ou não informado', movimento: '-' });
                }

                // 2. Acordo (Etapa 2)
                const acData = outputs.acordo?.status === 'success' ? outputs.acordo.data : null;
                camposConsolidados.push({
                    etapa: 2,
                    campo: 'Acordo',
                    informacao: getVal(acData, ['acordo', 'houve_acordo', 'informacao', 'status']),
                    movimento: acData ? (getVal(acData, ['movimento', 'num_movimento']) || 'Extraído por Acordo') : '-'
                });

                // 3. Desistência (Etapa 3)
                const desData = outputs.desistencia?.status === 'success' ? outputs.desistencia.data : null;
                camposConsolidados.push({
                    etapa: 3,
                    campo: 'Desistência',
                    informacao: getVal(desData, ['desistencia', 'houve_desistencia', 'informacao', 'status']),
                    movimento: desData ? (getVal(desData, ['movimento', 'num_movimento']) || 'Extraído por Desistência') : '-'
                });

                // 5. Interposição (Etapa 5)
                camposConsolidados.push({
                    etapa: 5,
                    campo: 'Interposição',
                    informacao: outputs.intimacao?.status === 'success' ? getVal(outputs.intimacao.data, ['interposicao', 'data_interposicao', 'interposto']) : 'Não encontrado ou não informado',
                    movimento: '-'
                });

                // 6. Decisão Recorrida (Etapa 6)
                const decData = outputs.decisao_recorrida?.status === 'success' ? outputs.decisao_recorrida.data : null;
                camposConsolidados.push({
                    etapa: 6,
                    campo: 'Decisão Recorrida',
                    informacao: getVal(decData, ['decisao_recorrida', 'tipo_decisao', 'acordao', 'status']),
                    movimento: decData ? (getVal(decData, ['movimento', 'num_movimento']) || 'Extraído por Decisão Recorrida') : '-'
                });

                // 8. Prazo em Aberto (Etapa 8)
                const przData = outputs.prazo?.status === 'success' ? outputs.prazo.data : null;
                camposConsolidados.push({
                    etapa: 8,
                    campo: 'Prazo em Aberto',
                    informacao: getVal(przData, ['prazo_aberto', 'aberto', 'status']),
                    movimento: '-'
                });

                // 9. Envio da Intimação (Etapa 9)
                const intData = outputs.intimacao?.status === 'success' ? outputs.intimacao.data : null;
                camposConsolidados.push({
                    etapa: 9,
                    campo: 'Envio da Intimação',
                    informacao: getVal(intData, ['envio', 'data_envio', 'envio_intimacao']),
                    movimento: intData ? (getVal(intData, ['movimento_envio', 'movimento']) || 'Extraído por Intimação') : '-'
                });

                // 10. Consulta Eletrônica (Etapa 10)
                camposConsolidados.push({
                    etapa: 10,
                    campo: 'Consulta Eletrônica',
                    informacao: getVal(intData, ['consulta', 'data_consulta', 'consulta_eletronica']),
                    movimento: intData ? (getVal(intData, ['movimento_consulta', 'movimento']) || 'Extraído por Intimação') : '-'
                });

                // 11. Prazo (Etapa 11)
                camposConsolidados.push({
                    etapa: 11,
                    campo: 'Prazo',
                    informacao: getVal(przData, ['prazo', 'dias', 'quantidade_dias']),
                    movimento: '-'
                });

                // 12. Multa (Etapa 12)
                const custData = outputs.custas?.status === 'success' ? outputs.custas.data : null;
                camposConsolidados.push({
                    etapa: 12,
                    campo: 'Multa',
                    informacao: getVal(custData, ['multa', 'multa_recolhida', 'art_1026', 'status']),
                    movimento: '-'
                });

                // 13. Justiça Gratuita (Etapa 13)
                camposConsolidados.push({
                    etapa: 13,
                    campo: 'Justiça Gratuita',
                    informacao: getVal(custData, ['justica_gratuita', 'gratuita', 'beneficio']),
                    movimento: '-'
                });

                // 14. Subscritor (Etapa 14)
                const subData = outputs.subscritor?.status === 'success' ? outputs.subscritor.data : null;
                camposConsolidados.push({
                    etapa: 14,
                    campo: 'Subscritor',
                    informacao: getVal(subData, ['subscritor', 'nome', 'advogado', 'procurador']),
                    movimento: '-'
                });

                // 15. Efeito Suspensivo (Etapa 15)
                const efData = outputs.efeito_suspensivo?.status === 'success' ? outputs.efeito_suspensivo.data : null;
                camposConsolidados.push({
                    etapa: 15,
                    campo: 'Efeito Suspensivo',
                    informacao: getVal(efData, ['efeito_suspensivo', 'requerido', 'efeito', 'status']),
                    movimento: '-'
                });

                // 16. Exclusividade Intimação (Etapa 16)
                const excData = outputs.exclusividade?.status === 'success' ? outputs.exclusividade.data : null;
                camposConsolidados.push({
                    etapa: 16,
                    campo: 'Exclusividade Intimação',
                    informacao: getVal(excData, ['exclusividade', 'requerida', 'nomes', 'status']),
                    movimento: '-'
                });

                // 17. Contrarrazões (Etapa 17)
                const contrData = outputs.contrarrazoes?.status === 'success' ? outputs.contrarrazoes.data : null;
                camposConsolidados.push({
                    etapa: 17,
                    campo: 'Contrarrazões',
                    informacao: getVal(contrData, ['contrarrazoes', 'apresentadas', 'status']),
                    movimento: '-'
                });

                // 18. Intervenção MP (Etapa 18)
                const mpData = outputs.mp?.status === 'success' ? outputs.mp.data : null;
                camposConsolidados.push({
                    etapa: 18,
                    campo: 'Intervenção MP',
                    informacao: getVal(mpData, ['intervencao_mp', 'mp', 'localizado', 'status']),
                    movimento: '-'
                });

                // Detectar vícios a partir dos outputs individuais
                for (const [nome, res] of Object.entries(outputs)) {
                    if (res.status === 'success' && res.data) {
                        const viciosChave = Object.keys(res.data).filter(k => k.toLowerCase().includes('vicio') || k.toLowerCase().includes('irregularidade') || k.toLowerCase().includes('alerta'));
                        viciosChave.forEach(k => {
                            const vVal = res.data[k];
                            if (vVal && vVal !== 'Não' && vVal !== 'Nenhum' && vVal !== 'Não informado' && vVal !== 'Não encontrado ou não informado' && vVal !== false) {
                                vicios.push({
                                    tipo: 'Vício Identificado',
                                    descricao: `[Agente ${nome}] ${k}: ${typeof vVal === 'object' ? JSON.stringify(vVal) : vVal}`,
                                    agente_origem: nome
                                });
                            }
                        });
                    }
                }

                // MP
                if (mpData) {
                    const l = getVal(mpData, ['localizado', 'mp_localizado', 'intervencao']);
                    mpLocalizado = l === 'true' || l === 'Sim' || l === 'sim' || l === true;
                    mpContexto = getVal(mpData, ['contexto', 'justificativa', 'trecho']);
                }

                // Informa a falha do revisor no banco mas prossegue no front
                await sb.functions.invoke('ai-triagem-orchestrator', {
                    headers: opencodeApiKey ? { 'x-opencode-key': opencodeApiKey } : {},
                    body: { action: 'complete_analise', analise_id: analiseId, userId, error_message: 'Consolidação por Revisor falhou. Usado fallback heurístico local.' }
                }).catch(() => {});

                rev = {
                    campos_consolidados: camposConsolidados.sort((a, b) => a.etapa - b.etapa),
                    vicios: vicios,
                    mp_resumo: { localizado: mpLocalizado, movimento: '', contexto: mpContexto },
                    inconsistencias: ['Consolidação em modo de contingência local devido a falha no agente revisor central.'],
                    observacoes_gerais: 'A consolidação automática pelo revisor falhou (provavelmente devido a limite de tokens). Os dados acima foram consolidados localmente com sucesso.'
                };
            }
            }

            const resumoExec = {
                vicios: rev.vicios || [],
                mp: rev.mp_resumo || { localizado: null, movimento: '', contexto: '' },
                inconsistencias: rev.inconsistencias || [],
                observacoes: rev.observacoes_gerais || ''
            };

            const parsed = {
                campos: (rev.campos_consolidados || []).map(c => ({
                    etapa: c.etapa, campo: c.campo, informacao: c.informacao, movimento: c.movimento || 'Não informado'
                })),
                camposMap: Object.fromEntries((rev.campos_consolidados || []).map(c => [c.campo, c.informacao])),
                resumo: {
                    vicios: (resumoExec.vicios || []).map(v => ({
                        tipo: v.tipo || 'Vício Identificado',
                        descricao: `${v.descricao}${v.agente_origem ? ` (origem: ${v.agente_origem})` : ''}`
                    })),
                    mpLocalizado: resumoExec.mp?.localizado ?? undefined,
                    mpContexto: resumoExec.mp?.contexto || '',
                    inconsistencias: resumoExec.inconsistencias || []
                },
                observacoes: resumoExec.observacoes || '',
                respostaOriginal: JSON.stringify(outputs, null, 2)
            };

            setResultado(parsed);

            // 5. Finalizar análise no DB
            await sb.functions.invoke('ai-triagem-orchestrator', {
                headers: opencodeApiKey ? { 'x-opencode-key': opencodeApiKey } : {},
                body: {
                    action: 'complete_analise', analise_id: analiseId, userId,
                    resultado_final: {
                        campos_consolidados: rev.campos_consolidados || [],
                        resumo_executivo: resumoExec,
                        agentes: Object.fromEntries(Object.entries(outputs).map(([k, v]) => [k, { status: v.status, data: v.data, error: v.error }]))
                    },
                    resumo_executivo: resumoExec
                }
            }).catch(() => {});

            // 6. Criar conversa para chat
            const { data: conv } = await sb.functions.invoke('ai-triagem-orchestrator', {
                headers: opencodeApiKey ? { 'x-opencode-key': opencodeApiKey } : {},
                body: { action: 'chat', userId, analise_id: analiseId, mensagem: '__init__', contexto_documento: textoOcrRef.current }
            }).catch(() => null);
            const convData = typeof conv === 'string' ? JSON.parse(conv) : conv;
            if (convData?.conversa_id) setConversaId(convData.conversa_id);

            // Montar mensagem inicial do chat
            let msgInicial = `📋 **Análise concluída**\n\n`;
            if (parsed.campos.length > 0) {
                msgInicial += `**Etapas TRIARIO extraídas:**\n`;
                parsed.campos.slice(0, 10).forEach(c => {
                    msgInicial += `• ${c.campo}: ${c.informacao}\n`;
                });
                if (parsed.campos.length > 10) msgInicial += `...e mais ${parsed.campos.length - 10} campo(s)\n`;
            }
            if (parsed.resumo.vicios.length > 0) {
                msgInicial += `\n⚠️ **${parsed.resumo.vicios.length} vício(s) identificado(s):**\n`;
                parsed.resumo.vicios.forEach(v => {
                    msgInicial += `• ${v.tipo}: ${v.descricao.slice(0, 200)}\n`;
                });
            }
            if (parsed.resumo.mpLocalizado !== undefined) {
                msgInicial += `\n${parsed.resumo.mpLocalizado ? '⭐' : '🔍'} MP: ${parsed.resumo.mpLocalizado ? 'Localizado' : 'Não identificado'}\n`;
            }
            msgInicial += `\n💡 *O que deseja verificar? Ex: "Quais vícios foram encontrados?", "Explique o prazo desse recurso", "Gere uma minuta"*`;

            setChatMessages([{ role: 'assistant', content: msgInicial, agente: 'Sistema' }]);

            setLogProcessamento('');
        } catch (err) {
            console.error('Erro:', err);
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    }, [documentos, modeloSelecionado]);

    const formatarCampo = (valor) => {
        if (!valor || valor === '' || valor === 'Não informado' || valor === 'Não encontrado ou não informado') {
            return <span className="tjpr-text-dim italic">Não encontrado ou não informado</span>;
        }
        return valor;
    };

    const METADADOS_ETAPAS = {
        1: { icone: 'article', desc: 'Identifica o tipo exato de recurso interposto nos autos, definindo o fluxo processual principal.', cor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
        2: { icone: 'handshake', desc: 'Verifica se houve proposta ou homologação de acordo entre as partes, o que pode ensejar a perda de objeto do recurso.', cor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        3: { icone: 'cancel', desc: 'Identifica eventual manifestação expressa de desistência do recurso pela parte recorrente.', cor: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
        4: { icone: 'tag', desc: 'A sigla oficial que identifica o recurso nos sistemas processuais do Tribunal de Justiça.', cor: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        6: { icone: 'gavel', desc: 'Determina a natureza jurídica da decisão recorrida (se acórdão ou decisão monocrática) e seu movimento Projudi.', cor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
        7: { icone: 'groups', desc: 'Órgão julgador do Tribunal de Justiça do Paraná (TJPR) de onde proveio a decisão recorrida.', cor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
        12: { icone: 'error_outline', desc: 'Verifica pendência de recolhimento de multas processuais, especialmente as do art. 1026, §2º do CPC (embargos protelatórios).', cor: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
        13: { icone: 'payments', desc: 'Verifica a regularidade do preparo recursal ou se a parte goza dos benefícios da assistência judiciária gratuita.', cor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        14: { icone: 'draw', desc: 'Identifica o advogado ou procurador subscritor do recurso e valida a existência de procuração ou substabelecimento nos autos.', cor: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        15: { icone: 'hourglass_empty', desc: 'Verifica se há pedido de concessão de efeito suspensivo ao recurso e qual a situação atual desse pedido.', cor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
        16: { icone: 'lock', desc: 'Indica se há solicitação para que as intimações e publicações sejam feitas em nome de um advogado específico, sob pena de nulidade.', cor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
        17: { icone: 'reply', desc: 'Confirma a regular manifestação de contrarrazões pelo recorrido, assegurando o contraditório.', cor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        18: { icone: 'policy', desc: 'Verifica a necessidade ou a ocorrência de intervenção do Ministério Público no feito como fiscal da ordem jurídica (Custos Legis).', cor: 'text-rose-400 bg-rose-500/10 border-rose-500/20' }
    };

    const renderEtapaCompacta = (etapaNum) => {
        const item = resultado.campos.find(c => c.etapa === etapaNum);
        if (!item) return null;

        const isAusente = !item.informacao || item.informacao === '' || item.informacao === 'Não informado' || item.informacao === 'Não encontrado ou não informado';
        const meta = METADADOS_ETAPAS[etapaNum] || { icone: 'folder', desc: '', cor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };

        return (
            <div 
                onClick={() => setEtapaSelecionada(etapaNum)}
                className="p-4 bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 rounded-2xl flex flex-col justify-between group min-h-[125px] hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg hover:shadow-indigo-950/20 transition-all duration-300 relative overflow-hidden"
            >
                {/* Efeito Glow no Hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="space-y-3 relative z-10 flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${meta.cor}`}>
                                <span className="material-symbols-rounded text-sm">{meta.icone}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Etapa {item.etapa}
                            </span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const val = window.prompt(`Editar valor para "${item.campo}":`, item.informacao);
                                if (val !== null) atualizarCampoTriario(item.campo, val);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-all text-slate-500 flex-shrink-0"
                            title="Editar Campo"
                        >
                            <span className="material-symbols-rounded text-xs">edit</span>
                        </button>
                    </div>
                    
                    <div className="space-y-1 text-left">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                            {item.campo}
                        </p>
                        <p className={`text-sm font-extrabold leading-snug truncate ${isAusente ? 'text-rose-400/80 italic font-semibold' : 'tjpr-text-main'}`}>
                            {isAusente ? 'Não encontrado ou não informado' : item.informacao}
                        </p>
                    </div>

                    {item.movimento && item.movimento !== '-' && (
                        <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 text-[9px] text-slate-500 font-mono">
                            <span className="material-symbols-rounded text-[10px]">description</span>
                            <span className="truncate" title={item.movimento}>{item.movimento}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Carregar histórico de triagens do Supabase
    const carregarHistorico = async () => {
        setLoadingHistorico(true);
        setShowHistorico(true);
        try {
            const sb = window._supabaseClient;
            const userId = (await sb.auth.getSession()).data?.session?.user?.id;
            if (!userId) { setHistorico([]); return; }
            const { data, error } = await sb
                .from('analises_triagem')
                .select('id, created_at, document_names, modelo_ia, resultado_final')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);
            if (error) throw error;
            setHistorico(data || []);
        } catch (err) {
            console.error('Erro ao carregar histórico:', err);
            setHistorico([]);
        } finally {
            setLoadingHistorico(false);
        }
    };

    // Restaurar uma triagem do histórico
    const restaurarTriagem = (item) => {
        try {
            const rev = item.resultado_final;
            if (!rev || !rev.campos_consolidados) {
                alert('Esta triagem não possui dados consolidados para restaurar.');
                return;
            }
            const parsed = {
                campos: rev.campos_consolidados.map(c => ({
                    etapa: c.etapa, campo: c.campo,
                    informacao: c.informacao, movimento: c.movimento || '-'
                })),
                camposMap: Object.fromEntries(rev.campos_consolidados.map(c => [c.campo, c.informacao])),
                resumo: {
                    vicios: rev.resumo_executivo?.vicios || [],
                    mpLocalizado: rev.resumo_executivo?.mp?.localizado,
                    inconsistencias: rev.resumo_executivo?.inconsistencias || []
                },
                observacoes: rev.resumo_executivo?.observacoes || ''
            };
            setResultado(parsed);
            setAnaliseId(item.id);
            setShowHistorico(false);
            const evt = new CustomEvent('showToast', { detail: { texto: 'Triagem restaurada com sucesso!', tipo: 'success' } });
            document.dispatchEvent(evt);
        } catch (e) {
            alert('Erro ao restaurar triagem: ' + e.message);
        }
    };

    // Exportar Ficha como PDF
    const exportarFichaPdf = async () => {
        if (!fichaRef.current || !fichaResumo) return;
        setExportandoPdf(true);
        try {
            const canvas = await html2canvas(fichaRef.current, {
                scale: 3,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf || {};
            if (!jsPDF) { alert('jsPDF não carregado. Verifique sua conexão.'); return; }
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight);
            const camara = fichaResumo.camara || 'triagem';
            pdf.save(`Ficha_TJPR_${camara.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            const evt = new CustomEvent('showToast', { detail: { texto: 'PDF exportado com sucesso!', tipo: 'success' } });
            document.dispatchEvent(evt);
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
            alert('Erro ao gerar PDF: ' + err.message);
        } finally {
            setExportandoPdf(false);
        }
    };

    const copiarFichaRichText = async () => {
        if (!fichaResumo) return;

        const camaraColor = '#ef4444'; // vermelho para destacar a câmara
        const htmlString = `
          <table style="border-collapse: collapse; width: 100%; max-width: 550px; font-family: 'Times New Roman', Times, serif; font-size: 14px; border: 3px double #000000; color: #000000; background-color: #ffffff;">
            <tbody>
              <tr>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; width: 50%; text-align: left;">
                  Nome &ndash; <span style="color: ${camaraColor};">${fichaResumo.camara || 'Não encontrado ou não informado'}</span>
                </td>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; width: 50%; background-color: #e2e8f0; text-align: center;">
                  ${fichaResumo.dataDecisao || ''}
                </td>
              </tr>
              <tr>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: left;">Contrarrazões</td>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: center;">${fichaResumo.contrarrazoes || ''}</td>
              </tr>
              <tr>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: left;">Ministério Público?</td>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: center;">${fichaResumo.mp || ''}</td>
              </tr>
              <tr>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: left;">GRU:</td>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: center;">${fichaResumo.gru || ''}</td>
              </tr>
              <tr>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: left;">Funjus:</td>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: center;">${fichaResumo.funjus || ''}</td>
              </tr>
              <tr>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: left;">Procuração:</td>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: center;">${(fichaResumo.procuracao || '').replace(/\n/g, '<br>')}</td>
              </tr>
              <tr>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: left;">Exclusividade na intimação?</td>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: center;">${(fichaResumo.exclusividade || '').replace(/\n/g, '<br>')}</td>
              </tr>
              <tr>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: left;">Decisão colegiada?</td>
                <td style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: center;">${fichaResumo.decisaoColegiada || ''}</td>
              </tr>
              <tr>
                <td colspan="2" style="border: 3px double #000000; padding: 6px 10px; font-weight: bold; text-align: left;">
                  OBS: ${(fichaResumo.obs || '').replace(/\n/g, '<br>')}
                </td>
              </tr>
            </tbody>
          </table>
        `;

        const plainText = `
=========================================
Nome – ${fichaResumo.camara || 'Não encontrado ou não informado'} | ${fichaResumo.dataDecisao || ''}
=========================================
Contrarrazões: ${fichaResumo.contrarrazoes || ''}
-----------------------------------------
Ministério Público?: ${fichaResumo.mp || ''}
-----------------------------------------
GRU: ${fichaResumo.gru || ''}
-----------------------------------------
Funjus: ${fichaResumo.funjus || ''}
-----------------------------------------
Procuração: ${fichaResumo.procuracao || ''}
-----------------------------------------
Exclusividade na intimação?: ${fichaResumo.exclusividade || ''}
-----------------------------------------
Decisão colegiada?: ${fichaResumo.decisaoColegiada || ''}
=========================================
OBS: ${fichaResumo.obs || ''}
=========================================
        `.trim();

        try {
            const blobHtml = new Blob([htmlString], { type: 'text/html' });
            const blobText = new Blob([plainText], { type: 'text/plain' });
            const item = new ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobText
            });
            await navigator.clipboard.write([item]);
            
            // Emite evento de toast
            const toastEvent = new CustomEvent('showToast', {
                detail: { texto: 'Ficha de Resumo copiada em Rich Text! Cole no Word/Projudi.', tipo: 'success' }
            });
            document.dispatchEvent(toastEvent);
        } catch (err) {
            console.error('Falha na cópia Rich Text:', err);
            // Fallback para texto plano
            try {
                await navigator.clipboard.writeText(plainText);
                const toastEvent = new CustomEvent('showToast', {
                    detail: { texto: 'Copiado como texto simples (bloqueio do navegador).', tipo: 'info' }
                });
                document.dispatchEvent(toastEvent);
            } catch (e2) {
                alert('Erro ao copiar.');
            }
        }
    };

    const copiarFichaTextoPlano = async () => {
        if (!fichaResumo) return;
        const plainText = `
=========================================
Nome – ${fichaResumo.camara || 'Não encontrado ou não informado'} | ${fichaResumo.dataDecisao || ''}
=========================================
Contrarrazões: ${fichaResumo.contrarrazoes || ''}
-----------------------------------------
Ministério Público?: ${fichaResumo.mp || ''}
-----------------------------------------
GRU: ${fichaResumo.gru || ''}
-----------------------------------------
Funjus: ${fichaResumo.funjus || ''}
-----------------------------------------
Procuração: ${fichaResumo.procuracao || ''}
-----------------------------------------
Exclusividade na intimação?: ${fichaResumo.exclusividade || ''}
-----------------------------------------
Decisão colegiada?: ${fichaResumo.decisaoColegiada || ''}
=========================================
OBS: ${fichaResumo.obs || ''}
=========================================
        `.trim();

        try {
            await navigator.clipboard.writeText(plainText);
            const toastEvent = new CustomEvent('showToast', {
                detail: { texto: 'Ficha copiada como texto simples!', tipo: 'success' }
            });
            document.dispatchEvent(toastEvent);
        } catch (err) {
            alert('Erro ao copiar texto simples.');
        }
    };

    // --- MÉTODOS DO COPILOT MULTIAGENTE ---
    const atualizarInfoEMovimentoTriario = (etapaNum, novaInfo, novoMov) => {
        setResultado(prev => {
            if (!prev) return prev;
            const novosCampos = prev.campos.map(c => {
                if (c.etapa === etapaNum) {
                    return { 
                        ...c, 
                        informacao: novaInfo !== undefined ? novaInfo : c.informacao, 
                        movimento: novoMov !== undefined ? novoMov : c.movimento 
                    };
                }
                return c;
            });
            const campoObj = novosCampos.find(c => c.etapa === etapaNum);
            return {
                ...prev,
                campos: novosCampos,
                camposMap: campoObj ? { ...prev.camposMap, [campoObj.campo]: campoObj.informacao } : prev.camposMap
            };
        });
    };

    const atualizarCampoTriario = (nomeCampo, novoValor) => {
        setResultado(prev => {
            if (!prev) return prev;
            const novosCampos = prev.campos.map(c => {
                if (c.campo.toLowerCase() === nomeCampo.toLowerCase() || c.campo === nomeCampo) {
                    return { ...c, informacao: novoValor, movimento: 'Atualizado via Copilot' };
                }
                return c;
            });
            return {
                ...prev,
                campos: novosCampos,
                camposMap: { ...prev.camposMap, [nomeCampo]: novoValor }
            };
        });
        // Marcar campo como editado (confirmado)
        setCamposEditados(prev => new Set([...prev, nomeCampo]));
        const toastEvent = new CustomEvent('showToast', {
            detail: { texto: `Campo "${nomeCampo}" atualizado!`, tipo: 'success' }
        });
        document.dispatchEvent(toastEvent);
    };

    const carregarRascunhoMinuta = (textoMinuta) => {
        localStorage.setItem('rascunhoMinutaCopilot', textoMinuta);
        
        const confirmar = window.confirm('O Copilot gerou um rascunho de minuta para este processo. Deseja abrir a aba do Minutário agora para editá-la?');
        if (confirmar && typeof setCurrentArea === 'function') {
            setCurrentArea('Minutario');
        } else if (!confirmar) {
            console.log('[Copilot] Rascunho salvo no cache local.');
        } else {
            alert('Rascunho salvo no cache! Navegue até a aba do Minutário para carregar.');
        }
    };

    const renderMensagemContent = (msg) => {
        const content = msg.content || '';
        const acoes = [];
        
        // Regex para extrair ações do tipo: [[ACTION: tipo | chave1: "valor1" | chave2: "valor2"]]
        const actionRegex = /\[\[ACTION:\s*(\w+)\s*\|\s*([^\]]+)\]\]/g;
        let match;
        let textoLimpo = content;
        
        while ((match = actionRegex.exec(content)) !== null) {
            const tipo = match[1];
            const paramsStr = match[2];
            const params = {};
            
            const paramPairs = paramsStr.split('|');
            paramPairs.forEach(pair => {
                const parts = pair.split(':');
                if (parts.length >= 2) {
                    const chave = parts[0].trim();
                    let valor = parts.slice(1).join(':').trim();
                    if (valor.startsWith('"') && valor.endsWith('"')) {
                        valor = valor.slice(1, -1);
                    } else if (valor.startsWith("'") && valor.endsWith("'")) {
                        valor = valor.slice(1, -1);
                    }
                    params[chave] = valor;
                }
            });
            
            acoes.push({ tipo, params, rawMatch: match[0] });
            textoLimpo = textoLimpo.replace(match[0], '');
        }
        
        // Limpeza de quebras de linha sobressalentes
        textoLimpo = textoLimpo.replace(/(<br\s*\/?>){3,}/gi, '<br><br>').trim();

        // Renderiza negritos e quebras de linha básicos
        const html = textoLimpo
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black">$1</strong>')
            .replace(/\n/g, '<br>');

        return { textoHtml: html, acoes };
    };
    // --- FIM DOS MÉTODOS DO COPILOT ---

    return (
        <div className="min-h-full">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <span className="material-symbols-rounded text-3xl">psychology</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tjpr-text-main tracking-tight uppercase">Análise de Triagem</h1>
                            <p className="tjpr-text-dim text-xs font-bold tracking-widest uppercase mt-1">IA - Triagem Baseada no TRIARIO & Assistência Copilot</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={carregarHistorico}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-600/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                        >
                            <span className="material-symbols-rounded text-sm">history</span>
                            Histórico
                        </button>
                        {resultado && (
                            <button
                                onClick={() => {
                                    setResultado(null);
                                    setDocumentos([]);
                                    setAgentesResults(null);
                                    setAnaliseId(null);
                                    setChatMessages([]);
                                    setConversaId(null);
                                    setFichaResumo(null);
                                    setOcrScore(null);
                                    setOcrProgresso(null);
                                    setCamposEditados(new Set());
                                    localStorage.removeItem('tjpr_triagem_resultado');
                                    localStorage.removeItem('tjpr_triagem_textoOcr');
                                    localStorage.removeItem('tjpr_triagem_analiseId');
                                    localStorage.removeItem('tjpr_triagem_conversaId');
                                    localStorage.removeItem('tjpr_triagem_chatMessages');
                                    localStorage.removeItem('tjpr_triagem_fichaResumo');
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                            >
                                <span className="material-symbols-rounded text-sm">refresh</span>
                                Nova Triagem
                            </button>
                        )}
                    </div>
                </div>

                {/* Área de Upload (Oculta após o resultado estar pronto para maximizar espaço de trabalho) */}
                {!resultado && (
                    <div className="tjpr-card p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-black tjpr-text-main">Documentos para Análise</h2>
                                <p className="text-sm tjpr-text-dim mt-1">Arraste arquivos ou clique para selecionar (PDF, JPG, PNG)</p>
                            </div>
                            {documentos.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider"
                                >
                                    Limpar Tudo
                                </button>
                            )}
                        </div>

                        {/* Zone de Drop */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
                                ${isDragOver 
                                    ? 'border-indigo-500 bg-indigo-500/10' 
                                    : 'border-white/10 tjpr-bg-alt hover:border-white/20'}
                            `}
                        >
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            
                            <div className="space-y-4">
                                <div className="w-16 h-16 mx-auto bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-rounded text-3xl">upload_file</span>
                                </div>
                                <div>
                                    <p className="text-lg font-bold tjpr-text-main">
                                        {isDragOver ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
                                    </p>
                                    <p className="text-sm tjpr-text-dim mt-2">
                                        Formatos aceitos: PDF, JPG, PNG
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Arquivos */}
                        {documentos.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <h3 className="text-xs font-black tjpr-text-dim uppercase tracking-wider">
                                    {documentos.length} arquivo(s) adicionado(s)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {documentos.map((file, index) => (
                                        <div 
                                            key={index}
                                            className="flex items-center gap-3 p-3 tjpr-bg-alt rounded-xl border border-white/5"
                                        >
                                            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-rounded text-lg">
                                                    {file.type === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold tjpr-text-main truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs tjpr-text-dim">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveDocument(index)}
                                                className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                                            >
                                                <span className="material-symbols-rounded text-lg">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Seletores de Configuração (Modelo IA & Modo de Triagem) */}
                        <div className="mt-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                            <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
                                <div className="flex items-center gap-2.5 w-full md:w-auto">
                                    <label className="text-xs font-black tjpr-text-dim uppercase tracking-wider whitespace-nowrap">
                                        Modelo IA:
                                    </label>
                                    <select
                                        value={modeloSelecionado}
                                        onChange={(e) => setModeloSelecionado(e.target.value)}
                                        disabled={isProcessing}
                                        className="w-full md:w-auto px-4 py-2.5 tjpr-bg-alt border border-white/10 rounded-xl text-xs font-bold tjpr-text-main focus:border-indigo-500 outline-none"
                                    >
                                        <option value="deepseek-v4-flash-free">DeepSeek V4 Flash Free (Recomendado)</option>
                                        <option value="minimax-m2.5-free">MiniMax M2.5 Free</option>
                                        <option value="big-pickle">Big Pickle (Grátis)</option>
                                        <option value="ring-2.6-1t-free">Ring 2.6 1T Free</option>
                                        <option value="nemotron-3-super-free">Nemotron 3 Super Free</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-center gap-2.5 w-full md:w-auto">
                                    <label className="text-xs font-black tjpr-text-dim uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                                        Modo:
                                        <span className="material-symbols-rounded text-xs text-indigo-400 cursor-help" title="🚀 Modo Econômico: 1 única chamada estruturada para a IA (economiza API e evita erro 429). 🤖 Esteira Completa: 13 subagentes sequenciais para análise extremamente profunda.">info</span>
                                    </label>
                                    <select
                                        value={modoTriagem}
                                        onChange={(e) => setModoTriagem(e.target.value)}
                                        disabled={isProcessing}
                                        className="w-full md:w-auto px-4 py-2.5 tjpr-bg-alt border border-white/10 rounded-xl text-xs font-bold tjpr-text-main focus:border-indigo-500 outline-none"
                                    >
                                        <option value="economico">🚀 Modo Econômico (1 Chamada - Rápido & Seguro)</option>
                                        <option value="multiagente">🤖 Esteira Completa (13 Subagentes - Detalhado)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 w-full lg:w-96">
                                <label className="text-xs font-black tjpr-text-dim uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                                    Chave OpenCode:
                                    <span className="material-symbols-rounded text-xs text-indigo-400 cursor-help" title="Chave de API pessoal de contingência para contornar o erro de autenticação HTTP 401. Deixe vazio para usar a chave padrão do servidor.">help</span>
                                </label>
                                <div className="relative flex-1">
                                    <input
                                        type="password"
                                        value={opencodeApiKey}
                                        onChange={(e) => setOpencodeApiKey(e.target.value)}
                                        placeholder="sk-or-..."
                                        disabled={isProcessing}
                                        className="w-full pl-3 pr-10 py-2.5 tjpr-bg-alt border border-white/10 rounded-xl text-xs tjpr-text-main focus:border-indigo-500 outline-none font-mono"
                                    />
                                    {opencodeApiKey && (
                                        <button
                                            onClick={() => setOpencodeApiKey('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-400 rounded transition-all"
                                            title="Limpar chave"
                                        >
                                            <span className="material-symbols-rounded text-xs">close</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Barra de Progresso do OCR */}
                        {ocrProgresso && isProcessing && (
                            <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="animate-spin material-symbols-rounded text-indigo-400 text-base">progress_activity</span>
                                        <p className="text-xs text-indigo-400 font-black uppercase tracking-wider">
                                            {ocrProgresso.tipo === 'ocr' ? `OCR — Página ${ocrProgresso.pagina} de ${ocrProgresso.total}` :
                                             ocrProgresso.tipo === 'texto' ? `Extraindo texto — Pág. ${ocrProgresso.pagina}/${ocrProgresso.total}` :
                                             ocrProgresso.tipo === 'imagem' ? 'Processando imagem com OCR...' :
                                             ocrProgresso.tipo === 'pronto' ? '✅ OCR Concluído' : logProcessamento}
                                        </p>
                                    </div>
                                    <span className="text-xs font-black text-indigo-300">{ocrProgresso.pct}%</span>
                                </div>
                                <div className="w-full bg-indigo-950/60 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                                        style={{ width: `${ocrProgresso.pct}%` }}
                                    />
                                </div>
                                {logProcessamento && (
                                    <p className="text-[10px] text-indigo-400/70 font-medium animate-pulse">{logProcessamento}</p>
                                )}
                            </div>
                        )}
                        {logProcessamento && !ocrProgresso && isProcessing && (
                            <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                                <p className="text-sm text-indigo-400 animate-pulse font-medium">{logProcessamento}</p>
                            </div>
                        )}

                        {/* Botão de Análise */}
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={analisarDocumentos}
                                disabled={documentos.length === 0 || isProcessing}
                                className={`
                                    flex items-center gap-3 px-10 py-4 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl
                                    ${documentos.length === 0 || isProcessing
                                        ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-95'}
                                `}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="animate-spin material-symbols-rounded">sync</span>
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-rounded">psychology</span>
                                        Analisar Documentos
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Erro */}
                        {error && (
                            <div className="mt-6 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-in fade-in duration-300 space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-rounded text-rose-400 mt-0.5 text-xl">error</span>
                                    <div className="space-y-1 flex-1 text-left">
                                        <p className="text-xs font-black text-rose-400 uppercase tracking-wider">Falha na Comunicação da IA</p>
                                        <p className="text-xs font-semibold tjpr-text-main leading-relaxed">{error}</p>
                                    </div>
                                </div>
                                
                                {(error.includes('autenticação') || error.includes('401')) && (
                                    <div className="p-4 bg-black/40 border border-rose-500/20 rounded-xl space-y-3 text-left">
                                        <p className="text-xs font-bold text-rose-300 flex items-center gap-1">
                                            <span className="material-symbols-rounded text-sm">lightbulb</span>
                                            Solução de Contingência Imediata:
                                        </p>
                                        <p className="text-[11px] tjpr-text-dim leading-relaxed">
                                            Você pode contornar esta falha de credenciais inserindo uma chave de API pessoal do OpenCode no campo abaixo. Ela ficará salva de forma segura no seu navegador e será usada nas próximas requisições.
                                        </p>
                                        <div className="flex flex-col sm:flex-row items-center gap-3">
                                            <input
                                                type="password"
                                                value={opencodeApiKey}
                                                onChange={(e) => setOpencodeApiKey(e.target.value)}
                                                placeholder="Insira sua chave sk-or-..."
                                                className="w-full sm:flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs tjpr-text-main focus:border-indigo-500 outline-none font-mono"
                                            />
                                            <button
                                                onClick={() => {
                                                    setError(null);
                                                    analisarDocumentos();
                                                }}
                                                disabled={!opencodeApiKey.trim()}
                                                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-indigo-600/10"
                                            >
                                                Salvar e Tentar Novamente
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Painel de Transparência do OCR em Caso de Falha */}
                        {textoOcrExtraido && (
                            <div className="mt-6 tjpr-card p-5 border border-indigo-500/20 bg-indigo-950/20 rounded-2xl space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-rounded text-indigo-400">visibility</span>
                                        <span className="text-xs font-black tjpr-text-main uppercase tracking-wider">Texto Extraído pelo OCR (Sucesso no Processamento Local)</span>
                                    </div>
                                    <button
                                        onClick={() => setMostrarTextoOcr(!mostrarTextoOcr)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                                    >
                                        <span className="material-symbols-rounded text-xs">
                                            {mostrarTextoOcr ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                                        </span>
                                        {mostrarTextoOcr ? 'Ocultar Texto' : 'Ver Texto Bruto'}
                                    </button>
                                </div>
                                
                                {mostrarTextoOcr && (
                                    <div className="mt-3">
                                        <p className="text-[10px] tjpr-text-dim mb-2 italic">
                                            O OCR local concluiu a leitura com absoluto sucesso. A falha exibida acima ocorreu estritamente na fase de inteligência artificial (comunicação externa com o provedor OpenRouter). Você pode copiar o texto abaixo para uso ou aguardar um minuto antes de tentar novamente.
                                        </p>
                                        <textarea
                                            readOnly
                                            value={textoOcrExtraido}
                                            className="w-full h-48 p-3 bg-black/40 border border-white/10 rounded-xl text-xs font-mono tjpr-text-main focus:outline-none resize-none custom-scrollbar"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* --- SEÇÃO DE DUAS COLUNAS (RESULTADOS & COPILOT SIDEBAR) --- */}
                {resultado && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        
                        {/* Coluna da Esquerda (2/3) - Metadados TRIARIO Extraídos */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Badge Score OCR */}
                            {ocrScore !== null && (
                                <div className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-bold ${
                                    ocrScore >= 80 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    ocrScore >= 50 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                    'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                }`}>
                                    <span className="material-symbols-rounded text-base">
                                        {ocrScore >= 80 ? 'check_circle' : ocrScore >= 50 ? 'warning' : 'error'}
                                    </span>
                                    <div>
                                        <p className="font-black uppercase tracking-wider text-[10px]">Qualidade OCR</p>
                                        <p className="font-semibold">
                                            {ocrScore >= 80 ? `Excelente (${ocrScore}% de confiança) — Texto extraído com alta fidelidade.` :
                                             ocrScore >= 50 ? `Regular (${ocrScore}% de confiança) — Algumas palavras podem estar incorretas.` :
                                             `Baixa (${ocrScore}% de confiança) — Revise os campos manualmente.`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Painel de Transparência do OCR em Caso de Sucesso */}
                            {textoOcrExtraido && (
                                <div className="tjpr-card p-5 border border-white/5 bg-slate-900/40 rounded-2xl space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-rounded text-indigo-400">visibility</span>
                                            <span className="text-xs font-black tjpr-text-main uppercase tracking-wider">Texto Extraído pelo OCR</span>
                                        </div>
                                        <button
                                            onClick={() => setMostrarTextoOcr(!mostrarTextoOcr)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 tjpr-text-main border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                                        >
                                            <span className="material-symbols-rounded text-xs">
                                                {mostrarTextoOcr ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                                            </span>
                                            {mostrarTextoOcr ? 'Ocultar Texto' : 'Ver Texto Bruto'}
                                        </button>
                                    </div>
                                    
                                    {mostrarTextoOcr && (
                                        <div className="mt-3">
                                            <p className="text-[10px] tjpr-text-dim mb-2 italic">
                                                Este é o texto integral capturado nos documentos anexados pelo mecanismo de OCR local. Você pode utilizá-lo como referência para auditar a extração feita pela IA.
                                            </p>
                                            <textarea
                                                readOnly
                                                value={textoOcrExtraido}
                                                className="w-full h-48 p-3 bg-black/40 border border-white/10 rounded-xl text-xs font-mono tjpr-text-main focus:outline-none resize-none custom-scrollbar"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Grid Temático das Etapas TRIARIO */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                    <div className="text-left">
                                        <h3 className="text-sm font-black tjpr-text-main uppercase tracking-wider flex items-center gap-2">
                                            <span className="material-symbols-rounded text-indigo-400">gavel</span>
                                            Etapas TRIARIO Extraídas
                                        </h3>
                                        <p className="text-[10px] tjpr-text-dim mt-0.5">As 13 etapas da triagem de admissibilidade (etapas de tempestividade tratadas no cálculo de prazos)</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {camposEditados.size > 0 && (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                                <span className="material-symbols-rounded text-[11px]">edit</span>
                                                {camposEditados.size} editado(s)
                                            </span>
                                        )}
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                            13 Etapas Ativas
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4, 6, 7, 12, 13, 14, 15, 16, 17, 18].map(etapaNum => (
                                        <div key={etapaNum} className="h-full">
                                            {renderEtapaCompacta(etapaNum)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ficha de Resumo TJPR (Estilo Word com Borda Dupla) */}
                            {fichaResumo && (
                                <div className="tjpr-card p-5 border border-white/5 space-y-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-white/5 gap-3">
                                        <div>
                                            <h3 className="text-xs font-black tjpr-text-main uppercase tracking-wider flex items-center gap-2">
                                                <span className="material-symbols-rounded text-emerald-400 text-base">content_copy</span>
                                                Ficha de Resumo TJPR (Word / Projudi)
                                            </h3>
                                            <p className="text-[9px] tjpr-text-dim mt-0.5">Edite os campos diretamente na tabela abaixo e copie para Word/Projudi</p>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                                            <button
                                                onClick={copiarFichaRichText}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-emerald-600/10"
                                            >
                                                <span className="material-symbols-rounded text-sm">copy_all</span>
                                                Copiar (Word)
                                            </button>
                                            <button
                                                onClick={exportarFichaPdf}
                                                disabled={exportandoPdf}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-rounded text-sm">
                                                    {exportandoPdf ? 'hourglass_empty' : 'picture_as_pdf'}
                                                </span>
                                                {exportandoPdf ? 'Gerando...' : 'Exportar PDF'}
                                            </button>
                                            <button
                                                onClick={copiarFichaTextoPlano}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                                            >
                                                <span className="material-symbols-rounded text-sm">content_copy</span>
                                                Texto
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Deseja restaurar os valores originais da ficha? Suas edições serão perdidas.')) {
                                                        localStorage.removeItem('tjpr_triagem_fichaResumo');
                                                        setResultado({ ...resultado });
                                                    }
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-all"
                                                title="Restaurar Valores"
                                            >
                                                <span className="material-symbols-rounded text-sm">undo</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Visual da Tabela Clássica do Word com Borda Dupla */}
                                    <div className="flex justify-center p-3 bg-black/35 rounded-2xl border border-white/5 overflow-x-auto">
                                        <div ref={fichaRef} className="w-full max-w-[460px] min-w-[280px] font-serif text-slate-900 bg-white p-3 rounded-lg shadow-inner">
                                            <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: '"Times New Roman", Times, serif', fontSize: '13px', border: '3px double #000000', backgroundColor: '#ffffff', color: '#000000' }}>
                                                <tbody>
                                                    {/* Linha 1: Câmara Cível | Data */}
                                                    <tr>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', width: '50%', textAlign: 'left' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                <span style={{ whiteSpace: 'nowrap' }}>Nome &ndash;</span>
                                                                <input
                                                                    type="text"
                                                                    value={fichaResumo.camara}
                                                                    onChange={(e) => setFichaResumo(prev => ({ ...prev, camara: e.target.value }))}
                                                                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#ef4444', fontFamily: 'inherit', fontSize: 'inherit', padding: '0px' }}
                                                                    placeholder="Ex: 9ª Câmara Cível"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', width: '50%', backgroundColor: '#e2e8f0', textAlign: 'center' }}>
                                                            <input
                                                                type="text"
                                                                value={fichaResumo.dataDecisao}
                                                                onChange={(e) => setFichaResumo(prev => ({ ...prev, dataDecisao: e.target.value }))}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#000000', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center', padding: '0px' }}
                                                                placeholder="Ex: 12/03/2025"
                                                            />
                                                        </td>
                                                    </tr>
                                                    {/* Tempestivo */}
                                                    <tr>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>Tempestivo</td>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'center' }}>
                                                            <input
                                                                type="text"
                                                                value={fichaResumo.tempestivo}
                                                                onChange={(e) => setFichaResumo(prev => ({ ...prev, tempestivo: e.target.value }))}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#000000', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center', padding: '0px' }}
                                                                placeholder="Sim ou Não"
                                                            />
                                                        </td>
                                                    </tr>
                                                    {/* Contrarrazões */}
                                                    <tr>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>Contrarrazões</td>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'center' }}>
                                                            <input
                                                                type="text"
                                                                value={fichaResumo.contrarrazoes}
                                                                onChange={(e) => setFichaResumo(prev => ({ ...prev, contrarrazoes: e.target.value }))}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#000000', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center', padding: '0px' }}
                                                                placeholder="Mov. X.X"
                                                            />
                                                        </td>
                                                    </tr>
                                                    {/* Ministério Público? */}
                                                    <tr>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>Ministério Público?</td>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'center' }}>
                                                            <input
                                                                type="text"
                                                                value={fichaResumo.mp}
                                                                onChange={(e) => setFichaResumo(prev => ({ ...prev, mp: e.target.value }))}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#000000', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center', padding: '0px' }}
                                                                placeholder="não ou sim"
                                                            />
                                                        </td>
                                                    </tr>
                                                    {/* GRU */}
                                                    <tr>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>GRU:</td>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'center' }}>
                                                            <input
                                                                type="text"
                                                                value={fichaResumo.gru}
                                                                onChange={(e) => setFichaResumo(prev => ({ ...prev, gru: e.target.value }))}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#000000', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center', padding: '0px' }}
                                                                placeholder="Preparo / Justiça Gratuita"
                                                            />
                                                        </td>
                                                    </tr>
                                                    {/* Funjus */}
                                                    <tr>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>Funjus:</td>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'center' }}>
                                                            <input
                                                                type="text"
                                                                value={fichaResumo.funjus}
                                                                onChange={(e) => setFichaResumo(prev => ({ ...prev, funjus: e.target.value }))}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#000000', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center', padding: '0px' }}
                                                                placeholder="Custas / Funjus"
                                                            />
                                                        </td>
                                                    </tr>
                                                    {/* Procuração */}
                                                    <tr>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>Procuração:</td>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'center' }}>
                                                            <textarea
                                                                rows={2}
                                                                value={fichaResumo.procuracao}
                                                                onChange={(e) => setFichaResumo(prev => ({ ...prev, procuracao: e.target.value }))}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#000000', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center', resize: 'none', padding: '0px' }}
                                                                placeholder="Procuração / Substabelecimento"
                                                            />
                                                        </td>
                                                    </tr>
                                                    {/* Exclusividade na intimação? */}
                                                    <tr>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>Exclusividade na intimação?</td>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'center' }}>
                                                            <textarea
                                                                rows={2}
                                                                value={fichaResumo.exclusividade}
                                                                onChange={(e) => setFichaResumo(prev => ({ ...prev, exclusividade: e.target.value }))}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#000000', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center', resize: 'none', padding: '0px' }}
                                                                placeholder="Nomes dos advogados"
                                                            />
                                                        </td>
                                                    </tr>
                                                    {/* Decisão Colegiada? */}
                                                    <tr>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>Decisão colegiada?</td>
                                                        <td style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'center' }}>
                                                            <input
                                                                type="text"
                                                                value={fichaResumo.decisaoColegiada}
                                                                onChange={(e) => setFichaResumo(prev => ({ ...prev, decisaoColegiada: e.target.value }))}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#000000', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center', padding: '0px' }}
                                                                placeholder="sim ou não"
                                                            />
                                                        </td>
                                                    </tr>
                                                    {/* Observações */}
                                                    <tr>
                                                        <td colSpan={2} style={{ border: '3px double #000000', padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>
                                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3px' }}>
                                                                <span>OBS:</span>
                                                                <textarea
                                                                    rows={2}
                                                                    value={fichaResumo.obs}
                                                                    onChange={(e) => setFichaResumo(prev => ({ ...prev, obs: e.target.value }))}
                                                                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#000000', fontFamily: 'inherit', fontSize: 'inherit', resize: 'none', padding: '0px' }}
                                                                    placeholder="// Observações"
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resumo de Vícios e Inconsistências */}
                            {resultado.resumo && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* Lista de Vícios Identificados */}
                                    <div className="tjpr-card p-6 border border-white/5">
                                        <h4 className="text-xs font-black tjpr-text-dim uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                                            <span className="material-symbols-rounded text-rose-400 text-sm">warning</span>
                                            Vícios de Admissibilidade ({resultado.resumo.vicios.length})
                                        </h4>
                                        {resultado.resumo.vicios.length === 0 ? (
                                            <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                                <span className="material-symbols-rounded text-sm">check_circle</span>
                                                Nenhum vício formal crítico localizado preliminarmente.
                                            </p>
                                        ) : (
                                            <ul className="space-y-2.5">
                                                {resultado.resumo.vicios.map((v, vIdx) => (
                                                    <li key={vIdx} className="p-3 bg-rose-500/5 hover:bg-rose-500/10 transition-colors border border-rose-500/10 rounded-xl text-xs flex gap-2">
                                                        <span className="text-rose-400 font-bold">⚠️</span>
                                                        <span className="tjpr-text-dim font-medium">{v.descricao}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Parecer MP e Inconsistências */}
                                    <div className="tjpr-card p-6 border border-white/5 space-y-4">
                                        <div>
                                            <h4 className="text-xs font-black tjpr-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <span className="material-symbols-rounded text-indigo-400 text-sm">policy</span>
                                                Intervenção do Ministério Público
                                            </h4>
                                            {resultado.resumo.mpLocalizado !== undefined ? (
                                                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                                                    resultado.resumo.mpLocalizado
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold'
                                                        : 'bg-slate-700/30 border-white/5 tjpr-text-dim font-medium'
                                                }`}>
                                                    <span className="text-base">{resultado.resumo.mpLocalizado ? '⭐' : '🔍'}</span>
                                                    <span>
                                                        {resultado.resumo.mpLocalizado 
                                                            ? 'Ministério Público Localizado (Custos Legis)' 
                                                            : 'Intervenção do MP não identificada como prioritária'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-xs tjpr-text-dim italic">Sem informações consolidadas de MP.</p>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-black tjpr-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <span className="material-symbols-rounded text-amber-500 text-sm">sync_problem</span>
                                                Alertas e Inconsistências
                                            </h4>
                                            {resultado.resumo.inconsistencias?.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {resultado.resumo.inconsistencias.map((inc, iIdx) => (
                                                        <li key={iIdx} className="p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg text-xs text-amber-400 flex items-start gap-1.5">
                                                            <span className="material-symbols-rounded text-xs mt-0.5">info</span>
                                                            <span>{inc}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                                    <span className="material-symbols-rounded text-xs">done</span>
                                                    Nenhuma inconsistência lógica entre os subagentes detectada.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Coluna da Direita (1/3) - Copilot Sidebar Premium */}
                        <div className="lg:col-span-1">
                            <div className="tjpr-card overflow-hidden sticky top-6 border border-indigo-500/20 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl bg-slate-900/80 flex flex-col h-[680px]">
                                
                                {/* Header do Copilot */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-indigo-600/5">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 text-white rounded-xl flex items-center justify-center border border-indigo-500/30 shadow-md">
                                                <span className="material-symbols-rounded text-xl animate-pulse">smart_toy</span>
                                            </div>
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full animate-ping"></span>
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full"></span>
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-black tjpr-text-main tracking-tight flex items-center gap-1.5">
                                                TJPR Copilot
                                                <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30">V2</span>
                                            </h2>
                                            <p className="text-[9px] tjpr-text-dim tracking-wider font-semibold">Assistente Multiagente Inteligente</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-rounded text-slate-500 text-lg hover:text-indigo-400 cursor-help" title="Orquestrador inteligente roteia tarefas para subagentes especialistas configurados no Studio.">help_outline</span>
                                </div>

                                {/* Visualizador de Monitoramento do Fluxo Multiagente (Animação de Raciocínio) */}
                                <div className="px-4 py-2.5 bg-black/20 border-b border-white/5 text-[10px] flex items-center justify-between text-indigo-400 font-bold tracking-wide">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                                        Monitoramento do Orquestrador
                                    </span>
                                    <span className="text-[9px] text-slate-500">Status: Aguardando</span>
                                </div>

                                {/* Lista de Mensagens do Chat */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
                                    {chatMessages.length === 0 ? (
                                        <div className="text-center py-12 tjpr-text-dim space-y-3">
                                            <span className="material-symbols-rounded text-4xl block animate-bounce text-slate-700">psychology</span>
                                            <p className="text-xs font-semibold">Análise consolidada! Pergunte-me qualquer detalhe jurídico do processo.</p>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg, idx) => {
                                            const { textoHtml, acoes } = renderMensagemContent(msg);
                                            const isUser = msg.role === 'user';
                                            return (
                                                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in zoom-in-95 duration-200`}>
                                                    <div className="max-w-[90%]">
                                                        {!isUser && msg.agente && (
                                                            <p className="text-[9px] font-black tjpr-text-dim uppercase tracking-widest mb-1 ml-1 flex items-center gap-1">
                                                                <span className="material-symbols-rounded text-[10px] text-indigo-400">
                                                                    {msg.agente === 'Sistema' ? 'settings' : 'shield_person'}
                                                                </span>
                                                                {msg.agente === 'Sistema' ? 'Sistema' : msg.agente}
                                                            </p>
                                                        )}
                                                        <div className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                                                            isUser
                                                                ? 'bg-indigo-600/90 text-white rounded-br-sm border-indigo-500/30 shadow-md shadow-indigo-600/10'
                                                                : msg.agente === 'Sistema'
                                                                    ? 'bg-slate-800/60 tjpr-text-main border-white/5 rounded-bl-sm shadow-sm'
                                                                    : 'bg-slate-800/80 tjpr-text-main border-indigo-500/10 rounded-bl-sm shadow-md'
                                                        }`}>
                                                            <div className="whitespace-pre-wrap font-medium" dangerouslySetInnerHTML={{ __html: textoHtml }} />
                                                            
                                                            {/* Renderizador de Ações Rápidas (Quick Actions Parser) */}
                                                            {acoes.length > 0 && (
                                                                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/5">
                                                                    <p className="text-[8px] font-black uppercase tracking-wider text-indigo-400">Ações Sugeridas pela IA</p>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {acoes.map((acao, aIdx) => {
                                                                            if (acao.tipo === 'preencher_campo') {
                                                                                return (
                                                                                    <button
                                                                                        key={aIdx}
                                                                                        onClick={() => atualizarCampoTriario(acao.params.campo, acao.params.valor)}
                                                                                        className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 rounded-lg text-[9px] font-bold transition-all active:scale-95"
                                                                                    >
                                                                                        <span className="material-symbols-rounded text-[10px]">edit</span>
                                                                                        Preencher {acao.params.campo}
                                                                                    </button>
                                                                                );
                                                                            }
                                                                            if (acao.tipo === 'gerar_minuta') {
                                                                                return (
                                                                                    <button
                                                                                        key={aIdx}
                                                                                        onClick={() => carregarRascunhoMinuta(acao.params.texto)}
                                                                                        className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/30 rounded-lg text-[9px] font-bold transition-all active:scale-95"
                                                                                    >
                                                                                        <span className="material-symbols-rounded text-[10px]">edit_document</span>
                                                                                        Abrir Minuta no Minutário
                                                                                    </button>
                                                                                );
                                                                            }
                                                                            return null;
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    {chatSending && (
                                        <div className="flex justify-start">
                                            <div className="p-3 rounded-2xl bg-slate-800/80 border border-indigo-500/10 rounded-bl-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                                                    <span className="text-[10px] tjpr-text-dim animate-pulse font-semibold">IA processando fluxo...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input e Envio do Copilot */}
                                <div className="p-3 border-t border-white/10 tjpr-bg-alt flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                                            placeholder="Pergunte ou comande a IA (Ex: /minuta)..."
                                            disabled={chatSending}
                                            className="flex-1 px-3 py-2.5 tjpr-bg-main border border-white/10 rounded-xl text-xs tjpr-text-main placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-colors"
                                        />
                                        <button
                                            onClick={sendChatMessage}
                                            disabled={!chatInput.trim() || chatSending}
                                            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 active:scale-95 flex-shrink-0"
                                        >
                                            <span className="material-symbols-rounded text-base">send</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between text-[8px] tjpr-text-dim px-1 font-bold mt-1">
                                        <span>💡 Pergunte sobre prazos, vícios ou minutas</span>
                                        <span>Enter para Enviar</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                )}

                {/* Modal de Detalhes da Etapa TRIARIO */}
                {etapaSelecionada !== null && (() => {
                    const item = resultado?.campos?.find(c => c.etapa === etapaSelecionada);
                    if (!item) return null;
                    const meta = METADADOS_ETAPAS[etapaSelecionada] || { icone: 'folder', desc: '', cor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
                    const isAusente = !item.informacao || item.informacao === '' || item.informacao === 'Não informado' || item.informacao === 'Não encontrado ou não informado';

                    return (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                            <div 
                                className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Cabeçalho da Modal */}
                                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${meta.cor}`}>
                                            <span className="material-symbols-rounded text-lg">{meta.icone}</span>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-black tjpr-text-main uppercase tracking-wider">Etapa {item.etapa} - Detalhes</h3>
                                            <p className="text-[10px] tjpr-text-dim mt-0.5">{item.campo}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setEtapaSelecionada(null)}
                                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-all"
                                    >
                                        <span className="material-symbols-rounded">close</span>
                                    </button>
                                </div>

                                {/* Conteúdo da Modal */}
                                <div className="p-6 space-y-5 overflow-y-auto text-left">
                                    {/* Descrição Jurídica */}
                                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                                            <span className="material-symbols-rounded text-xs">info</span>
                                            O que é essa etapa?
                                        </p>
                                        <p className="text-xs tjpr-text-dim leading-relaxed font-semibold">
                                            {meta.desc}
                                        </p>
                                    </div>

                                    {/* Informação Extraída */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                            Informação Extraída:
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={item.informacao}
                                            onChange={(e) => atualizarInfoEMovimentoTriario(item.etapa, e.target.value, undefined)}
                                            placeholder="Insira o valor do campo..."
                                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-xs tjpr-text-main focus:border-indigo-500 outline-none resize-none font-semibold"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => atualizarInfoEMovimentoTriario(item.etapa, 'Não encontrado ou não informado', undefined)}
                                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-[9px] font-bold tracking-wide uppercase transition-all"
                                            >
                                                Não Encontrado
                                            </button>
                                        </div>
                                    </div>

                                    {/* Movimento Projudi correspondente */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                            Movimento Projudi / Referência:
                                        </label>
                                        <input
                                            type="text"
                                            value={item.movimento || ''}
                                            onChange={(e) => atualizarInfoEMovimentoTriario(item.etapa, undefined, e.target.value)}
                                            placeholder="Ex: Movimento 12.1 ou Petição Inicial"
                                            className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-2xl text-xs tjpr-text-main focus:border-indigo-500 outline-none font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Rodapé da Modal */}
                                <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
                                    <button 
                                        onClick={() => setEtapaSelecionada(null)}
                                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-indigo-600/10"
                                    >
                                        Concluído
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Modal de Histórico de Triagens */}
                {showHistorico && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowHistorico(false)}>
                        <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-indigo-600/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                        <span className="material-symbols-rounded">history</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black tjpr-text-main">Histórico de Triagens</h3>
                                        <p className="text-[10px] tjpr-text-dim">Últimas 20 análises realizadas nesta conta</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowHistorico(false)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-all">
                                    <span className="material-symbols-rounded">close</span>
                                </button>
                            </div>
                            <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
                                {loadingHistorico ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                        <p className="text-sm tjpr-text-dim">Carregando histórico...</p>
                                    </div>
                                ) : historico.length === 0 ? (
                                    <div className="text-center py-12 space-y-3">
                                        <span className="material-symbols-rounded text-4xl text-slate-600 block">history</span>
                                        <p className="text-sm tjpr-text-dim font-semibold">Nenhuma triagem salva encontrada.</p>
                                        <p className="text-xs tjpr-text-dim">As triagens são salvas automaticamente ao analisar documentos.</p>
                                    </div>
                                ) : (
                                    historico.map((item, idx) => {
                                        const data = new Date(item.created_at).toLocaleString('pt-BR');
                                        const nomes = Array.isArray(item.document_names) ? item.document_names.join(', ') : (item.document_names || 'Sem nome');
                                        const temResultado = item.resultado_final?.campos_consolidados?.length > 0;
                                        return (
                                            <div key={item.id || idx} className="flex items-start justify-between gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black tjpr-text-main truncate">{nomes}</p>
                                                    <p className="text-[10px] tjpr-text-dim mt-0.5">{data} · {item.modelo_ia || 'Modelo padrão'}</p>
                                                    {temResultado && (
                                                        <p className="text-[9px] text-emerald-400 mt-1 flex items-center gap-1">
                                                            <span className="material-symbols-rounded text-[10px]">check_circle</span>
                                                            {item.resultado_final.campos_consolidados.length} campos extraídos
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => restaurarTriagem(item)}
                                                    disabled={!temResultado}
                                                    className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    <span className="material-symbols-rounded text-sm">restore</span>
                                                    Restaurar
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Informativo */}
                <div className="text-center p-4 tjpr-bg-alt/30 rounded-2xl border border-white/5">
                    <p className="text-[10px] tjpr-text-dim">
                        Módulo de Triagem Processual Inteligente. Os dados extraídos do Diário Eletrônico devem ser revisados conforme as normas internas.
                    </p>
                </div>

            </div>
        </div>
    );
};

window.TriagemIAPage = TriagemIAPage;