import { pdfTemplateMap } from './pdf_template_map';
import { minutaCatalog } from '../src/data/minutaCatalog';
import { writeFileSync } from 'fs';

const escSql = (s: string): string => s.replace(/'/g, "''");

const respPaths = minutaCatalog.filter(e => e.selections[0]?.optionText === 'Recurso Especial (REsp)');

interface Row {
  step_key: string;
  option_text: string;
  title: string;
  template_text: string;
  source_files: string[];
}

const categoryLabel = (stepKey: string): string => {
  const map: Record<string, string> = {
    comp_gru: 'Complementação GRU',
    comp_funjus: 'Complementação FUNJUS',
    dobro: 'Pagamento em Dobro',
    dobro_nd: 'Pagamento em Dobro — documentos ausentes/irregulares',
    desercao: 'Deserção',
    desercao_nd_pgto: 'Deserção — intimação anterior (ambas)',
    desercao_nd_1pgto: 'Deserção §2º — vício (ambas)',
    desercao_nd_2pgto: 'Deserção §4º — vício (ambas)',
    desercao_gru_pgto: 'Deserção — intimação anterior (GRU)',
    desercao_gru_1pgto: 'Deserção §2º — vício (GRU)',
    desercao_gru_2pgto: 'Deserção §4º — vício (GRU)',
    desercao_funjus_pgto: 'Deserção — intimação anterior (FUNJUS)',
    desercao_funjus_1pgto: 'Deserção §2º — vício (FUNJUS)',
    desercao_funjus_2pgto: 'Deserção §4º — vício (FUNJUS)',
    intempestivo: 'Intempestivo',
    desistencia_jg: 'Desistência de J.G. — custas em dobro',
    apos_indeferimento_jg: 'Após indeferimento de J.G.'
  };
  return map[stepKey] ?? stepKey;
};

const rows: Row[] = [];

respPaths.forEach(entry => {
  const last = entry.selections[entry.selections.length - 1];
  const key = `${last.stepKey}:${last.optionText}`;
  const mapped = pdfTemplateMap[key];

  rows.push({
    step_key: last.stepKey,
    option_text: last.optionText,
    title: `${categoryLabel(last.stepKey)} — ${last.optionText.substring(0, 80)} (REsp)`,
    template_text: mapped ? mapped.template_text : 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: mapped ? mapped.source_files : []
  });
});

let sql = `-- =============================================================================
-- Gerador de Minutas — Seed Completo: todos os templates de minuta
-- Execute APÓS o schema.sql no SQL Editor do Supabase.
-- Gerado automaticamente pelo script scripts/generate_seed_sql_from_pdfs.ts
--
-- VALORES ATUALIZADOS (Sprint 4):
--   GRU (REsp): R$ 270,12 — IN STJ/GP nº 13/2026, vigência 02/02/2026
--   FUNJUS: R$ 300,00 / R$ 600,00 (dobro) — Lei Estadual 22.956/2025, vigência 18/03/2026
--   RE: valores STF (usar [VALOR_STF] como placeholder)
--
-- NOTA: Templates com texto real dos PDFs = ${rows.filter(r => r.template_text !== 'AINDA SEM REFERENCIA DE MINUTAS').length}
--       Templates SEM_REFERENCIA = ${rows.filter(r => r.template_text === 'AINDA SEM REFERENCIA DE MINUTAS').length}
--       Total = ${rows.length}
-- =============================================================================

TRUNCATE minuta_templates;

INSERT INTO minuta_templates (step_key, option_text, title, template_text, source_files)
VALUES
`;

const values = rows.map(r => {
  const titleEsc = escSql(r.title);
  const textEsc = escSql(r.template_text);
  const filesArr = r.source_files.length > 0 ? `ARRAY[${r.source_files.map(f => `'${escSql(f)}'`).join(',')}]` : `'{}'`;
  return `('${escSql(r.step_key)}', '${escSql(r.option_text)}', '${titleEsc}', '${textEsc}', ${filesArr})`;
});

sql += values.join(',\n');
sql += `\nON CONFLICT (step_key, option_text) DO UPDATE SET\n  title = EXCLUDED.title,\n  template_text = EXCLUDED.template_text,\n  source_files = EXCLUDED.source_files,\n  updated_at = NOW();\n`;

writeFileSync('supabase/seed_minutas_completo.sql', sql, 'utf-8');

const withPdf = rows.filter(r => r.template_text !== 'AINDA SEM REFERENCIA DE MINUTAS').length;
const withoutPdf = rows.filter(r => r.template_text === 'AINDA SEM REFERENCIA DE MINUTAS').length;
console.log(`Generated ${rows.length} rows`);
console.log(`With real PDF text: ${withPdf}`);
console.log(`SEM_REFERENCIA: ${withoutPdf}`);
console.log(`Written to supabase/seed_minutas_completo.sql`);