import React, { useEffect, useMemo, useState, Fragment } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { getProfile, signOut, type UserProfile } from './lib/auth';
import { fluxo, Option } from './data/flow';
import { findMinutaByPath } from './data/minutaCatalog';
import { fetchMinutaTemplate, SEM_REFERENCIA } from './data/minutaTemplates';
import { TJPRBadge, TJPRButton, TJPRCard, TJPRHeader } from './components/TJPR';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import ProfilePage from './components/ProfilePage';

type ThemeMode = 'light' | 'dark';
type AppView = 'wizard' | 'admin' | 'profile';

/** Renderiza o texto da minuta com os `[PLACEHOLDERS]` em vermelho. */
function renderMinutaComColchetes(text: string): React.ReactNode {
  const partes = text.split(/(\[[^\]]+\])/g);
  return partes.map((parte, i) =>
    parte.startsWith('[') && parte.endsWith(']')
      ? <span key={i} className="text-red-600 dark:text-red-400 font-semibold">{parte}</span>
      : <Fragment key={i}>{parte}</Fragment>
  );
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const storedTheme = window.localStorage.getItem('theme-mode');
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// ─── Step labels legíveis para o painel lateral ───────────────────────────────
const STEP_LABELS: Record<string, string> = {
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

// ─── Ícone por categoria ──────────────────────────────────────────────────────
const STEP_ICONS: Record<string, string> = {
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

export default function App() {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        getProfile(s.user.id).then(p => setUserProfile(p));
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (s?.user) {
        getProfile(s.user.id).then(p => setUserProfile(p));
      } else {
        setUserProfile(null);
      }
      // Auto-open profile with password reset section when user comes from a password recovery link
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordReset(true);
        setView('profile');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    setUserProfile(null);
    setShowPasswordReset(false);
    reiniciar();
    setView('wizard');
  };

  // ── View (wizard | admin) ───────────────────────────────────────────────────
  const [view, setView] = useState<AppView>('wizard');

  // ── Wizard state ────────────────────────────────────────────────────────────
  const [etapaAtual, setEtapaAtual] = useState('inicio');
  const [historico, setHistorico] = useState<{ step: string; optionText: string; snippet: string }[]>([]);
  const [finalizado, setFinalizado] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [copiado, setCopiado] = useState(false);

  // ── Template assíncrono ─────────────────────────────────────────────────────
  const [minutaFinal, setMinutaFinal] = useState('');
  const [minutaLoading, setMinutaLoading] = useState(false);

  const reduceMotion = useReducedMotion();
  const isDarkMode = theme === 'dark';
  const perguntaAtual = fluxo[etapaAtual];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('theme-mode', theme);
  }, [isDarkMode, theme]);

  // Busca o template no Supabase quando o wizard finaliza
  useEffect(() => {
    if (!finalizado || historico.length === 0) return;
    setMinutaLoading(true);
    const path = historico.map(s => ({ stepKey: s.step, optionText: s.optionText }));
    fetchMinutaTemplate(path).then(template => {
      setMinutaFinal(template.text);
      setMinutaLoading(false);
    });
  }, [finalizado, historico]);

  const toggleDarkMode = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    setSelectedOption(null);
  }, [etapaAtual]);

  const handleOptionSelect = (opt: Option) => {
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

  const reiniciar = () => {
    setEtapaAtual('inicio');
    setHistorico([]);
    setFinalizado(false);
    setCopiado(false);
    setMinutaFinal('');
  };

  // Mantido para compatibilidade com painel lateral
  const minutaSelecionada = useMemo(
    () => findMinutaByPath(historico.map(s => ({ step: s.step, optionText: s.optionText }))),
    [historico]
  );
  void minutaSelecionada; // usado apenas para manter o histórico legível

  const copiarTexto = async () => {
    if (!minutaFinal) return;

    // Word-optimized HTML with MSO namespaces to force Arial 16pt
    const paragraphs = minutaFinal
      .split('\n')
      .map(line => {
        const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return line.trim()
          ? `<p class=MsoNormal><span style='font-family:"Arial",sans-serif;font-size:12.0pt;mso-bidi-font-size:12.0pt'>${escaped}</span></p>`
          : `<p class=MsoNormal><span style='font-family:"Arial",sans-serif;font-size:12.0pt;mso-bidi-font-size:12.0pt'>&nbsp;</span></p>`;
      })
      .join('\n');

    const htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<style>
@font-face{font-family:"Arial";mso-font-charset:0;mso-generic-font-family:swiss;}
p.MsoNormal, li.MsoNormal, div.MsoNormal{
  mso-style-unhide:no;
  mso-style-qformat:yes;
  margin:0cm;
  font-size:12.0pt;
  mso-bidi-font-size:12.0pt;
  font-family:"Arial",sans-serif;
  mso-fareast-font-family:"Arial";
  mso-bidi-font-family:"Arial";
  line-height:150%;
}
</style>
</head>
<body lang=PT-BR style='tab-interval:35.4pt;word-wrap:break-word'>
${paragraphs}
</body>
</html>`;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([minutaFinal], { type: 'text/plain' }),
        }),
      ]);
    } catch {
      // Fallback for older browsers
      await navigator.clipboard.writeText(minutaFinal);
    }

    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const questionMotionProps = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3, ease: 'easeOut' as const } };

  const resultMotionProps = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } };

  const pathItemMotion = (index: number) =>
    reduceMotion
      ? {}
      : { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.07, duration: 0.25 } };

  // ── Loading inicial de sessão ────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'app-shell-dark' : 'app-shell-light'}`}>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Verificando sessão…</p>
      </div>
    );
  }

  // ── Não autenticado ─────────────────────────────────────────────────────────
  if (!session) {
    return <LoginPage isDarkMode={isDarkMode} />;
  }

  // ── Painel Admin ─────────────────────────────────────────────────────────────
  if (view === 'admin' && userProfile?.role === 'admin') {
    return (
      <AdminPanel
        isDarkMode={isDarkMode}
        onClose={() => setView('wizard')}
      />
    );
  }

  // ── Perfil do Usuário ───────────────────────────────────────────────────────
  if (view === 'profile' && userProfile) {
    return (
      <ProfilePage
        isDarkMode={isDarkMode}
        userProfile={userProfile}
        sessionEmail={session.user.email ?? ''}
        sessionCreatedAt={session.user.created_at}
        sessionLastSignIn={session.user.last_sign_in_at}
        onClose={() => {
          setView('wizard');
          setShowPasswordReset(false);
        }}
        onProfileUpdated={(updated) => setUserProfile(updated)}
        showPasswordReset={showPasswordReset}
      />
    );
  }

  // ─── Header user data ─────────────────────────────────────────────────────────
  const headerUser = {
    displayName: userProfile?.full_name ?? session.user.email?.split('@')[0] ?? 'Usuário',
    email: session.user.email ?? '',
    avatarColor: '#1B263B',
  };

  // ─── Renderização principal ──────────────────────────────────────────────────
  const hasSidebar = historico.length > 0;

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'app-shell-dark text-white' : 'app-shell-light text-tjpr-gray-900'}`}>
      <TJPRHeader
        user={headerUser}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        onOpenProfile={() => setView('profile')}
      />

      {/* Botão Admin (visível apenas para admins) */}
      {userProfile?.role === 'admin' && (
        <div className={`px-6 py-2 flex justify-end border-b ${isDarkMode ? 'border-[rgba(144,169,201,0.12)] bg-[rgba(0,0,0,0.2)]' : 'border-[rgba(27,38,59,0.08)] bg-[rgba(27,38,59,0.02)]'}`}>
          <TJPRButton
            variant="ghost"
            size="sm"
            onClick={() => setView('admin')}
          >
            ⚙️ Painel Administrativo
          </TJPRButton>
        </div>
      )}

      <main
        id="conteudo-principal"
        className="flex-1 flex flex-col items-center p-6 md:p-12 relative overflow-hidden"
        tabIndex={-1}
      >
        <div className="watermark-overlay">TJPR</div>

        <div className="max-w-6xl w-full relative z-10">
          {/* Hero */}
          <div className={`mb-8 text-center app-hero-panel mx-auto ${isDarkMode ? 'app-hero-panel-dark' : 'app-hero-panel-light'}`}>
            <div className={`hero-kicker ${isDarkMode ? 'hero-kicker-dark' : 'hero-kicker-light'}`}>
              Triagem de preparo recursal
            </div>
            <h1 className="text-[clamp(1.875rem,1.55rem+1.4vw,2.5rem)] leading-tight font-bold text-tjpr-navy-900 dark:text-white mb-2">
              Gerador de Minutas
            </h1>
            <p className="text-[clamp(1rem,0.97rem+0.2vw,1.0625rem)] text-tjpr-gray-700 dark:text-gray-300">
              Sistema auxiliar para elaboração de documentos processuais
            </p>
          </div>

          {/* Layout: sidebar + conteúdo principal */}
          <div className={`flex gap-6 items-start transition-all duration-300 ${hasSidebar ? 'flex-col lg:flex-row' : 'flex-col'}`}>

            {/* ── PAINEL LATERAL: Caminho percorrido ──────────────────────────── */}
            <AnimatePresence>
              {hasSidebar && (
                <motion.aside
                  key="trail-panel"
                  initial={reduceMotion ? false : { opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                  aria-label="Caminho de classificação percorrido"
                  className={`
                    w-full lg:w-72 xl:w-80 shrink-0
                    p-5 border
                    ${isDarkMode
                      ? 'trail-panel-dark'
                      : 'trail-panel-light'}
                  `}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <FileText className="w-4 h-4 text-tjpr-gold shrink-0" aria-hidden />
                    <span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-tjpr-gold' : 'text-tjpr-navy-800'}`}>
                      Caminho percorrido
                    </span>
                  </div>

                  <ol className="space-y-0" aria-label="Passos de classificação">
                    {historico.map((item, idx) => (
                      <motion.li
                        key={idx}
                        {...pathItemMotion(idx)}
                        className="relative"
                      >
                        {/* Linha vertical conectora */}
                        {idx < historico.length - 1 && (
                          <span
                            className={`absolute left-[17px] top-[36px] bottom-0 w-px ${isDarkMode ? 'bg-[rgba(144,169,201,0.25)]' : 'bg-[rgba(27,38,59,0.22)]'}`}
                            aria-hidden
                          />
                        )}

                        <div className="flex items-start gap-3 pb-4">
                          {/* Ícone / nº do passo */}
                          <div
                            className={`
                              flex-shrink-0 w-9 h-9 flex items-center justify-center text-base
                              border font-semibold mt-0.5
                              ${finalizado && idx === historico.length - 1
                                ? isDarkMode
                                  ? 'bg-tjpr-gold/20 border-tjpr-gold/50 text-tjpr-gold'
                                  : 'bg-amber-100 border-amber-300 text-amber-700'
                                : isDarkMode
                                  ? 'bg-[rgba(144,169,201,0.12)] border-[rgba(144,169,201,0.25)] text-[#90a9c9]'
                                  : 'bg-[rgba(27,38,59,0.06)] border-[rgba(27,38,59,0.12)] text-tjpr-navy-700'
                              }
                            `}
                            aria-hidden
                          >
                            {STEP_ICONS[item.step] ?? (idx + 1)}
                          </div>

                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className={`text-[0.68rem] font-semibold uppercase tracking-wider mb-0.5 truncate ${isDarkMode ? 'text-[#90a9c9]' : 'text-tjpr-navy-800'}`}>
                              {STEP_LABELS[item.step] ?? `Passo ${idx + 1}`}
                            </p>
                            <p className={`text-[0.84rem] leading-snug font-medium ${isDarkMode ? 'text-gray-100' : 'text-tjpr-gray-900'}`}>
                              {item.optionText}
                            </p>
                          </div>

                          {idx < historico.length - 1 && (
                            <ChevronRight className={`shrink-0 w-4 h-4 mt-1 ${isDarkMode ? 'text-[rgba(144,169,201,0.4)]' : 'text-tjpr-navy-700'}`} aria-hidden />
                          )}
                        </div>
                      </motion.li>
                    ))}

                    {/* Passo atual (em andamento) */}
                    {!finalizado && (
                      <motion.li
                        key="current"
                        {...pathItemMotion(historico.length)}
                        className="flex items-start gap-3"
                      >
                        <div
                          className={`
                            flex-shrink-0 w-9 h-9 flex items-center justify-center text-sm
                            border-2 font-bold mt-0.5
                            ${isDarkMode
                              ? 'border-tjpr-gold bg-tjpr-gold/10 text-tjpr-gold'
                              : 'border-tjpr-navy-800 bg-tjpr-navy-800/8 text-tjpr-navy-800'}
                          `}
                          aria-current="step"
                        >
                          {historico.length + 1}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className={`text-[0.68rem] font-semibold uppercase tracking-wider mb-0.5 ${isDarkMode ? 'text-tjpr-gold' : 'text-tjpr-navy-800'}`}>
                            {STEP_LABELS[etapaAtual] ?? `Passo ${historico.length + 1}`}
                          </p>
                          <p className={`text-[0.78rem] italic ${isDarkMode ? 'text-[rgba(144,169,201,0.6)]' : 'text-tjpr-gray-700'}`}>
                            Em classificação…
                          </p>
                        </div>
                      </motion.li>
                    )}

                    {/* Confirmação de chegada */}
                    {finalizado && (
                      <motion.li
                        key="done"
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`
                          mt-1 flex items-center gap-2 px-3 py-2 border
                          ${isDarkMode
                            ? 'border-green-800/50 bg-green-900/20 text-green-400'
                            : 'border-green-300 bg-green-50 text-green-700'}
                        `}
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden />
                        <span className="text-xs font-semibold">Minuta gerada com sucesso</span>
                      </motion.li>
                    )}
                  </ol>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* ── ÁREA PRINCIPAL ───────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {!finalizado ? (
                  <motion.div key={etapaAtual} {...questionMotionProps}>
                    <TJPRCard
                      className={`w-full shadow-lg ${isDarkMode ? 'question-card-dark' : 'question-card-light'}`}
                      aria-live="polite"
                    >
                      <div className="mb-6 flex items-center justify-between gap-4">
                        <TJPRBadge variant={isDarkMode ? 'info' : 'default'} icon="linear_scale">
                          Passo {historico.length + 1}
                        </TJPRBadge>
                      </div>

                      <fieldset className="mb-8">
                        <legend className="text-[clamp(1.25rem,1.15rem+0.5vw,1.5rem)] leading-tight font-semibold text-tjpr-navy-800 dark:text-white mb-8 border-l-4 border-tjpr-gold pl-4">
                          {perguntaAtual.pergunta}
                        </legend>

                        <div className="space-y-4">
                          {perguntaAtual.opcoes.map((opt, index) => {
                            const isSelected = selectedOption?.texto === opt.texto;
                            const optionStateClass = isSelected
                              ? isDarkMode ? 'choice-card-dark-selected' : 'choice-card-light-selected'
                              : isDarkMode ? 'choice-card-dark' : 'choice-card-light';

                            return (
                              <label
                                key={index}
                                className={`
                                  flex items-center p-4 rounded-none border cursor-pointer
                                  transition-colors duration-200
                                  ${optionStateClass}
                                  focus-within:outline-none focus-within:ring-2
                                  focus-within:ring-tjpr-gold focus-within:ring-offset-2
                                  focus-within:ring-offset-[#f7f4ee] dark:focus-within:ring-offset-[#101b2b]
                                `}
                              >
                                <input
                                  type="radio"
                                  name={`pergunta-${etapaAtual}`}
                                  className="sr-only"
                                  aria-label={opt.texto}
                                  checked={isSelected}
                                  onChange={() => {
                                    setSelectedOption(opt);
                                    handleOptionSelect(opt);
                                  }}
                                />
                                <div
                                  className={`
                                    w-[20px] h-[20px] border-2 mr-4 flex items-center justify-center transition-colors shrink-0
                                    ${isSelected
                                      ? 'border-tjpr-navy-800 dark:border-tjpr-gold bg-tjpr-navy-800 dark:bg-tjpr-gold'
                                      : 'border-tjpr-navy-700 dark:border-gray-400 bg-transparent'}
                                  `}
                                >
                                  {isSelected && (
                                    <div className={`w-[9px] h-[9px] rounded-none ${isDarkMode ? 'bg-[#0D1B2A]' : 'bg-white'}`} />
                                  )}
                                </div>
                                <span className="text-[clamp(1rem,0.97rem+0.2vw,1.125rem)] leading-normal font-medium text-tjpr-gray-900 dark:text-gray-100">
                                  {opt.texto}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>

                      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-start gap-3 pt-6 border-t border-[rgba(27,38,59,0.1)] dark:border-[rgba(144,169,201,0.2)]">
                        <TJPRButton
                          variant="ghost"
                          onClick={voltar}
                          disabled={historico.length === 0}
                          icon="arrow_back"
                          className="w-full sm:w-auto"
                        >
                          Voltar
                        </TJPRButton>
                      </div>
                    </TJPRCard>
                  </motion.div>
                ) : (
                  <motion.div {...resultMotionProps}>
                    <TJPRCard className={`w-full shadow-lg ${isDarkMode ? 'question-card-dark' : 'question-card-light'}`}>
                      {/* Cabeçalho do resultado */}
                      <div className="flex items-center mb-6 pb-4 border-b border-[rgba(27,38,59,0.1)] dark:border-[rgba(144,169,201,0.2)]">
                        <div className="w-[48px] h-[48px] bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-4">
                          <CheckCircle2 className="w-[28px] h-[28px] text-tjpr-success dark:text-green-400" />
                        </div>
                        <div>
                          <h2 className="text-[clamp(1.5rem,1.3rem+0.8vw,2rem)] leading-tight font-semibold text-tjpr-navy-900 dark:text-white">
                            Minuta padrão pronta
                          </h2>
                          <p className="text-tjpr-gray-700 dark:text-gray-300 text-sm mt-1">
                            Copie e cole o texto abaixo, ajustando apenas os dados variáveis do caso concreto entre colchetes.
                          </p>
                        </div>
                      </div>

                      {/* ── Corpo da minuta ── */}
                      <div className={`p-6 border min-h-[200px] mb-8 ${isDarkMode ? 'minuta-panel-dark' : 'minuta-panel-light'}`}>
                        {minutaLoading ? (
                          <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Carregando minuta…
                          </p>
                        ) : minutaFinal === SEM_REFERENCIA ? (
                          <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {SEM_REFERENCIA}
                          </p>
                        ) : (
                          <p className="whitespace-pre-wrap max-w-[72ch] text-tjpr-gray-900 dark:text-gray-100 text-base leading-relaxed font-sans">
                            {renderMinutaComColchetes(minutaFinal)}
                          </p>
                        )}
                      </div>

                      {/* Nota sobre placeholders */}
                      {minutaFinal && minutaFinal !== SEM_REFERENCIA && !minutaLoading && (
                        <div className={`mb-6 px-4 py-3 border text-sm ${isDarkMode ? 'border-tjpr-gold/20 bg-tjpr-gold/5 text-tjpr-gold/80' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                          <strong>Atenção:</strong> Substitua os campos entre <code>[COLCHETES]</code> pelos dados reais do processo antes de assinar.
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-[rgba(27,38,59,0.1)] dark:border-[rgba(144,169,201,0.2)]">
                        <TJPRButton variant="ghost" onClick={voltar} icon="arrow_back">
                          Voltar
                        </TJPRButton>
                        <TJPRButton
                          variant="secondary"
                          onClick={copiarTexto}
                          icon="content_copy"
                          disabled={!minutaFinal || minutaFinal === SEM_REFERENCIA || minutaLoading}
                        >
                          {copiado ? 'Copiado ✓' : 'Copiar conteúdo'}
                        </TJPRButton>
                        <TJPRButton variant="primary" onClick={reiniciar} icon="refresh">
                          Nova classificação
                        </TJPRButton>
                      </div>
                    </TJPRCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className={`py-6 text-center text-sm border-t z-10 ${isDarkMode ? 'app-footer-dark' : 'app-footer-light'}`}>
        <p>Tribunal de Justiça do Estado do Paraná © 2026. Todos os direitos reservados.</p>
        <p className="text-xs mt-1">
          Este é um sistema auxiliar e não substitui a validação humana.
        </p>
      </footer>
    </div>
  );
}
