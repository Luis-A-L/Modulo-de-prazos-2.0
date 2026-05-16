const { useState, useCallback } = React;

const TriagemIAPage = () => {
    const [documentos, setDocumentos] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [modeloSelecionado, setModeloSelecionado] = useState('deepseek-v4-flash-free');
    const [logProcessamento, setLogProcessamento] = useState('');
    const [mostrarRespostaRaw, setMostrarRespostaRaw] = useState(false);

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
    }, []);

    const handleFileSelect = useCallback((e) => {
        const files = Array.from(e.target.files).filter(file => {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            return validTypes.includes(file.type);
        });
        
        setDocumentos(prev => [...prev, ...files]);
        setResultado(null);
        setError(null);
    }, []);

    const handleRemoveDocument = useCallback((index) => {
        setDocumentos(prev => prev.filter((_, i) => i !== index));
        setResultado(null);
    }, []);

    const handleClearAll = useCallback(() => {
        setDocumentos([]);
        setResultado(null);
        setError(null);
    }, []);

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
                        setLogProcessamento(`📄 Lendo PDF "${nome}"...`);
                        const arrayBuffer = await readFileAsArrayBuffer(file);
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                        setLogProcessamento(`📄 ${nome}: ${pdf.numPages} página(s) encontrada(s)`);
                        let fullText = '';

                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items.map(item => item.str).join(' ');

                            if (pageText.trim().length > 100) {
                                fullText += pageText.trim() + '\n\n';
                            } else {
                                setLogProcessamento(`🔍 ${nome}: OCR na página ${i}/${pdf.numPages}...`);
                                const viewport = page.getViewport({ scale: 2 });
                                const canvas = document.createElement('canvas');
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;
                                const ctx = canvas.getContext('2d');
                                await page.render({ canvasContext: ctx, viewport }).promise;

                                const result = await Tesseract.recognize(canvas, 'por', {
                                    logger: (m) => {
                                        if (m.status === 'recognizing text') {
                                            setLogProcessamento(`🔍 ${nome} OCR pág ${i}: ${Math.round(m.progress * 100)}%`);
                                        }
                                    }
                                });
                                fullText += result.data.text.trim() + '\n\n';
                            }
                        }

                        conteudo = fullText.trim() || '(Nenhum texto extraído)';
                        setLogProcessamento(`✅ ${nome}: ${conteudo.length} caracteres extraídos`);
                    } else {
                        setLogProcessamento(`🖼️ ${nome}: aplicando OCR...`);
                        const result = await Tesseract.recognize(file, 'por', {
                            logger: (m) => {
                                if (m.status === 'recognizing text') {
                                    setLogProcessamento(`🔍 OCR ${nome}: ${Math.round(m.progress * 100)}%`);
                                }
                            }
                        });
                        conteudo = result.data.text.trim() || '(Nenhum texto extraído)';
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

            const MODELO = modeloSelecionado;
            setLogProcessamento('📤 Enviando documentos para análise...');

            // Prompt do sistema baseado nas Etapas do TRIARIO
            const SYSTEM_PROMPT = `Você é um ANALISTA JURÍDICO SÊNIOR especializado em triagem de admissibilidade recursal no TJPR. Sua função é executar as ETAPAS DO TRIARIO em documentos processuais e gerar relatório completo.

## REGRAS FUNDAMENTAIS
1. NUNCA invente dados. Use "Não informado" para dados ausentes.
2. Use EXCLUSIVAMENTE números de movimento (Mov. X.X), nunca datas.
3. NUNCA abrevie nomes - transcreva COMPLETOS.
4. Seja EXAUSTIVO na busca por cada informação.

## ETAPAS DO TRIARIO - Protocolo completo de triagem:

### 1. TIPO DO RECURSO
Identificar: Especial (REsp) ou Extraordinário (RE)

### 2. ACORDO
Houve acordo? Sim/Não. Se sim, é válido? Verificar se firmado por todos os recorrentes e recorridos, com procuradores com poderes específicos para transigir.

### 3. DESISTÊNCIA
Houve desistência? Sim/Não. Se sim, é válida? Verificar se manifestada por procurador com poderes específicos para desistir.

### 4. SIGLA PARA MINUTAS
Código interno do triador (quem efetuou a triagem).

### 5. INTERPOSIÇÃO (TEMPESTIVIDADE)
Data da interposição do recurso. Verificar aplicabilidade: recursos cíveis (exceto infância e juventude), contra acórdão intimado a partir de 22/01/2020, na forma do art. 5º da Lei 11.419/2006 (intimação eletrônica).

### 6. DECISÃO RECORRIDA
Colegiada/acórdão ou monocrática/singular.

### 7. CÂMARA
Identificar a Câmara: 1ª a 20ª Câmara Cível, Sessão Cível ou Órgão Especial.

### 8. PRAZO EM ABERTO?
Há prazo em aberto na Câmara de origem? Não considerar prazos para contrarrazões.

### 9. ENVIO DA INTIMAÇÃO (EXPEDIÇÃO)
Data de expedição da intimação.

### 10. CONSULTA ELETRÔNICA ("LEITURA")
Houve consulta eletrônica? Sim/Não + data.

### 11. PRAZO
Simples ou em dobro.

### 12. MULTA (CPC art. 1026, §3º)
Por reiteração de embargos protelatórios. Opções: não / sim, recolhida / sim, não recolhida. Se não recolhida, motivo: Fazenda Pública ou Justiça Gratuita / é o próprio objeto do recurso / não identificado.

### 13. DISPENSA / JUSTIÇA GRATUITA
Recorrente é MP, União, DF, Estado, Município ou autarquia? Opções:
- 01/05 - Não invocada (comprovação de preparo)
- 02/05 - Já é ou afirma ser beneficiário (deferida expressamente? Movimento? Requerida anteriormente? Ato incompatível?)
- 03/05 - Requer no recurso em análise
- 04/05 - É o próprio objeto do recurso
- 05/05 - Presumida (defensor público, dativo ou NPJ)

### 14. SUBSCRITOR (REPRESENTAÇÃO)
Tipo: 01/04 - Advogado particular / 02/04 - Procurador público / 03/04 - Procurador nomeado / 04/04 - Advogado em causa própria.
Se advogado particular: movimentos da procuração, cadeia completa? Sim/Não. Se não, poderes faltantes ao próprio subscritor ou a outro elo?

### 15. EFEITO SUSPENSIVO?
Não requerido / Requerido no corpo do recurso / Requerido em petição apartada. Se apartada, autuado? Sim/Não.

### 16. EXCLUSIVIDADE NA INTIMAÇÃO
Requerida ou não requerida. Se requerida: cadastrada na aba "partes"? Sim/Não. Advogado regularmente constituído? Sim/Não.

### 17. CONTRARRAZÕES
Apresentadas ou ausentes. Se apresentadas: movimentos. Recorrido(s) intimado(s)? Prazo em aberto? Decurso certificado? Recorrido(s) sem advogado constituído?
Se ausentes: movimentos. Recorrido(s) intimado(s)? Prazo em aberto? Decurso certificado? Recorrido(s) sem advogado constituído?

### 18. CASO DE INTERVENÇÃO DO MINISTÉRIO PÚBLICO
(CPC, art. 178) - Interesse público/social, interesse de incapaz, litígios coletivos pela posse de terra.
Sim/Não. Se sim: manifestação? Sim/Não. Teor: 01/04 - Mera ciência / 02/04 - Pela admissão / 03/04 - Pela inadmissão / 04/04 - Ausência de interesse.
Movimento. Decorreu o prazo? Sim/Não.
Se não: foi remetido ao MP? Sim/Não. Decorreu o prazo? Sim/Não.

## RELATÓRIO DE SAÍDA - Formato obrigatório:

### TABELA PRINCIPAL (campos extraídos)

| Etapa | Campo TRIARIO | Informação Extraída | Movimento |
|-------|--------------|---------------------|-----------|
| 1 | Tipo do Recurso | Especial/Extraordinário | - |
| 2 | Acordo | Sim/Não + Válido? | - |
| 3 | Desistência | Sim/Não + Válida? | - |
| 4 | Sigla | [código do triador] | - |
| 5 | Interposição | [dd/mm/aaaa] | - |
| 6 | Decisão Recorrida | Colegiada/Monocrática | [Mov. X.X] |
| 7 | Câmara | [Nome completo] | - |
| 8 | Prazo em Aberto | Sim/Não | - |
| 9 | Envio da Intimação | [dd/mm/aaaa] | [Mov. X.X] |
| 10 | Consulta Eletrônica | Sim/Não + [dd/mm/aaaa] | - |
| 11 | Prazo | Simples/Em dobro | - |
| 12 | Multa | Não/Recolhida/Não recolhida + Motivo | [Mov. X.X] |
| 13 | Justiça Gratuita | [01/05 a 05/05 + detalhes] | [Mov. X.X] |
| 14 | Subscritor | [Tipo + Nome] + Cadeia completa? | [Mov. X.X] |
| 15 | Efeito Suspensivo | Não requerido/Requerido + Autuado? | [Mov. X.X] |
| 16 | Exclusividade Intimação | Requerida/Não + Cadastrada? | - |
| 17 | Contrarrazões | Apresentadas/Ausentes | [Mov. X.X] |
| 18 | Intervenção MP | Sim/Não + Manifestação + Teor | [Mov. X.X] |

### RESUMO EXECUTIVO
- Vícios formais identificados (se houver)
- ⭐ MP localizado (com movimento e contexto) ou 🔍 MP não encontrado
- Observações relevantes, divergências, alertas`;



            // Limitar tamanho do texto para não estourar token limits
            const TEXTO_MAXIMO = 50000;
            const textoEntradaLimitado = textoEntrada.length > TEXTO_MAXIMO
                ? textoEntrada.slice(0, TEXTO_MAXIMO) + '\n\n[... TEXTO TRUNCADO por limite de caracteres ...]'
                : textoEntrada;

            const USER_PROMPT = `Analise os seguintes documentos processuais com base nas ETAPAS DO TRIARIO e gere o relatório completo conforme o formato especificado (tabela com Etapa, Campo TRIARIO, Informação Extraída, Movimento):\n\n${textoEntradaLimitado}\n\nLembre-se: Execute TODAS as 18 etapas do TRIARIO e preencha cada campo com o maior nível de detalhamento possível. Use "Não informado" quando não encontrar a informação.`;

            const messages = [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: USER_PROMPT }
            ];

            // Chamada via SDK oficial (resolve automaticamente CORS e Headers)
            setLogProcessamento('📡 Enviando requisição para o servidor...');
            
            const { data: responseData, error: fnError } = await window._supabaseClient.functions.invoke('ai-proxy', {
                body: {
                    model: MODELO,
                    messages: messages,
                    temperature: 0.1,
                    max_tokens: 4000
                }
            });

            if (fnError) {
                console.error('Erro Edge Function:', fnError);
                throw new Error(`Erro na API: ${fnError.message || 'Falha na comunicação'}`);
            }

            setLogProcessamento('🤖 Processando resposta da IA...');

            if (!responseData || !responseData.choices || !responseData.choices[0]) {
                console.error('Resposta inválida:', responseData);
                throw new Error('Resposta inválida da IA');
            }

            const respostaIA = responseData.choices[0].message?.content;

            if (!respostaIA) {
                console.error('Sem conteúdo na resposta:', responseData);
                throw new Error('Resposta vazia da IA');
            }

            const parsed = parseRespostaIA(respostaIA);
            setResultado(parsed);
            setLogProcessamento('');
        } catch (err) {
            console.error('Erro ao analisar documentos:', err);
            
            let mensagemErro = err.message;
            
            // Tratar erros específicos da API
            if (err.message.includes('402') || err.message.includes('Payment Required')) {
                mensagemErro = 'Credits insuficientes na API. Verifique seu saldo no OpenRouter.';
            } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                mensagemErro = 'Chave API inválida ou expirada.';
            } else if (err.message.includes('429') || err.message.includes('Too Many Requests')) {
                mensagemErro = 'Limite de requisições excedido. Tente novamente em alguns segundos.';
            } else if (err.message.includes('500') || err.message.includes('Internal Server Error')) {
                mensagemErro = 'Erro no servidor da API. Tente novamente mais tarde.';
            }
            
            setError(mensagemErro);
        } finally {
            setIsProcessing(false);
        }
    }, [documentos, modeloSelecionado, parseRespostaIA]);

    const formatarCampo = (valor) => {
        if (!valor || valor === '' || valor === 'Não informado') {
            return <span className="tjpr-text-dim italic">Não informado</span>;
        }
        return valor;
    };

    return (
        <div className="min-h-full">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                    <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                        <span className="material-symbols-rounded text-3xl">psychology</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tjpr-text-main tracking-tight uppercase">Análise de Triagem</h1>
                        <p className="tjpr-text-dim text-xs font-bold tracking-widest uppercase mt-1">IA - Análise Baseada nas Etapas do TRIARIO</p>
                    </div>
                </div>

                {/* Área de Upload */}
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

                    {/* Seletor de Modelo IA */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                        <label className="text-xs font-bold tjpr-text-dim uppercase tracking-wider">
                            Modelo IA:
                        </label>
                        <select
                            value={modeloSelecionado}
                            onChange={(e) => setModeloSelecionado(e.target.value)}
                            disabled={isProcessing}
                            className="px-4 py-2 tjpr-bg-alt border border-white/10 rounded-xl text-sm tjpr-text-main focus:border-indigo-500 outline-none"
                        >
                            <option value="deepseek-v4-flash-free">DeepSeek V4 Flash Free (Recomendado)</option>
                            <option value="minimax-m2.5-free">MiniMax M2.5 Free</option>
                            <option value="big-pickle">Big Pickle (Grátis)</option>
                            <option value="ring-2.6-1t-free">Ring 2.6 1T Free</option>
                            <option value="nemotron-3-super-free">Nemotron 3 Super Free</option>
                        </select>
                    </div>

                    {/* Log de Processamento */}
                    {logProcessamento && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                            <p className="text-sm text-blue-400 animate-pulse">{logProcessamento}</p>
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
                        <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-rounded text-rose-400">error</span>
                                <p className="text-sm font-medium text-rose-400">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Resultado da Análise */}
                {resultado && (
                    <div className="tjpr-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                <span className="material-symbols-rounded text-2xl">check_circle</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black tjpr-text-main">Resultado da Análise</h2>
                                <p className="text-xs tjpr-text-dim uppercase tracking-wider mt-1">
                                    Análise concluída em {new Date().toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </div>

                        {/* Tabela de Resultados */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-3 text-xs font-black tjpr-text-dim uppercase tracking-wider w-12">#</th>
                                        <th className="text-left py-3 px-3 text-xs font-black tjpr-text-dim uppercase tracking-wider">Etapa TRIARIO</th>
                                        <th className="text-left py-3 px-3 text-xs font-black tjpr-text-dim uppercase tracking-wider">Informação Extraída</th>
                                        <th className="text-left py-3 px-3 text-xs font-black tjpr-text-dim uppercase tracking-wider">Movimento</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {resultado.campos.length > 0 ? resultado.campos.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                            <td className="py-2 px-3 text-xs font-bold tjpr-text-dim">{item.etapa}</td>
                                            <td className="py-2 px-3 font-bold tjpr-text-main whitespace-nowrap">{item.campo}</td>
                                            <td className="py-2 px-3 tjpr-text-dim">{formatarCampo(item.informacao)}</td>
                                            <td className="py-2 px-3 tjpr-text-dim text-xs font-mono">{item.movimento}</td>
                                        </tr>
                                    )) : Object.entries(resultado.camposMap || {}).length > 0 ? (
                                        Object.entries(resultado.camposMap).map(([campo, valor]) => (
                                            <tr key={campo} className="hover:bg-white/5 transition-colors">
                                                <td className="py-2 px-3 text-xs font-bold tjpr-text-dim">-</td>
                                                <td className="py-2 px-3 font-bold tjpr-text-main whitespace-nowrap">{campo}</td>
                                                <td className="py-2 px-3 tjpr-text-dim" colSpan={2}>{formatarCampo(valor)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-center tjpr-text-dim italic">
                                                Nenhum campo foi extraído automaticamente. Verifique a resposta completa da IA abaixo.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Resumo Executivo */}
                        {resultado.resumo && (
                            <div className="mt-8 p-6 tjpr-bg-alt rounded-2xl border border-white/10">
                                <h3 className="text-sm font-black tjpr-text-main uppercase tracking-wider mb-4">Resumo Executivo</h3>
                                
                                {resultado.resumo.vicios.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-rounded text-amber-400">warning</span>
                                            <span className="text-sm font-bold text-amber-400">
                                                {resultado.resumo.vicios.length} vício(s) formal(is) identificado(s)
                                            </span>
                                        </div>
                                        <ul className="space-y-2 ml-7">
                                            {resultado.resumo.vicios.map((vicio, idx) => (
                                                <li key={idx} className="text-sm tjpr-text-dim flex items-start gap-2">
                                                    <span className="text-amber-400 mt-1">•</span>
                                                    <span>
                                                        <strong className="font-bold text-amber-400">{vicio.tipo}:</strong> {vicio.descricao}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-rounded text-emerald-400">verified</span>
                                        <span className="text-sm font-medium text-emerald-400">Nenhum vício formal identificado</span>
                                    </div>
                                )}

                                {/* Indicador MP */}
                                {resultado.resumo.mpLocalizado !== undefined && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        {resultado.resumo.mpLocalizado ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-400 text-lg">⭐</span>
                                                <span className="text-sm font-medium text-emerald-400">Ministério Público localizado</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-amber-400 text-lg">🔍</span>
                                                <span className="text-sm font-medium text-amber-400">Ministério Público não identificado - Necessária verificação manual</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Observações Gerais */}
                        {resultado.observacoes && (
                            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-rounded text-blue-400 mt-0.5">info</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-400 mb-1">Observações</h4>
                                        <p className="text-sm tjpr-text-dim">{resultado.observacoes}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resposta Completa da IA */}
                        {resultado.respostaOriginal && (
                            <div className="mt-6">
                                <button
                                    onClick={() => setMostrarRespostaRaw(!mostrarRespostaRaw)}
                                    className="flex items-center gap-2 px-4 py-2 tjpr-bg-alt border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider tjpr-text-dim hover:tjpr-text-main transition-all"
                                >
                                    <span className="material-symbols-rounded text-lg">
                                        {mostrarRespostaRaw ? 'visibility_off' : 'visibility'}
                                    </span>
                                    {mostrarRespostaRaw ? 'Ocultar' : 'Ver'} Resposta Completa da IA
                                </button>
                                
                                {mostrarRespostaRaw && (
                                    <div className="mt-4 p-4 tjpr-bg-alt border border-white/10 rounded-xl">
                                        <pre className="text-xs tjpr-text-dim whitespace-pre-wrap font-mono overflow-x-auto">
                                            {resultado.respostaOriginal}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Botão para Nova Análise */}
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => { setResultado(null); setDocumentos([]); }}
                                className="flex items-center gap-2 px-6 py-3 tjpr-bg-alt tjpr-text-dim hover:tjpr-text-main border border-white/10 hover:border-white/20 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
                            >
                                <span className="material-symbols-rounded text-lg">refresh</span>
                                Nova Análise
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Informativo */}
                <div className="text-center p-6 tjpr-bg-alt/50 rounded-2xl border border-white/5">
                    <p className="text-xs tjpr-text-dim">
                        Sistema de análise automatizada baseado nas Etapas do TRIARIO do TJPR.
                        Os resultados devem ser conferidos manualmente antes da aplicação.
                    </p>
                </div>
            </div>
        </div>
    );
};

window.TriagemIAPage = TriagemIAPage;