import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { minutaCatalog } from '../data/minutaCatalog';
import { TJPRButton, TJPRCard, TJPRModal } from './TJPR';

interface DbTemplate {
  id: string;
  step_key: string;
  option_text: string;
  title: string;
  template_text: string;
  source_files: string[];
  updated_at: string;
}

interface FormState {
  step_key: string;
  option_text: string;
  title: string;
  template_text: string;
  source_files: string;
}

const EMPTY_FORM: FormState = {
  step_key: '',
  option_text: '',
  title: '',
  template_text: '',
  source_files: '',
};

interface AdminPanelProps {
  isDarkMode: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isDarkMode, onClose }: AdminPanelProps) {
  const dark = isDarkMode;
  const [templates, setTemplates] = useState<DbTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal de edição/criação
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Filtro de cobertura
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);

  // Caminhos finais do fluxo
  const allPaths = minutaCatalog.map(entry => ({
    step_key: entry.selections[entry.selections.length - 1]?.stepKey ?? '',
    option_text: entry.selections[entry.selections.length - 1]?.optionText ?? '',
    label: entry.selections.map(s => s.optionText).join(' › '),
  }));

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('minuta_templates')
      .select('id, step_key, option_text, title, template_text, source_files, updated_at')
      .order('step_key')
      .order('option_text');
    setLoading(false);
    if (err) { setError('Erro ao carregar templates.'); return; }
    setTemplates(data ?? []);
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const hasTemplate = (step_key: string, option_text: string) =>
    templates.some(t => t.step_key === step_key && t.option_text === option_text);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  const openEdit = (t: DbTemplate) => {
    setEditingId(t.id);
    setForm({
      step_key: t.step_key,
      option_text: t.option_text,
      title: t.title,
      template_text: t.template_text,
      source_files: t.source_files.join(', '),
    });
    setError('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  const handleDelete = async (t: DbTemplate) => {
    if (!window.confirm(`Excluir o template "${t.title}"?\n\nEsta ação não pode ser desfeita.`)) return;
    const { error: err } = await supabase.from('minuta_templates').delete().eq('id', t.id);
    if (err) { setError('Erro ao excluir.'); return; }
    setSuccessMsg('Template excluído.');
    loadTemplates();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.step_key || !form.option_text || !form.title || !form.template_text) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setSaving(true);
    const payload = {
      step_key: form.step_key.trim(),
      option_text: form.option_text.trim(),
      title: form.title.trim(),
      template_text: form.template_text,
      source_files: form.source_files
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    };

    let err;
    if (editingId) {
      ({ error: err } = await supabase
        .from('minuta_templates')
        .update(payload)
        .eq('id', editingId));
    } else {
      ({ error: err } = await supabase
        .from('minuta_templates')
        .insert(payload));
    }
    setSaving(false);

    if (err) {
      if (err.code === '23505') {
        setError('Já existe um template para este passo/opção.');
      } else {
        setError('Erro ao salvar. Verifique os dados e tente novamente.');
      }
      return;
    }
    setModalOpen(false);
    setSuccessMsg(editingId ? 'Template atualizado.' : 'Template criado.');
    loadTemplates();
  };

  const selectPathInForm = (step_key: string, option_text: string) => {
    setForm(f => ({ ...f, step_key, option_text }));
  };

  const covered = allPaths.filter(p => hasTemplate(p.step_key, p.option_text)).length;
  const total = allPaths.length;

  const displayedPaths = showOnlyMissing
    ? allPaths.filter(p => !hasTemplate(p.step_key, p.option_text))
    : allPaths;

  const cardClass = dark
    ? 'bg-[#101b2b] border border-[rgba(144,169,201,0.18)]'
    : 'bg-white border border-[rgba(27,38,59,0.1)]';

  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${dark ? 'text-[#90a9c9]' : 'text-tjpr-navy-800'}`;
  const inputClass = `w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-tjpr-gold
    ${dark
      ? 'bg-[#0d1b2a] border-[rgba(144,169,201,0.3)] text-white placeholder-gray-500'
      : 'bg-white border-[rgba(27,38,59,0.2)] text-tjpr-navy-900 placeholder-gray-400'}`;

  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'app-shell-dark text-white' : 'app-shell-light text-tjpr-gray-900'}`}>
      {/* Header do painel */}
      <div className={`sticky top-0 z-40 border-b px-6 py-4 flex items-center justify-between gap-4
        ${dark ? 'bg-[#0d1b2a] border-[rgba(144,169,201,0.18)]' : 'bg-white border-[rgba(27,38,59,0.1)]'}`}
      >
        <div>
          <h1 className={`text-lg font-bold ${dark ? 'text-white' : 'text-tjpr-navy-900'}`}>
            Painel Administrativo
          </h1>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-tjpr-gray-700'}`}>
            Gerador de Minutas — TJPR
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TJPRButton variant="primary" onClick={openNew} icon="linear_scale" size="sm">
            Nova minuta
          </TJPRButton>
          <TJPRButton variant="ghost" onClick={onClose} icon="arrow_back" size="sm">
            Voltar ao app
          </TJPRButton>
        </div>
      </div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Feedback */}
        {successMsg && (
          <div className={`mb-4 px-4 py-3 text-sm border ${dark ? 'bg-green-900/20 border-green-800/50 text-green-300' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {successMsg}
          </div>
        )}
        {error && !modalOpen && (
          <div className={`mb-4 px-4 py-3 text-sm border ${dark ? 'bg-red-900/20 border-red-800/50 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {error}
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Templates cadastrados', value: covered },
            { label: 'Caminhos do fluxo', value: total },
            { label: 'Sem template', value: total - covered < 0 ? 0 : total - covered },
          ].map(stat => (
            <div key={stat.label} className={`p-4 border ${cardClass}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${dark ? 'text-[#90a9c9]' : 'text-tjpr-navy-800'}`}>
                {stat.label}
              </p>
              <p className={`text-3xl font-bold ${dark ? 'text-white' : 'text-tjpr-navy-900'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── Templates cadastrados ─────────────────────────────────── */}
          <TJPRCard
            className={`flex-1 min-w-0 ${dark ? 'question-card-dark' : 'question-card-light'}`}
            title="Templates cadastrados"
          >
            {loading ? (
              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Carregando…</p>
            ) : templates.length === 0 ? (
              <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                Nenhum template cadastrado. Clique em "Nova minuta" para começar.
              </p>
            ) : (
              <div className="space-y-2">
                {templates.map(t => (
                  <div
                    key={t.id}
                    className={`flex items-start justify-between gap-4 p-3 border ${dark
                      ? 'border-[rgba(144,169,201,0.15)] bg-[rgba(144,169,201,0.04)]'
                      : 'border-[rgba(27,38,59,0.08)] bg-[rgba(27,38,59,0.02)]'}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-tjpr-navy-900'}`}>
                        {t.title}
                      </p>
                      <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <code className="font-mono">{t.step_key}</code> · {t.option_text.slice(0, 60)}{t.option_text.length > 60 ? '…' : ''}
                      </p>
                      <p className={`text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Atualizado: {new Date(t.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TJPRButton variant="secondary" size="sm" onClick={() => openEdit(t)}>
                        Editar
                      </TJPRButton>
                      <TJPRButton variant="error" size="sm" onClick={() => handleDelete(t)}>
                        Excluir
                      </TJPRButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TJPRCard>

          {/* ── Cobertura de caminhos ─────────────────────────────────── */}
          <div className="w-full xl:w-80 shrink-0">
            <TJPRCard
              className={`${dark ? 'question-card-dark' : 'question-card-light'}`}
              title="Cobertura do fluxo"
            >
              <div className="flex items-center gap-3 mb-4">
                <label className={`flex items-center gap-2 text-sm cursor-pointer select-none ${dark ? 'text-gray-300' : 'text-tjpr-gray-700'}`}>
                  <input
                    type="checkbox"
                    checked={showOnlyMissing}
                    onChange={e => setShowOnlyMissing(e.target.checked)}
                    className="accent-tjpr-gold"
                  />
                  Só sem template
                </label>
              </div>
              <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
                {displayedPaths.map((p, i) => {
                  const covered = hasTemplate(p.step_key, p.option_text);
                  return (
                    <button
                      key={i}
                      type="button"
                      title={covered ? 'Template cadastrado — clique para editar' : 'Sem template — clique para criar'}
                      onClick={() => {
                        if (covered) {
                          const t = templates.find(t => t.step_key === p.step_key && t.option_text === p.option_text);
                          if (t) openEdit(t);
                        } else {
                          setForm({ ...EMPTY_FORM, step_key: p.step_key, option_text: p.option_text });
                          setEditingId(null);
                          setError('');
                          setSuccessMsg('');
                          setModalOpen(true);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 text-xs border transition-colors ${
                        covered
                          ? dark
                            ? 'border-green-800/40 bg-green-900/10 text-green-400 hover:bg-green-900/20'
                            : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                          : dark
                            ? 'border-[rgba(144,169,201,0.15)] text-gray-400 hover:bg-[rgba(144,169,201,0.06)]'
                            : 'border-[rgba(27,38,59,0.08)] text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2">{covered ? '✓' : '○'}</span>
                      <code className="font-mono">{p.step_key}</code>
                      {' · '}
                      {p.option_text.slice(0, 40)}{p.option_text.length > 40 ? '…' : ''}
                    </button>
                  );
                })}
              </div>
            </TJPRCard>
          </div>
        </div>
      </main>

      {/* ── Modal de criação/edição ───────────────────────────────────────── */}
      <TJPRModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar template' : 'Nova minuta'}
        maxWidth="4xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className={`px-4 py-3 text-sm border ${dark ? 'bg-red-900/20 border-red-800/50 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Step Key <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.step_key}
                onChange={e => setForm(f => ({ ...f, step_key: e.target.value }))}
                placeholder="ex: comp_funjus"
                required
                className={inputClass}
              />
              <p className={`mt-1 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                Chave do nó no fluxo (flow.ts)
              </p>
            </div>
            <div>
              <label className={labelClass}>Texto da opção <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.option_text}
                onChange={e => setForm(f => ({ ...f, option_text: e.target.value }))}
                placeholder="ex: Juntou só a guia FUNJUS…"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Título <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="ex: Complementação — guia FUNJUS sem comprovante (REsp)"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Texto da minuta <span className="text-red-500">*</span>
              <span className={`ml-2 normal-case text-[10px] font-normal tracking-normal ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                Use [PLACEHOLDER] para dados variáveis do caso
              </span>
            </label>
            <textarea
              value={form.template_text}
              onChange={e => setForm(f => ({ ...f, template_text: e.target.value }))}
              rows={14}
              required
              className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
              placeholder="Texto completo da minuta…"
            />
          </div>

          <div>
            <label className={labelClass}>Arquivos de referência</label>
            <input
              type="text"
              value={form.source_files}
              onChange={e => setForm(f => ({ ...f, source_files: e.target.value }))}
              placeholder="minutas/Caso 01.pdf, minutas/Caso 02.pdf"
              className={inputClass}
            />
            <p className={`mt-1 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              Separe múltiplos arquivos com vírgula
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[rgba(27,38,59,0.1)] dark:border-[rgba(144,169,201,0.18)]">
            <TJPRButton type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </TJPRButton>
            <TJPRButton type="submit" variant="primary" disabled={saving}>
              {saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Criar template'}
            </TJPRButton>
          </div>
        </form>
      </TJPRModal>
    </div>
  );
}
