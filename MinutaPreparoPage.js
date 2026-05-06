/**
 * @file MinutaPreparoPage.js
 * Componente do Gerador de Minutas de Preparo Recursal
 */

const { useState, useEffect, useMemo, Fragment } = React;

const STEP_LABELS = {
  inicio: 'Tipo de Recurso',
  classif: 'Classificação do Preparo',
  comp_guia: 'Guia com Irregularidade',
  comp_gru: 'Irregularidade GRU',
  comp_funjus: 'Irregularidade FUNJUS',
  dobro: 'Situação Documental — Dobro',
  dobro_nd: 'Documentos Ausentes/Inválidos',
  desercao: 'Fundamento da Deserção',
  desercao_nd_2pgto: 'Vício — §4º (Ambas)',
  desercao_gru_1pgto: 'Vício — §2º (GRU)',
  desercao_funjus_1pgto: 'Vício — §2º (FUNJUS)',
  intempestivo: 'Natureza da Intempestividade',
  desistencia_jg: 'Desistência de J.G. — Custas em Dobro',
  apos_indeferimento_jg: 'Após Indeferimento de J.G.',
};

const STEP_ICONS = {
  inicio: '⚖️',
  classif: '🗂️',
  comp_guia: '📋',
  comp_gru: '🏛️',
  comp_funjus: '📊',
  dobro: '💰',
  dobro_nd: '📦',
  desercao: '⛔',
  desercao_nd_2pgto: '🚫',
  desercao_gru_1pgto: '🚫',
  desercao_funjus_1pgto: '🚫',
  desercao_intempestivo: '⏰',
  intempestivo: '⏰',
  desistencia_jg: '⚖️',
  apos_indeferimento_jg: '⚖️',
};

function renderMinutaComColchetes(text) {
  if (!text) return null;
  const partes = text.split(/(\[[^\]]+\])/g);
  return partes.map((parte, i) =>
    parte.startsWith('[') && parte.endsWith(']')
      ? React.createElement('span', { key: i, className: 'text-red-600 dark:text-red-400 font-semibold' }, parte)
      : React.createElement(Fragment, { key: i }, parte)
  );
}

const MinutaPreparoPage = () => {
    const [etapaAtual, setEtapaAtual] = useState('inicio');
    const [historico, setHistorico] = useState([]);
    const [finalizado, setFinalizado] = useState(false);
    
    const [minutaFinal, setMinutaFinal] = useState('');
    const [minutaLoading, setMinutaLoading] = useState(false);
    const [copiado, setCopiado] = useState(false);

    const fluxo = window.MINUTA_PREPARO_FLUXO || {};
    const perguntaAtual = fluxo[etapaAtual];

    useEffect(() => {
        if (!finalizado || historico.length === 0) return;
        
        const fetchTemplate = async () => {
            setMinutaLoading(true);
            const lastStep = historico[historico.length - 1];
            
            try {
                if (window._supabaseClient) {
                    const { data, error } = await window._supabaseClient
                        .from('minuta_templates')
                        .select('template_text')
                        .eq('step_key', lastStep.step)
                        .eq('option_text', lastStep.optionText)
                        .maybeSingle();

                    if (error) throw error;
                    
                    if (data && data.template_text) {
                        setMinutaFinal(data.template_text);
                    } else {
                        setMinutaFinal('AINDA SEM REFERENCIA DE MINUTAS');
                    }
                } else {
                    setMinutaFinal('Erro: Banco de dados não conectado.');
                }
            } catch (err) {
                console.error('Erro ao buscar template:', err);
                setMinutaFinal('Erro ao carregar a minuta. Verifique o console.');
            } finally {
                setMinutaLoading(false);
            }
        };

        fetchTemplate();
    }, [finalizado, historico]);

    const handleOptionSelect = (opt) => {
        setHistorico(prev => [
            ...prev,
            { step: etapaAtual, optionText: opt.texto, snippet: opt.snippet }
        ]);
        
        if (opt.proximo === 'final') {
            setFinalizado(true);
        } else {
            setEtapaAtual(opt.proximo);
        }
    };

    const voltar = () => {
        if (historico.length === 0) return;
        const novoHistorico = [...historico];
        const ultimaEtapa = novoHistorico.pop();
        if (ultimaEtapa) {
            setHistorico(novoHistorico);
            setEtapaAtual(ultimaEtapa.step);
            setFinalizado(false);
            setMinutaFinal('');
        }
    };

    const pularParaEtapa = (index) => {
        if (index >= historico.length) return;
        const novoHistorico = historico.slice(0, index);
        const stepClicado = historico[index];
        setHistorico(novoHistorico);
        setEtapaAtual(stepClicado.step);
        setFinalizado(false);
        setMinutaFinal('');
    };

    const reiniciar = () => {
        setEtapaAtual('inicio');
        setHistorico([]);
        setFinalizado(false);
        setCopiado(false);
        setMinutaFinal('');
    };

    const copiarTexto = async () => {
        if (!minutaFinal) return;
        
        // Formatação HTML para manter estrutura ao colar no SEI
        const paragraphs = minutaFinal.split('\n')
            .filter(p => p.trim().length > 0)
            .map(p => `<p class="MsoNormal" style="margin-bottom:0cm;line-height:150%"><span style="font-size:16.0pt;line-height:150%;font-family:&quot;Arial&quot;,sans-serif;color:black">${p}</span></p>`)
            .join('');

        const htmlBlob = new Blob([
            `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="utf-8"></head>
            <body>${paragraphs}</body>
            </html>`
        ], { type: 'text/html' });

        const textBlob = new Blob([minutaFinal], { type: 'text/plain' });

        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': htmlBlob,
                    'text/plain': textBlob
                })
            ]);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
            if (window.showToast) window.showToast('Copiado para a área de transferência!', 'success');
        } catch (err) {
            console.error('Erro ao copiar:', err);
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = minutaFinal;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
            if (window.showToast) window.showToast('Copiado para a área de transferência!', 'success');
        }
    };

    const hasSidebar = historico.length > 0;

    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto h-[calc(100vh-100px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {hasSidebar && (
                <aside aria-label="Caminho de classificação percorrido" className="w-full md:w-80 shrink-0 p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl shadow-lg flex flex-col h-full overflow-y-auto">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="material-icons text-tjpr-gold w-5 h-5 text-base flex items-center justify-center">description</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-tjpr-gold">Caminho percorrido</span>
                    </div>
                    <ol className="space-y-0 flex-1" aria-label="Passos de classificação">
                        {historico.map((h, i) => (
                            <li key={i} className="relative cursor-pointer group" onClick={() => pularParaEtapa(i)}>
                                {/* Linha vertical conectando os nós, não aparece no último item a menos que esteja finalizado */}
                                {(i < historico.length - 1 || finalizado) && (
                                    <span className="absolute left-[17px] top-[36px] bottom-0 w-px bg-slate-200 dark:bg-[rgba(144,169,201,0.25)]" aria-hidden="true"></span>
                                )}
                                <div className="flex items-start gap-3 pb-4">
                                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-base border font-semibold mt-0.5 bg-slate-50 dark:bg-[rgba(144,169,201,0.12)] border-slate-200 dark:border-[rgba(144,169,201,0.25)] text-slate-500 dark:text-[#90a9c9] group-hover:border-tjpr-gold group-hover:text-tjpr-gold transition-colors" aria-hidden="true">
                                        {STEP_ICONS[h.step] || '⚖️'}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <p className="text-[0.68rem] font-semibold uppercase tracking-wider mb-0.5 truncate text-slate-500 dark:text-[#90a9c9] group-hover:text-tjpr-gold transition-colors">
                                            {STEP_LABELS[h.step] || h.step}
                                        </p>
                                        <p className="text-[0.84rem] leading-snug font-medium text-slate-800 dark:text-gray-100 group-hover:text-tjpr-gold transition-colors">
                                            {h.optionText}
                                        </p>
                                    </div>
                                    <span className="material-icons text-[rgba(144,169,201,0.4)] group-hover:text-tjpr-gold text-base mt-1 transition-colors">chevron_right</span>
                                </div>
                            </li>
                        ))}
                        {finalizado && (
                            <li className="mt-1 flex items-center gap-2 px-3 py-2 border border-green-800/50 bg-green-900/20 text-green-400 rounded">
                                <span className="material-icons text-sm">check_circle</span>
                                <span className="text-xs font-semibold">Minuta gerada com sucesso</span>
                            </li>
                        )}
                    </ol>
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                        <button onClick={reiniciar} className="flex-1 py-2 px-4 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            <span className="material-icons text-sm">refresh</span>
                            Reiniciar
                        </button>
                    </div>
                </aside>
            )}

            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-full">
                
                {!finalizado ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
                        <div className="max-w-2xl w-full">
                            <div className="text-center mb-10">
                                <span className="text-5xl mb-6 block">{STEP_ICONS[etapaAtual] || '❓'}</span>
                                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                    {perguntaAtual?.pergunta || 'Pergunta não encontrada'}
                                </h1>
                            </div>

                            <div className="space-y-3">
                                {perguntaAtual?.opcoes?.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleOptionSelect(opt)}
                                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 group flex items-center justify-between"
                                    >
                                        <span className="text-lg font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                                            {opt.texto}
                                        </span>
                                        <span className="material-icons text-slate-400 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-transform">
                                            arrow_forward
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <span className="material-icons text-green-500">check_circle</span>
                                    Minuta Gerada
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Revise o texto abaixo e copie para o SEI
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={voltar}
                                    className="px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-icons text-sm">arrow_back</span>
                                    Voltar
                                </button>
                                <button
                                    onClick={copiarTexto}
                                    disabled={minutaLoading || !minutaFinal}
                                    className={`px-6 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                                        copiado 
                                            ? 'bg-green-500 hover:bg-green-600' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                                    }`}
                                >
                                    <span className="material-icons text-sm">
                                        {copiado ? 'done' : 'content_copy'}
                                    </span>
                                    {copiado ? 'Copiado!' : 'Copiar Texto'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-800/50">
                            {minutaLoading ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <p className="mt-4 text-slate-500 font-medium">Buscando modelo da minuta...</p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 max-w-4xl mx-auto">
                                    <div className="prose dark:prose-invert max-w-none font-serif text-[16pt] leading-relaxed whitespace-pre-wrap text-black dark:text-slate-100">
                                        {renderMinutaComColchetes(minutaFinal)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

window.MinutaPreparoPage = MinutaPreparoPage;
