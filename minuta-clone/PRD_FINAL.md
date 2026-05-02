# PRD_FINAL.md — Plano de Refatoração e Melhorias

**Data:** 2026-03-31
**Repositório:** gerador_minutas
**Arquivos afetados:** `src/data/flow.ts`, `src/data/minutaTemplates.ts`, `src/App.tsx`

---

## Resumo das Mudanças

Doze alterações classificadas em três categorias: **estrutura de fluxo**, **textos de minutas** e **UI**.

---

## 1. UI — Texto entre `[COLCHETES]` em vermelho

**Arquivo:** `src/App.tsx`

**Problema:** O corpo da minuta é renderizado como texto puro. Os placeholders `[TEXTO]` não têm destaque visual, dificultando a identificação do que precisa ser substituído.

**Solução:** Criar função `renderMinutaComColchetes(text: string)` que divide o texto em segmentos e envolve cada `[...]` em `<span className="text-red-600 dark:text-red-400 font-semibold">`. Substituir o `<p>` da minuta por um `<p>` que renderiza esses segmentos como array de nós React.

---

## 2. Fluxo — `comp_falta_comprovante`: adicionar Passo 5 por guia

**Arquivo:** `src/data/flow.ts`

**Problema atual:** O nó `comp_falta_comprovante` (pergunta: "Comprovante de qual guia está ausente?") tem GRU e FUNJUS apontando direto para `final`. Não há distinção entre situações como agendamento vs. valor divergente dentro dessa pendência.

**Mudança:** Converter GRU e FUNJUS de `finalOption` para opções que apontam para **dois novos nós intermediários**:

| Nó novo | Chave | Pergunta |
|---------|-------|----------|
| Sub-passo GRU | `comp_comp_gru` | "Qual a situação do comprovante de pagamento da GRU?" |
| Sub-passo FUNJUS | `comp_comp_funjus` | "Qual a situação do comprovante de pagamento da FUNJUS?" |

**Opções de cada novo nó (→ `final`):**

Para `comp_comp_gru`:
- `Agendamento / em análise (transação não efetivada)` (movido de `comp_irr_gru`)
- `Valor divergente / insuficiente` (movido de `comp_irr_gru`)

Para `comp_comp_funjus`:
- `Agendamento / em análise` (mesmo padrão aplicado à FUNJUS)
- `Valor divergente / insuficiente`

**Snippets dos novos nós:**
- `comp_falta_comprovante` → GRU: snippet = `'A guia GRU foi juntada; o comprovante de débito efetivo está ausente.'`
- `comp_falta_comprovante` → FUNJUS: snippet = `'A guia FUNJUS foi juntada; o comprovante de débito efetivo está ausente.'`
- Subnós: usar snippets equivalentes aos que existem em `comp_irr_gru`.

**Impacto em STEP_LABELS / STEP_ICONS em App.tsx:** Adicionar entradas para `comp_comp_gru` e `comp_comp_funjus`.

---

## 3. Fluxo — `comp_irr_gru`: remover "Agendamento", "Valor divergente" e "PAD"

**Arquivo:** `src/data/flow.ts`

Remover do nó `comp_irr_gru` as seguintes opções (que mudam de lugar):
- `Agendamento / em análise (transação não efetivada)` → movida para `comp_comp_gru`
- `Valor divergente / insuficiente (é val. falso)` → movida para `comp_comp_gru`
- `Pago a destempo — PAD (após o prazo recursal)` → movida para `dobro` como "Pagamento Intempestivo"

Resultado: `comp_irr_gru` fica com **2 opções** apenas:
1. `Sem número de processo / número incorreto`
2. `Guia pertencente a outro processo`

---

## 4. Fluxo — `comp_irr_funjus`: remover "PAD"

**Arquivo:** `src/data/flow.ts`

Remover do nó `comp_irr_funjus` a opção `Pago a destempo — PAD`.

Resultado: `comp_irr_funjus` fica com **4 opções**:
1. `Agendamento / em análise`
2. `Valor divergente / insuficiente`
3. `Sem número de processo / número incorreto`
4. `Guia pertencente a outro processo`

---

## 5. Fluxo — `dobro`: adicionar opção 4 "Pagamento Intempestivo"

**Arquivo:** `src/data/flow.ts`

Adicionar ao nó `dobro` (Qual é a situação documental do preparo no momento da interposição?) a **quarta opção**:

```
option(
  'Pagamento Intempestivo (recolhimento efetuado após o prazo recursal)',
  'dobro_intempestivo',
  'Verificado que o recolhimento do preparo foi efetuado após o prazo recursal, equiparando-se à ausência de preparo no ato da interposição.'
)
```

**Novo nó `dobro_intempestivo`:**

```
pergunta: 'Qual guia foi recolhida intempestivamente?'
opcoes:
  - finalOption('GRU (recolhimento após o prazo recursal)', '<snippet>')
  - finalOption('FUNJUS (recolhimento após o prazo recursal)', '<snippet>')
  - finalOption('GRU e FUNJUS (ambas recolhidas após o prazo recursal)', '<snippet>')
```

**STEP_LABELS:** adicionar `dobro_intempestivo: 'Dobro — Intempestivo'`
**STEP_ICONS:** adicionar `dobro_intempestivo: '⏳'`

---

## 6. Fluxo — `dobro_falta_comprovante`: remover 2 opções

**Arquivo:** `src/data/flow.ts`

Remover do nó `dobro_falta_comprovante`:
- `2 guias sem número / número incorreto de processo`
- `2 pertencentes a outros processos`

Resultado: ficam **3 opções**:
1. `2 agendamentos / em análise`
2. `2 valores divergentes / insuficientes`
3. `2 não localizados / não disponíveis (N/D)`

---

## 7. Fluxo — `desercao_gru`: renomear opção

**Arquivo:** `src/data/flow.ts`

Renomear opção no nó `desercao_gru`:
- **Antes:** `Sem número de processo / número incorreto`
- **Depois:** `Intimado para pagar em dobro e pagou simples`

Manter `proximo: 'final'` e atualizar snippet para:
`'A parte foi intimada para recolhimento em dobro e apresentou comprovante de recolhimento apenas simples.'`

---

## 8. Fluxo — `desercao_gru`: adicionar opção "Inadmissão por intempestividade"

**Arquivo:** `src/data/flow.ts`

Adicionar como última opção do nó `desercao_gru`:
```
option(
  'Inadmissão por intempestividade',
  'intempestivo',
  'Verificado que o recurso é intempestivo, independentemente da análise do preparo.'
)
```

Esta opção direciona o usuário ao nó `intempestivo` já existente (que pergunta sobre a natureza da intempestividade e gera a minuta de inadmissão por intempestividade).

---

## 9. Templates — `comp_comp_gru` e `comp_comp_funjus`: novos casos

**Arquivo:** `src/data/minutaTemplates.ts`

Adicionar dois novos `case` no switch de `resolveMinutaTemplate`:

**`case 'comp_comp_gru'`:**
- `opt === 'Agendamento / em análise (transação não efetivada)'` → usar corpo idêntico ao atual `comp-agend-gru` (já existe em `comp_irr_gru`)
- `opt === 'Valor divergente / insuficiente'` → usar corpo idêntico ao atual `comp-valor-gru`

**`case 'comp_comp_funjus'`:**
- `opt === 'Agendamento / em análise'` → usar `BODY_COMP_AGENDAMENTO_FUNJUS`
- `opt === 'Valor divergente / insuficiente'` → usar corpo idêntico ao atual `comp-valor-funjus`

---

## 10. Templates — `comp_irr_gru`: adicionar jurisprudência em 2 minutas

**Arquivo:** `src/data/minutaTemplates.ts`

### 10a. "Guia pertencente a outro processo" — adicionar jurisprudência STJ

Acrescentar após o parágrafo de fundamento (antes do "Insta salientar"):

```
"(...) A guia de recolhimento pertencente a processo diverso não é apta a comprovar o preparo do recurso nos autos em que juntada, sendo necessária a apresentação de guia individualizada para cada feito." (AgInt no AREsp n. 2.208.504/RS, Rel. Min. Benedito Gonçalves, Primeira Turma, DJe de 26/4/2023.)
```

### 10b. "Sem número de processo / número incorreto" — adicionar jurisprudência STJ

Acrescentar jurisprudência equivalente sobre identificação processual na guia de recolhimento (usar mesma fonte: AgInt no AREsp n. 2.208.504/RS).

---

## 11. Templates — `desercao_gru`: atualizar resolver para nova opção

**Arquivo:** `src/data/minutaTemplates.ts`

No `case 'desercao_gru'` (e agrupados `desercao_ambas` / `desercao_funjus`), adicionar `'Intimado para pagar em dobro e pagou simples'` na lista de opções que retornam `BODY_DESERCAO_DOBRO_SIMPLES`:

```typescript
if (
  opt === 'Valores divergentes' ||
  opt === 'Valor divergente (insuficiente)' ||
  opt === 'Intimado para pagar em dobro e pagou simples' ||  // ← novo
  opt === 'Guia pertencente a outro processo' ||
  opt === 'Guias pertencentes a outros processos'
) {
  return { text: BODY_DESERCAO_DOBRO_SIMPLES, ... };
}
```

---

## 12. Templates — `dobro_intempestivo`: novo caso

**Arquivo:** `src/data/minutaTemplates.ts`

Adicionar novo `case 'dobro_intempestivo'` que retorna uma intimação para recolhimento em dobro, tendo em vista que o pagamento foi efetuado após o prazo recursal. Usar `BODY_DOBRO_SO_GUIAS_RESP` / `BODY_DOBRO_SO_GUIAS_RE` como base (o pedido de dobro é o mesmo; apenas o fundamento da exigência difere).

---

## Matriz de Arquivos × Mudanças

| # | Mudança | flow.ts | minutaTemplates.ts | App.tsx |
|---|---------|---------|-------------------|---------|
| 1 | Colchetes vermelhos | — | — | ✅ |
| 2 | comp_falta_comprovante → sub-nós | ✅ | ✅ | ✅ (STEP_LABELS/ICONS) |
| 3 | comp_irr_gru: remover 3 opções | ✅ | — | — |
| 4 | comp_irr_funjus: remover PAD | ✅ | — | — |
| 5 | dobro: adicionar Pagamento Intempestivo | ✅ | ✅ | ✅ (STEP_LABELS/ICONS) |
| 6 | dobro_falta_comprovante: remover 2 opções | ✅ | — | — |
| 7 | desercao_gru: renomear opção | ✅ | ✅ | — |
| 8 | desercao_gru: adicionar intempestividade | ✅ | — | — |
| 9 | Novos cases comp_comp_gru/funjus | — | ✅ | — |
| 10 | Jurisprudência em minutas comp_irr_gru | — | ✅ | — |
| 11 | Resolver desercao_gru: nova opção | — | ✅ | — |
| 12 | Novo case dobro_intempestivo | — | ✅ | — |

---

## Ordem de Implementação (Codex)

**Fase 1 — Estrutura do fluxo** (`flow.ts`): mudanças 2, 3, 4, 5, 6, 7, 8
**Fase 2 — Templates** (`minutaTemplates.ts`): mudanças 9, 10, 11, 12
**Fase 2 — UI** (`App.tsx`): mudança 1 + labels/icons de novos nós

As fases 2 podem ser executadas em paralelo após a fase 1.
