import re

with open('sql_correcoes_finais.sql', 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Remove ON CONFLICT clauses since we're doing TRUNCATE + INSERT
sql_clean = re.sub(
    r'ON CONFLICT \(step_key, option_text\) DO UPDATE\s+SET template_text = EXCLUDED\.template_text,\s+title = EXCLUDED\.title,\s+source_files = EXCLUDED\.source_files,\s+updated_at = now\(\);',
    ';',
    sql_content
)

header = """-- =============================================================================
-- MIGRAÇÃO LIMPA — Templates extraídos fielmente dos PDFs
-- Data: 2026-04-24
-- Objetivo: substituir TODO o conteúdo de minuta_templates pelos 49 templates
-- extraídos verbatim dos PDFs na pasta minutas/, eliminando ruído de versões
-- anteriores (templates reconstruídos ou genéricos sem fonte PDF).
-- 
-- INSTRUÇÕES:
-- 1. Abra o SQL Editor do Supabase
-- 2. Cole TODO este conteúdo
-- 3. Clique em RUN
-- =============================================================================

BEGIN;

-- 1) BACKUP da tabela atual (com timestamp do batch)
CREATE TABLE IF NOT EXISTS minuta_templates_backup (
  backup_pk BIGSERIAL PRIMARY KEY,
  backup_batch_id TEXT NOT NULL,
  backup_reason TEXT NOT NULL,
  backed_up_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  id UUID,
  step_key TEXT,
  option_text TEXT,
  title TEXT,
  template_text TEXT,
  source_files TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_minuta_templates_backup_batch
  ON minuta_templates_backup (backup_batch_id);

WITH batch AS (
  SELECT to_char(clock_timestamp(), 'YYYYMMDD_HH24MISS_MS') AS batch_id
)
INSERT INTO minuta_templates_backup (
  backup_batch_id, backup_reason,
  id, step_key, option_text, title, template_text, source_files,
  created_at, updated_at, created_by
)
SELECT
  batch.batch_id,
  'Migração limpa 2026-04-24: substituição total pelos 49 templates extraídos de PDFs',
  id, step_key, option_text, title, template_text, source_files,
  created_at, updated_at, created_by
FROM minuta_templates, batch;

-- 2) LIMPAR tabela atual
TRUNCATE TABLE minuta_templates RESTART IDENTITY;

-- 3) INSERIR os 49 templates extraídos dos PDFs
-- (conteúdo gerado de sql_correcoes_finais.sql)
"""

footer = """
COMMIT;

-- =============================================================================
-- Verificação rápida (opcional — rode separadamente após o COMMIT)
-- =============================================================================
-- SELECT step_key, option_text, title FROM minuta_templates ORDER BY step_key, option_text;
-- SELECT COUNT(*) AS total_templates FROM minuta_templates;
"""

with open('supabase/migrate_templates_from_pdfs.sql', 'w', encoding='utf-8') as f:
    f.write(header)
    f.write(sql_clean)
    f.write(footer)

print("Arquivo gerado: supabase/migrate_templates_from_pdfs.sql")
print(f"Tamanho: {len(header) + len(sql_clean) + len(footer)} caracteres")
