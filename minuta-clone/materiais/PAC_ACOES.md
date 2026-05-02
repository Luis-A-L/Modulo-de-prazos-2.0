# PAC — Plano de Ação e Correção
## Gerador de Minutas TJPR — Resultado da Auditoria de Fluxo

**Origem:** `materiais/auditoria_fluxo.md`
**Data:** 2026-03-31
**Arquivos impactados:** `src/data/flow.ts`, `src/data/minutaTemplates.ts`, `src/App.tsx`

---

## Visão Geral das Fases

| Fase | Descrição | Responsável | Status |
|------|-----------|-------------|--------|
| **Fase 0** | Validação com Assessores (decisões de política) | Humano | ⏳ Aguardando |
| **Fase 1** | Correções de código sem ambiguidade | Codex Agent A + B | 🤖 Automatizável |
| **Fase 2** | Adições de novos nós ao fluxo | Codex Agent A + B | 🤖 Automatizável |
| **Fase 3** | Lint + revisão final | CI / humano | ⏳ Pós-agentes |

---

## FASE 0 — Decisões que precisam dos Assessores (NÃO automatizar)

Estas questões envolvem política processual interna da 1ª Vice-Presidência. Devem ser respondidas antes de codificar qualquer alteração nas categorias A e B correspondentes.

### P1 — Guia ausente (A.1): qual o tratamento da 1ª Vice-Presidência?

> **Contexto:** O STJ (AgInt AREsp 2.258.023/GO) diz que guia ausente com comprovante presente = deserção por preclusão consumativa. O app atual usa §7° (intimate para corrigir equívoco em 5 dias).
>
> **Pergunta:** A prática interna é:
> - (a) Intimar pelo §4° (pagar em dobro) → mover A.1 para categoria B
> - (b) Intimar pelo §7° (apresentar guia em 5 dias) → manter, mas é desvio intencional da jurisprudência
> - (c) Decretar deserção diretamente → mover para C

### P2 — "Guia de outro processo": primeira ocorrência intima ou decrota deserção?

> **Contexto:** Opções A.3 e A.4 intimam (§7°). Opção C.1 e C.3 decretam deserção. Não há critério claro para o usuário distinguir os dois cenários.
>
> **Pergunta:** A distinção é temporal (A = nunca intimado antes / C = já intimado e não atendeu)?
> - Se sim: como o usuário sabe se já houve intimação anterior? Precisa de uma pergunta explícita no fluxo.
> - Se não: qual é o critério?

### P3 — B.3 (autos físicos) ainda é relevante?

> **Pergunta:** Ainda existem processos físicos na triagem atual via PROJUDI? Se não, B.3 pode ser removido.

---

## FASE 1 — Correções imediatas (sem ambiguidade)

Mudanças com base legal clara que podem ser implementadas agora. Todas validadas contra os três documentos auditados.

---

### F1-A — `flow.ts` — Agente A

#### F1-A-1: Remover opção "2 guias sem número" de `dobro_falta_guia`

**Problema (IE-01):** "Sem número de processo" é equívoco de preenchimento (§7°), não inexistência de preparo (§4°). Já coberto em A.3 e A.4.

**Mudança:**
```typescript
// REMOVER de dobro_falta_guia.opcoes:
finalOption(
  '2 guias sem número / número incorreto de processo',
  '...'
)
```

> Resultado: `dobro_falta_guia` fica com 4 opções (era 5).

---

#### F1-A-2: Remover rota "Inadmissão por intempestividade" de `desercao_gru`

**Problema (IE-05):** O nó `intempestivo` fica acessível por dois caminhos distintos sem critério claro. A categoria D já é autônoma no primeiro nível.

**Mudança:**
```typescript
// REMOVER de desercao_gru.opcoes:
option(
  'Inadmissão por intempestividade',
  'intempestivo',
  '...'
)
```

> Resultado: `desercao_gru` fica com 5 opções (era 6). Intempestivo segue acessível somente via categoria D.

---

#### F1-A-3: Corrigir snippet de "Agendamento" em `comp_irr_funjus`

**Problema (IC-03 / IE-04):** O snippet no flow.ts cita §7° (equívoco de preenchimento), mas o template correspondente em minutaTemplates.ts usa §2° (insuficiência). Agendamento não é equívoco de preenchimento da guia.

**Mudança no snippet da opção "Agendamento / em análise" em `comp_irr_funjus`:**
```typescript
// ANTES:
'...Intime-se para, no prazo de 5 (cinco) dias úteis, apresentar comprovante de débito definitivo da guia FUNJUS, sob pena de deserção (art. 1.007, §7°, do CPC).'

// DEPOIS:
'O comprovante de pagamento da guia FUNJUS corresponde a agendamento bancário não efetivado, não constituindo prova de recolhimento efetivo. Intime-se para apresentar comprovante de débito definitivo, sob pena de deserção (art. 1.007, §2°, do CPC).'
```

---

### F1-B — `minutaTemplates.ts` — Agente B

#### F1-B-1: Corrigir base legal em `BODY_DESERCAO_GERAL`

**Problema:** `BODY_DESERCAO_GERAL` cita `art. 1.007, §2°` na sentença de deserção. Mas §2° é para insuficiência (intimate a complementar). Deserção é §4°-5°.

**Localização:** constante `BODY_DESERCAO_GERAL` (linhas ~117-126 de minutaTemplates.ts).

**Mudança:**
```typescript
// ANTES (última linha antes do "Diante do exposto"):
'Sendo assim, nos termos do artigo 1.007, § 2º, do Código de Processo Civil, declaro a deserção do recurso especial.'

// DEPOIS:
'Sendo assim, nos termos do artigo 1.007, §§ 4º e 5º, do Código de Processo Civil, c/c a Súmula 187 do Superior Tribunal de Justiça, declaro a deserção do recurso especial.'
```

---

## FASE 2 — Adições de novos nós (sem ambiguidade)

### F2-A — `flow.ts` — Agente A (continua do mesmo agente)

#### F2-A-1: Adicionar opção "guia nunca apresentada" em `desercao_gru`

**Problema (IE-02):** Se A.1 intima para juntar a guia GRU e a parte não atende, não há caminho de deserção correspondente.

**Adicionar em `desercao_gru.opcoes`:**
```typescript
finalOption(
  'Guia GRU não apresentada após intimação (nunca juntada)',
  'A parte foi intimada para juntar a guia GRU correspondente ao recolhimento das custas devidas ao [TRIBUNAL SUPERIOR] e não atendeu à determinação no prazo assinado. Decreto a deserção do recurso por falta de comprovação regular do preparo (art. 1.007, §§ 4°-5°, do CPC — Súmula 187/STJ).'
)
```

---

#### F2-A-2: Adicionar opção "guia nunca apresentada" em `desercao_funjus`

**Problema (IE-02):** Análogo para FUNJUS.

**Adicionar em `desercao_funjus.opcoes`:**
```typescript
finalOption(
  'Guia FUNJUS não apresentada após intimação (nunca juntada)',
  'A parte foi intimada para juntar a guia FUNJUS correspondente às custas locais devidas a este Tribunal de Justiça e não atendeu à determinação no prazo assinado. Decreto a deserção do recurso por falta de comprovação regular do preparo (art. 1.007, §§ 4°-5°, do CPC — Súmula 187/STJ).'
)
```

---

### F2-B — `minutaTemplates.ts` — Agente B (continua do mesmo agente)

#### F2-B-1: Adicionar template para "Guia GRU não apresentada após intimação"

O novo optionText `'Guia GRU não apresentada após intimação (nunca juntada)'` deve ser adicionado à condição que retorna `BODY_DESERCAO_GERAL` no `case 'desercao_gru'`:

```typescript
// Dentro do case 'desercao_gru' (e 'desercao_ambas' e 'desercao_funjus'):
if (
  opt === 'Valores divergentes' ||
  opt === 'Valor divergente (insuficiente)' ||
  opt === 'Intimado para pagar em dobro e pagou simples' ||
  opt === 'Guia pertencente a outro processo' ||
  opt === 'Guias pertencentes a outros processos'
) { ... BODY_DESERCAO_DOBRO_SIMPLES }

// ADICIONAR nova condição ANTES do return default:
if (
  opt === 'Guia GRU não apresentada após intimação (nunca juntada)' ||
  opt === 'Guia FUNJUS não apresentada após intimação (nunca juntada)'
) {
  return {
    id: `desercao-guia-nao-apresentada-${profile.kind}-${lastStep.stepKey}`,
    title: `${profile.shortLabel} — deserção por guia não apresentada após intimação`,
    text: BODY_DESERCAO_GERAL, // Reutiliza o template existente
    sourceFiles: ['minutas/DMG/0001365-67.2026.8.16.0031 Pet deserto.pdf']
  };
}
```

---

### F2-C — `App.tsx` — Agente C (após Agente A completar)

Não há novos step keys sendo adicionados nas Fases 1 e 2 (apenas opções dentro de nós existentes). **App.tsx não precisa de alteração nesta rodada.**

---

## FASE 3 — Validação

Após execução dos agentes:

```bash
npm run lint   # tsc --noEmit — deve passar com 0 erros
npm run dev    # Verificação visual do fluxo
```

Checklist manual:
- [ ] A.3 / A.4 ainda têm opção "Guia de outro processo" → INTIMAÇÃO
- [ ] C.1 / C.3 têm "Guia de outro processo" → DESERÇÃO
- [ ] C.1 tem "Guia GRU não apresentada após intimação" → DESERÇÃO
- [ ] C.3 tem "Guia FUNJUS não apresentada após intimação" → DESERÇÃO
- [ ] B.1 não tem mais "2 guias sem número" (era IE-01)
- [ ] C.1 não tem mais "Inadmissão por intempestividade" como opção (era IE-05)
- [ ] D (intempestivo) ainda acessível diretamente

---

## Mapa de Tarefas dos Agentes

```
[Agente A — flow.ts]          [Agente B — minutaTemplates.ts]
  F1-A-1: remove dobro          F1-B-1: corrige BODY_DESERCAO_GERAL §
  F1-A-2: remove intempestivo   F2-B-1: add template guia não apresentada
  F1-A-3: fix snippet agend.
  F2-A-1: add guia GRU ausente
  F2-A-2: add guia FUNJUS ausente
        ↓                               ↓
        └──────────── [npm run lint] ───┘
                            ↓
                     [Revisão manual]
```

**Os agentes A e B rodam em paralelo** (arquivos diferentes, sem dependência entre si).
**Agente C (App.tsx) não é necessário** nesta rodada.

---

## Itens de Fase 0 pendentes (para reunião com Assessores)

| # | Pergunta | Impacto no código |
|---|---------|-------------------|
| P1 | Guia ausente A.1 → §7° ou §4° ou deserção? | Mover ou reescrever `comp_falta_guia` |
| P2 | Critério A vs C para "guia de outro processo" | Adicionar pergunta "já foi intimado?" no fluxo |
| P3 | B.3 autos físicos ainda é usado? | Remover ou manter `dobro_nd` |
