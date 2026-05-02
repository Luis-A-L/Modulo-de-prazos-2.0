# PRD — Melhorias do Gerador de Minutas (TJPR)

> **Agentes utilizados:** `product-manager` · `frontend-specialist` · `project-planner`
> **Skills ativadas:** `plan-writing` · `frontend-design` · `web-design-guidelines`
> **Data de análise:** 2026-03-27
> **Base de análise:** `materiais/NotebookLM Mind Map.png` + código atual (`src/data/flow.ts`, `src/App.tsx`)

---

## Problema Central

O código atual implementa uma árvore de decisão **fundamentalmente diferente** da estrutura correta. A lógica de ramificação do fluxo está errada: o código ramifica por **tipo de recurso** (Inominado, Apelação, Agravo, Custas Iniciais), enquanto a triagem real ramifica por **tipo de pendência documental** (qual guia falta, qual comprovante falta, qual irregularidade afeta GRU ou FUNJUS). O resultado é que a minuta gerada está incorreta para a maioria dos cenários operacionais.

---

## Usuários-Alvo

| Perfil | Contexto |
|--------|----------|
| **Servidor do cartório / triário** | Analisa o preparo de recursos, classifica a irregularidade e gera minuta de despacho |
| **Juiz / assessor judicial** | Revisa e assina a minuta gerada |

---

## Glossário Jurídico — Siglas do Mind Map

Interpretação baseada em direito processual civil (CPC/2015, Lei 9.099/95) e procedimento do TJPR:

| Sigla/Termo | Significado jurídico correto |
|-------------|------------------------------|
| **GRU** | Guia de Recolhimento da União — guia federal de custas (utilizada em recursos a TRF, STJ e STF; em alguns recursos estaduais conforme tabela TJPR) |
| **FUNJUS** | Fundo de Manutenção do Judiciário do Estado do Paraná — taxa judiciária estadual obrigatória |
| **guia** | O documento/boleto de recolhimento em si (prova de que o pagamento foi iniciado) |
| **comprovante** | Recibo/extrato bancário confirmando que o débito foi efetivado |
| **agendamento / em análise** | Comprovante de agendamento bancário apresentado, mas sem confirmação de débito — pagamento ainda não saiu da conta; banco ainda processa |
| **e val. falso** | Guia/comprovante com valor divergente do exigido — seja por cálculo errado, sub-recolhimento deliberado ou erro no preenchimento da guia |
| **nhtt. proc. (sem ou erro)** | Guia sem número de processo identificado **ou** com número de processo incorreto — impossibilita a vinculação eletrônica do recolhimento ao feito no sistema SAJ/TJPR |
| **PAD** | Pago a Destempo — recolhimento efetuado após o prazo recursal mas antes do despacho de intimação para complementar; ou pagamento que o sistema registra como fora da janela esperada |
| **guia errada** | Guia pertencente a outro processo, outra vara ou outro recurso — o recolhimento existe mas não é imputável a este feito |
| **N/D** | Não Digitalizado — autos físicos/não eletrônicos; a verificação de preparo segue fluxo diferente e pode exigir guia adicional de porte de remessa e retorno |
| **Justaposição** | Reutilização ou sobreposição da mesma guia FUNJUS já utilizada em outro processo ou recurso anterior — vício insanável, pois o recolhimento não pode ser "aproveitado" duplamente |
| **Complementação** | Irregularidade sanável: intimação para complementar (art. 1.007, §2°, CPC) |
| **Dobro (Tipo)** | Recolhimento intempestivo: deve ser refeito em dobro (art. 1.007, §4°, CPC) |
| **Deserto** | Irregularidade insanável ou prazo de complementação esgotado: decreto de deserção (art. 1.007, §4°-5°, CPC / art. 54, Lei 9.099/95) |

---

## Análise: Estrutura Correta (Mind Map) vs. Código Atual

### Estrutura correta — 3 ramos, 3 níveis de profundidade

```
Preparo
├── Complementação  [intimação para regularizar — CPC art. 1.007 §2°]
│   ├── Falta só guia ──────────────── GRU → terminal
│   │                                  FUNJUS → terminal
│   ├── Falta só comprovante ────────── GRU → terminal
│   │                                   FUNJUS → terminal
│   ├── Falta só GRU (guia e/ou comprovante com irregularidade)
│   │   ├── agendamento / em análise → terminal
│   │   ├── e val. falso             → terminal
│   │   ├── nhtt. proc. (sem ou erro)→ terminal
│   │   ├── PAD                      → terminal
│   │   └── guia errada              → terminal
│   └── Falta só FUNJUS (mesma lógica)
│       ├── agendamento / em análise → terminal
│       ├── e val. falso             → terminal
│       ├── nhtt. proc. (sem ou erro)→ terminal
│       ├── PAD                      → terminal
│       └── guia errada              → terminal
│
├── Tipo / Dobro  [recolhimento em dobro — CPC art. 1.007 §4°]
│   ├── Falta só guia (GRU + FUNJUS)
│   │   ├── 2 agendamentos/em análise → terminal
│   │   ├── 2 e val. falsos           → terminal
│   │   ├── 2 nhtt. proc. (sem/erro)  → terminal
│   │   ├── 2 N/D                     → terminal
│   │   └── 2 guias erradas           → terminal
│   ├── Falta só comprovante (GRU + FUNJUS)
│   │   ├── (mesmas 5 sub-opções)     → terminal
│   └── Não pagou N/D
│       └── 3 guias erradas           → terminal
│
└── Deserto  [decreto de deserção — CPC art. 1.007 §4°-5°]
    ├── Falta só GRU
    │   ├── agendamento / em análise → terminal
    │   ├── e val. falso             → terminal
    │   ├── nhtt. proc. (sem ou erro)→ terminal
    │   ├── N/D                      → terminal
    │   └── guia errada              → terminal
    ├── Falta ambas (GRU + FUNJUS) — "Tipo" no mapa
    │   ├── (mesmas 5 sub-opções)    → terminal
    └── Falta só FUNJUS
        ├── agendamento / em análise → terminal
        ├── e val. falso             → terminal
        ├── nhtt. proc. (sem ou erro)→ terminal
        ├── N/D                      → terminal
        └── Justaposição             → terminal
```

**Cobertura:** ~60 nós terminais no mapa vs. ~20 no código atual (~33% de cobertura).

### Lacunas críticas no código

| # | Gap | Impacto |
|---|-----|---------|
| G1 | Ramificação por tipo de recurso (errada) em vez de tipo de pendência documental | **Crítico** — minuta incorreta |
| G2 | Não distingue falta de guia vs. falta de comprovante vs. irregularidade na guia | **Crítico** |
| G3 | Dobro não ramifica por qual(is) guia(s) e qual tipo de irregularidade | **Alto** |
| G4 | Deserção tem apenas 2 níveis rasos vs. 3 níveis com 5 razões cada | **Alto** |
| G5 | Bug: último snippet não é salvo em `historico` antes de `setFinalizado(true)` | **Alto** — minuta incompleta |
| G6 | Sem feedback visual ao copiar (TODO no código) | **Médio** |
| G7 | Sem breadcrumb nem indicador de progresso | **Médio** |

---

## Funcionalidades — Backlog Priorizado (MoSCoW)

### MUST — Crítico para funcionamento correto

#### F1 · Reconstrução da Árvore de Decisão (`src/data/flow.ts`)

**User Story:**
> Como servidor do cartório, quero ser guiado pelas perguntas certas sobre QUAL guia está irregular e POR QUÊ, para que a minuta gerada reflita a situação processual com precisão jurídica.

**Escopo:**
- Reescrever completamente `src/data/flow.ts` seguindo o mapa mental
- Cobrir os ~60 caminhos terminais (ver `FLOW_SPEC.md` para textos exatos)
- Manter as interfaces TypeScript existentes (`Option`, `Question`, `Flow`)
- Nomear nós semanticamente: `comp_falta_guia_gru`, `desercao_falta_gru_agendamento`, etc.

**Critérios de Aceite:**
```
DADO Complementação → Falta só GRU → agendamento/em análise
ENTÃO minuta contém intimação específica para comprovante de débito efetivo da GRU

DADO Deserto → Falta só FUNJUS → Justaposição
ENTÃO minuta contém decreto de deserção por vício de justaposição de guia

DADO qualquer caminho
ENTÃO todos os nós `proximo` existem como chaves no objeto (zero dead-ends)
```

**Arquivo:** `src/data/flow.ts` — reescrita completa. Textos de cada nó terminal em `FLOW_SPEC.md`.

---

#### F2 · Correção do bug do último snippet

**Localização:** `src/App.tsx:28-36`

**Problema:**
```typescript
// Bug: handleEscolha chama setFinalizado(true) sem antes
// adicionar o último snippet ao historico.
// minutaFinal = historico.map(h => h.snippet).join(' ')
// → o último snippet sempre fica de fora da minuta.
if (selectedOption.proximo === 'final') {
  setFinalizado(true);   // ← historico não tem o snippet desta opção
}
```

**Critério de Aceite:**
```
DADO que o servidor chega à última pergunta e seleciona uma opção
QUANDO clica em "Avançar"
ENTÃO a minuta inclui o snippet da última seleção (não apenas dos passos anteriores)
```

---

### SHOULD — Importantes para UX operacional

#### F3 · Toast de confirmação ao copiar

**Problema:** `// TODO: Adicionar um toast de sucesso` em `App.tsx:67`. Sem feedback, o servidor não sabe se o clipboard foi atualizado.

**Implementação:** Estado local `copiado: boolean` com `setTimeout` de 2s; reaproveitar o `TJPRButton` com ícone alternado — zero nova dependência.

**Critério:**
```
QUANDO clica "Copiar Conteúdo"
ENTÃO botão muda para "Copiado ✓" por 2s e retorna ao estado original
```

---

#### F4 · Breadcrumb das seleções anteriores

**Problema:** O servidor não vê o caminho percorrido; para corrigir um erro precisa voltar "às cegas".

**Implementação:** Lista compacta acima do card, renderizando `historico.map(h => textoSelecionado[h.step])`. Colapsável em mobile.

---

#### F5 · Campo de número do processo na minuta final

**Problema:** A minuta não identifica o processo; o servidor precisa complementar manualmente.

**Implementação:** `TJPRInput` no card de resultado. Quando preenchido, prefixar a minuta com `"Processo nº [número]. "`. Sem validação de formato — o servidor conhece o padrão.

---

#### F6 · Indicador de progresso

**Problema:** O badge "Passo N" não comunica avanço. Em árvores de profundidade variável, progresso absoluto não é calculável — usar barra indeterminada que avança a cada passo.

---

### COULD — Qualidade técnica

#### F7 · Validação de integridade do fluxo (build-time)

Script `src/data/validateFlow.ts` que verifica: (a) todos os `proximo` existem no `fluxo`, (b) todos os caminhos chegam a `"final"`. Executar em `npm run lint`.

#### F8 · Acessibilidade ARIA

`role="radiogroup"`, `aria-live="polite"` no card da pergunta, foco gerenciado ao avançar etapa.

#### F9 · Responsividade mobile

Botões "Voltar/Avançar" em `flex-col` em telas < 400px; área de toque mínima 44px nas opções de rádio.

---

#### F10 · Nó inicial: tipo de recurso (incluindo classes isentas de preparo)

**Descoberta (Manual CEFOR/STJ, Prof. Tesolin, jun/2025):** Três classes processuais **não exigem preparo**:

| Classe | Base legal |
|--------|-----------|
| **AREsp** | Art. 1.042, §2°, CPC — isento expressamente |
| **AgInt / Regimental** | Sem previsão normativa de preparo |
| **EDcl** | Art. 1.023, CPC — isento expressamente |

O triário que recebe um AREsp deve imediatamente saber que não há preparo a verificar. O `flow.ts` atual não trata esses casos — o servidor fica sem resposta.

**Implementação:** Novo nó `"inicio"` pergunta o tipo de recurso. AREsp, AgInt e EDcl → nó terminal com texto de isenção. Apelação, AI, Inominado, REsp → segue para `classif_irregularidade` (árvore atual). Ver estrutura completa em `FLOW_SPEC.md`.

**Critério:**
```
DADO que o servidor seleciona "AREsp"
ENTÃO a minuta exibe: "Agravo em Recurso Especial (AREsp). Não há exigência de preparo
recursal para o AREsp (art. 1.042, §2°, do CPC). Recurso regular quanto ao preparo."
```

**Nota adicional sobre REsp:** Para o REsp, o preparo no TJPR inclui apenas **GRU (código STJ) + porte de remessa e retorno** (dispensado em autos eletrônicos — Resolução 01/2016/STJ). **FUNJUS não é exigida para o REsp** — é taxa estadual devida apenas nos recursos estaduais. Os snippets do ramo REsp devem refletir isso.

---

### WON'T (fora de escopo)

- Histórico persistente de minutas (requer backend ou storage)
- Integração Gemini AI (key não está em produção)
- Exportação PDF/DOCX
- Autenticação real de usuário

---

## Ordem de Implementação

```
Sprint 1 — Correção crítica
  1. Reescrever src/data/flow.ts conforme FLOW_SPEC.md        [F1 + F10]
     (incluindo nó de tipo de recurso + isenções AREsp/AgInt/EDcl)
  2. Corrigir bug do último snippet em App.tsx                [F2]
  3. npm run lint + teste manual de todos os ~43 caminhos terminais

Sprint 2 — UX operacional
  4. Toast de cópia                                           [F3]
  5. Breadcrumb de seleções                                   [F4]
  6. Campo de número do processo                              [F5]
  7. Indicador de progresso                                   [F6]

Sprint 3 — Qualidade
  8. Script de validação do fluxo                             [F7]
  9. ARIA e acessibilidade                                    [F8]
  10. Ajustes mobile                                          [F9]
```

---

## Arquivos Afetados

| Arquivo | Alteração |
|---------|-----------|
| `src/data/flow.ts` | Reescrita completa (F1) |
| `src/App.tsx` | Bug fix (F2) + toast (F3) + breadcrumb (F4) + campo processo (F5) |
| `src/data/validateFlow.ts` | Novo arquivo (F7) |
| `package.json` | Adicionar validação ao script `lint` (F7) |

**Referência de implementação:** Ver `FLOW_SPEC.md` para a especificação completa dos nós, textos de minuta e chaves do `flow.ts`.
