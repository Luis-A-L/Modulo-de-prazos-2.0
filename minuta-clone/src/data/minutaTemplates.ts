/**
 * minutaTemplates.ts
 * Templates de minutas são gerenciados no Supabase (tabela minuta_templates).
 * Esta camada fornece a função assíncrona de busca e os tipos compartilhados.
 */

import { supabase } from '../lib/supabase';

export interface MinutaTemplatePathStep {
  stepKey: string;
  optionText: string;
}

export interface MinutaTemplate {
  id: string;
  title: string;
  /** Apenas o corpo da decisão (sem cabeçalho nem rodapé). */
  text: string;
  sourceFiles: readonly string[];
}

interface MinutaTemplateRow {
  id: string;
  title: string;
  template_text: string;
  source_files: string[] | null;
}

interface TemplateLookupCandidate {
  stepKey: string;
  optionText: string;
}

export const SEM_REFERENCIA = 'AINDA SEM REFERENCIA DE MINUTAS';

const LEGACY_STEP_ALIASES: Record<string, readonly string[]> = {
  comp_irr_gru: ['comp_gru'],
  comp_irr_funjus: ['comp_funjus'],
};

const TEMPLATE_LOOKUP_ALIASES: Record<string, readonly TemplateLookupCandidate[]> = {
  'comp_falta_guia:GRU': [
    { stepKey: 'comp_gru', optionText: 'Juntou só o comprovante GRU (sem a guia de recolhimento)' },
    { stepKey: 'comp_gru', optionText: 'Juntou so o comprovante GRU (sem a guia de recolhimento)' }
  ],
  'comp_falta_guia:FUNJUS': [
    { stepKey: 'comp_funjus', optionText: 'Juntou só o comprovante FUNJUS (sem a guia de recolhimento)' },
    { stepKey: 'comp_funjus', optionText: 'Juntou so o comprovante FUNJUS (sem a guia de recolhimento)' }
  ],
  'comp_falta_comprovante:GRU': [
    { stepKey: 'comp_gru', optionText: 'Juntou só a guia GRU (sem comprovante de pagamento)' },
    { stepKey: 'comp_gru', optionText: 'Juntou so a guia GRU (sem comprovante de pagamento)' }
  ],
  'comp_falta_comprovante:FUNJUS': [
    { stepKey: 'comp_funjus', optionText: 'Juntou só a guia FUNJUS (sem comprovante de pagamento)' },
    { stepKey: 'comp_funjus', optionText: 'Juntou so a guia FUNJUS (sem comprovante de pagamento)' }
  ],
  'comp_irr_gru:Agendamento / em análise (transação não efetivada)': [
    { stepKey: 'comp_gru', optionText: 'Guia GRU juntada + comprovante de agendamento bancário' }
  ],
  'comp_irr_gru:Comprovante sem código de barras legível': [
    { stepKey: 'comp_gru', optionText: 'Guia GRU juntada + comprovante sem código de barras legível' },
    { stepKey: 'comp_gru', optionText: 'Guia GRU juntada + comprovante sem codigo de barras legivel' }
  ],
  'comp_irr_gru:Divergência no código de barras da guia e do comprovante': [
    { stepKey: 'comp_gru', optionText: 'Guia GRU juntada + divergência no código de barras' },
    { stepKey: 'comp_gru', optionText: 'Guia GRU juntada + divergencia no codigo de barras' }
  ],
  'comp_irr_gru:Número único divergente do processo ou da árvore processual': [
    { stepKey: 'comp_gru', optionText: 'Guia GRU juntada + número de processo ausente ou incorreto' }
  ],
  'comp_irr_funjus:Agendamento / em análise': [
    { stepKey: 'comp_funjus', optionText: 'Guia FUNJUS juntada + comprovante de agendamento bancário' }
  ],
  'comp_irr_funjus:Comprovante sem código de barras legível': [
    { stepKey: 'comp_funjus', optionText: 'Guia FUNJUS juntada + comprovante sem código de barras legível' },
    { stepKey: 'comp_funjus', optionText: 'Guia FUNJUS juntada + comprovante sem codigo de barras legivel' }
  ],
  'comp_irr_funjus:Divergência no código de barras da guia e do comprovante': [
    { stepKey: 'comp_funjus', optionText: 'Guia FUNJUS juntada + divergência no código de barras' },
    { stepKey: 'comp_funjus', optionText: 'Guia FUNJUS juntada + divergencia no codigo de barras' }
  ],
  'comp_irr_funjus:Número único divergente do processo ou da árvore processual': [
    { stepKey: 'comp_funjus', optionText: 'Guia FUNJUS juntada + número de processo ausente ou incorreto' }
  ],
  'dobro_nd:2 agendamentos bancários como comprovante': [
    { stepKey: 'dobro_nd', optionText: '2 agendamentos / em análise' }
  ],
  'dobro_nd:Comprovantes com status \'Em processo de autenticação\'': [
    { stepKey: 'dobro_nd', optionText: 'Comprovantes com status Em processo de autenticacao' }
  ],
  'dobro_decreto:Procuração e preparo em dobro - ambos ausentes': [
    { stepKey: 'dobro_proc', optionText: 'Procuração e preparo em dobro - ambos ausentes' }
  ],
  'desercao_gru_1pgto:Juntou só o comprovante GRU (sem guia) após intimação': [
    { stepKey: 'desercao_gru_1pgto', optionText: 'Guia GRU não apresentada após intimação (juntou só o comprovante)' }
  ],
  'desercao_intempestivo:Pagamento realizado fora do prazo recursal': [
    { stepKey: 'desercao_intempestivo', optionText: 'Comprovante de pagamento juntado fora do prazo recursal' }
  ],
};

const rowToTemplate = (row: MinutaTemplateRow): MinutaTemplate => ({
  id: row.id,
  title: row.title,
  text: row.template_text,
  sourceFiles: row.source_files ?? []
});

const loadTemplateByStepAndOption = async (
  stepKey: string,
  optionText: string
): Promise<MinutaTemplateRow | null> => {
  const { data, error } = await supabase
    .from('minuta_templates')
    .select('id, title, template_text, source_files')
    .eq('step_key', stepKey)
    .eq('option_text', optionText)
    .single();

  if (error || !data) return null;
  return data;
};

const withoutDiacritics = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const optionVariants = (optionText: string, isRE: boolean): string[] => {
  const base = [
    optionText,
    withoutDiacritics(optionText),
    optionText.replace(/ - /g, ' — '),
    optionText.replace(/ — /g, ' - '),
    withoutDiacritics(optionText).replace(/ - /g, ' — '),
    withoutDiacritics(optionText).replace(/ — /g, ' - '),
  ];

  return isRE
    ? [...base, ...base.map(option => `${option} [RE]`)]
    : base;
};

const uniqueCandidates = (
  candidates: TemplateLookupCandidate[]
): TemplateLookupCandidate[] => {
  const seen = new Set<string>();
  return candidates.filter(candidate => {
    const key = `${candidate.stepKey}:${candidate.optionText}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildLookupCandidates = (
  last: MinutaTemplatePathStep,
  isRE: boolean
): TemplateLookupCandidate[] => {
  const stepKeys = [last.stepKey, ...(LEGACY_STEP_ALIASES[last.stepKey] ?? [])];
  const directCandidates = stepKeys.flatMap(stepKey =>
    optionVariants(last.optionText, isRE).map(optionText => ({ stepKey, optionText }))
  );

  const pathKey = `${last.stepKey}:${last.optionText}`;
  const aliasCandidates = (TEMPLATE_LOOKUP_ALIASES[pathKey] ?? []).flatMap(candidate =>
    optionVariants(candidate.optionText, isRE).map(optionText => ({
      stepKey: candidate.stepKey,
      optionText
    }))
  );

  return uniqueCandidates([...directCandidates, ...aliasCandidates]);
};

export function semReferencia(id: string): MinutaTemplate {
  return {
    id,
    title: 'Sem referência disponível',
    text: SEM_REFERENCIA,
    sourceFiles: [],
  };
}

/**
 * Busca o template no Supabase pelo stepKey e optionText do último passo.
 * Tenta também aliases de chaves antigas, variantes sem acento e versões [RE].
 * Se não encontrar no banco, retorna semReferencia.
 */
export async function fetchMinutaTemplate(
  path: MinutaTemplatePathStep[]
): Promise<MinutaTemplate> {
  const id = path.map(s => s.stepKey + ':' + s.optionText).join(' > ');
  const isRE = path[0]?.optionText === 'Recurso Extraordinário (RE)';

  const last = path[path.length - 1];
  if (!last) return semReferencia(id);

  for (const candidate of buildLookupCandidates(last, isRE)) {
    const match = await loadTemplateByStepAndOption(candidate.stepKey, candidate.optionText);
    if (match) return rowToTemplate(match);
  }

  return semReferencia(id);
}
