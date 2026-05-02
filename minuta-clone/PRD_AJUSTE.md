# PRD — Plano de Ajuste do Gerador de Minutas TJPR

**Data:** 2026-04-26  
**Base:** Auditoria de fluxo (`materiais/auditoria_fluxo.md`), análise das minutas de referência (70 PDFs em `minutas/`), correções da equipe (`minutas/correcoes.docx`), e árvore-alvo (`materiais/arvore_final.md`)

---

## Visão Geral

O sistema necessita de ajustes estruturais no fluxo de decisão (`flow.ts`), criação de novos caminhos na árvore, atualização de templates no Supabase, e correções pontuais. As alterações estão organizadas em 6 sprints, cada um com tasks enumeradas e checkboxes `[ ]`.

**Princípio fundamental:** JAMAIS inventar conteúdo de minutas. Todos os textos devem ser extraídos das minutas de referência em `minutas/`. Onde não houver referência, manter `SEM_REFERENCIA` e sinalizar para preenchimento manual pela equipe TJPR.

---

## Sprint 0 — Decisões de Política (BLOQUEANTE)

> Este sprint NÃO é automatizável. Requer reunião com assessores da 1ª Vice-Presidência.

- [x] **S0-T1:** Confirmar tratamento da guia ausente (A.1): §7° (intimação para apresentar guia em 5 dias) ou §4° (pagar em dobro) ou deserção direta? — **RESPOSTA:** Se apenas 1 guia ausente → §7° (intimação para apresentar em 5 dias). Se ambas as guias ausentes → §4° (pagar em dobro). Após intimação não cumprida → deserção.
- [x] **S0-T2:** Definir critério para distinguir "guia de outro processo" entre intimação (A.3/A.4) e deserção (C.1/C.3): é temporal (primeira ocorrência = intimação; reiterada = deserção)? — **RESPOSTA:** Sim, o critério é temporal. Primeira ocorrência → intimação (A.3/A.4, dá chance de corrigir); se já intimado e persiste → deserção (C.1/C.3, vício não corrigido). O fluxo atual está correto com a opção em ambos os lugares, pois o wizard já distingue pela classificação escolhida no passo 1 (complementação vs deserção).
- [x] **S0-T3:** Confirmar se B.3 (autos físicos não digitalizados) ainda é relevante na triagem PROJUDI. — **RESPOSTA:** Irrelevante. Caso muito raro, remover da árvore.
- [x] **S0-T4:** Confirmar se "pagou simples em vez de dobro" (C.1-3) é caminho novo ou se entra como variantes em nós existentes. — **RESPOSTA:** Entra como variante em nós existentes de deserção §4°. Foi intimado para dobro e pagou simples → resulta em deserção.
- [x] **S0-T5:** Confirmar se "JUNTAR DECRETO E DOBRO" (PDFs 615885, 646311) será caminho autônomo ou incluído em nó existente. — **RESPOSTA:** Já existe como nó autônomo. Pode ser usado tanto para RE quanto para REsp (diferenciando valores).
- [x] **S0-T6:** Confirmar se "ESSES NÃO SERIAM DOBRO - SERIA SIMPLES" significa que alguns caminhos de dobro (§4°) devem ser reclassificados para complementação (§2°). Quais especificamente? — **RESPOSTA:** Se AMBAS as guias apresentam comprovante com agendamento ou não verificável → dobro (§4°). Se apenas UMA guia tem problema → complementação (§2°). Ou seja: caminhos de dobro que afetam apenas 1 guia devem ser reclassificados para complementação.
- [x] **S0-T7:** Confirmar se "quando a parte desiste da J.G. as custas são em dobro" é um caminho autônomo novo ou se está coberto por nós existentes. — **RESPOSTA:** Sim, é um caminho autônomo novo (desistência de J.G. + custas em dobro).
- [x] **S0-T8:** Confirmar se o caminho "Pode ser em dobro ou simples (Pode entrar como ausência de manifestação - renùncia de prazo - decurso de prazo)" exige um nó com sub-opções ou se são caminhos distintos. — **RESPOSTA:** Caminhos distintos. Criar 6 opções finais separadas (3 motivos × 2 valores: dobro/simples).

---

## Sprint 1 — Correções Imediatas no Código (sem ambiguidade)

> Alterações com base legal clara, validadas contra os 3 documentos auditados.

### F1 — `src/data/flow.ts`

- [x] **F1-T1:** Remover opção `"2 guias com número de processo ausente ou incorreto"` do nó `dobro_nd` (IE-01: §7° não §4°, já coberto em A.3/A.4) — ✅ ausente no flow.ts atual
- [x] **F1-T2:** Remover opção `"Inadmissão por intempestividade"` do nó `desercao_gru` (IE-05: intempestivo já é categoria D autônoma) — ✅ nó `desercao_intempestivo` separado, sem opção de intempestividade nos nós de deserção
- [x] **F1-T3:** Corrigir snippet de `"Guia FUNJUS juntada + comprovante de agendamento bancário"` em `comp_funjus` — alterar referência de §7° para §2° (agendamento não é equívoco de preenchimento) — ✅ snippet já referencia § 2º
- [x] **F1-T4:** Adicionar opção `"Guia GRU não apresentada após intimação (nunca juntada)"` em `desercao_gru_1pgto` e `desercao_gru_2pgto` (IE-02: caminho de deserção ausente no fluxo atual) — ✅ presente em ambos os nós
- [x] **F1-T5:** Adicionar opção `"Guia FUNJUS não apresentada após intimação (nunca juntada)"` em `desercao_funjus_1pgto` e `desercao_funjus_2pgto` (IE-02: análogo à T4 para FUNJUS) — ✅ presente em ambos os nós

### F1 — `src/data/minutaTemplates.ts`

- [ ] **F1-T6:** Corrigir base legal em template de deserção — alterar `art. 1.007, § 2º` para `art. 1.007, §§ 4º e 5º` + Súmula 187/STJ (deserção não é §2°) ⎯ SUPABASE ONLY (template bodies migrated to DB; no code change needed)
- [ ] **F1-T7:** Adicionar template para `"Guia GRU não apresentada após intimação"` — reutilizar template de deserção com ajuste de texto ⎯ SUPABASE ONLY (template bodies migrated to DB; no code change needed)
- [ ] **F1-T8:** Adicionar template para `"Guia FUNJUS não apresentada após intimação"` — análogo à T7 ⎯ SUPABASE ONLY (template bodies migrated to DB; no code change needed)

### F1 — `src/App.tsx`

- [x] **F1-T9:** Atualizar `STEP_LABELS` com novos labels para as opções adicionadas em T4 e T5 — ✅ labels já existem para todos os nós de deserção
- [x] **F1-T10:** Atualizar `STEP_ICONS` com ícones para novos nós (se aplicável) — ✅ ícones já atribuídos
- [x] **F1-T11:** Executar `npm run lint` e garantir que passa com 0 erros — ✅ `tsc --noEmit` passa com 0 erros

---

## Sprint 2 — Reestruturação da Árvore de Decisão

> Modificações que criam novos caminhos, nós e subcategorias conforme `arvore_final.md`.

### Alterações Estruturais (flow.ts)

- [ ] **S2-T1:** Reestruturar `comp_guia` — dividir as opções atuais nas 4 subcategorias (A.1–A.4) da árvore-alvo:
  - A.1: Falta só a guia (GRU ausente / FUNJUS ausente) — §7°
  - A.2: Falta só o comprovante → agendamento / valor divergente — §2°
  - A.3: Irregularidade na guia GRU → nº processo / guia outro processo — §7°
  - A.4: Irregularidade na guia FUNJUS → agendamento / valor divergente / nº processo / guia outro processo — §2°/§7°
  > NOTA: As opções individuais já existem em comp_gru/comp_funjus, mas sem subdivisão hierárquica. Reestruturação em sub-nós seria uma mudança de UX significativa. Avaliar se é necessária para v1.
- [x] **S2-T2:** Adicionar nó `"Valor divergente / insuficiente"` — ✅ adicionado em `comp_gru`, `comp_funjus`, e todos os 6 nós de deserção (`desercao_gru_1pgto`, `desercao_gru_2pgto`, `desercao_funjus_1pgto`, `desercao_funjus_2pgto`, `desercao_nd_1pgto`, `desercao_nd_2pgto`)
- [x] **S2-T3:** Adicionar nó `"Pagamento intempestivo"` como categoria D (intempestivo) — ✅ nó `intempestivo` adicionado como 4ª opção em `classif`, com sub-opções "Pagamento fora do prazo" e "Comprovante fora do prazo". Nó `desercao_intempestivo` renomeado para `intempestivo` e conectado corretamente.
- [x] **S2-T4:** Adicionar nó `"Pagou simples em vez de dobro"` (C.1-3) — ✅ já existe como opção em `desercao_gru_2pgto`, `desercao_funjus_2pgto`, `desercao_nd_2pgto` (todos os nós §4°). Confirmado S0-T4: é variante nos nós existentes, não nó novo.
- [x] **S2-T5:** Separar `"Divergência de código de barras"` de `"Ausência de código de barras"` — são vícios distintos conforme correções da equipe. ✅ JÁ SEPARADO em todos os nós relevantes (comp_gru, comp_funjus, dobro_nd, todos os nós de deserção).
- [x] **S2-T6:** Simplificar o fluxo de deserção — remover a bifurcação §2°/§4° na escolha de vício (target não distingue; o tipo de intimação anterior já está implícito no path). Requer aprovação de S0-T2. — ✅ Mantida a bifurcação §2°/§4° conforme S0-T2: o critério é temporal (primeira ocorrência = intimação §2°; reiterada = deserção §4°-5°), e o wizard distingue pela classificação.
- [x] **S2-T7:** Adicionar nó `"JUNTAR DECRETO E DOBRO"` — ✅ S0-T5 confirmou: já existe como nó autônomo acessível por `classif → dobro`. Não precisa de nó novo; servir tanto para RE quanto para REsp.
- [x] **S2-T7a:** Adicionar nó `"Comprovante de agendamento bancário (AMBOS)"` no grupo dobro — ✅ já existe como opção 3 no nó `dobro`: "Juntou guias com comprovante de agendamento bancário (ambos)".
- [x] **S2-T7b:** Adicionar opção `"Número único não bate com nº do processo ou da árvore processual"` — ✅ adicionado em `comp_gru`, `comp_funjus`, `dobro_nd`, e todos os 6 nós de deserção (`desercao_gru_1pgto/2pgto`, `desercao_funjus_1pgto/2pgto`, `desercao_nd_1pgto/2pgto`).
- [x] **S2-T7c:** Adicionar nó para "Desistência de J.G. + custas em dobro" — ✅ nó `desistencia_jg` criado com 3 opções: "Custas em dobro — GRU", "Custas em dobro — FUNJUS", "Custas em dobro — GRU e FUNJUS (ambas)". Acessível via `classif`.
- [x] **S2-T7d:** Adicionar sub-opções para deserção §4°: "Ausência de manifestação", "Renúncia de prazo", "Decurso de prazo" — ✅ adicionados como 3 opções finais distintas em `desercao_gru_2pgto`, `desercao_funjus_2pgto`, e `desercao_nd_2pgto`. Confirmado S0-T8: caminhos distintos, não sub-opções.
- [x] **S2-T7e:** Adicionar nó para "Após indeferimento de J.G. + intimação para preparo + inércia/renúncia" — ✅ nó `apos_indeferimento_jg` criado com 3 opções: "Inércia", "Renúncia ao prazo", "Decurso de prazo". Acessível via `classif`.
- [x] **S2-T8:** Avaliar e possivelmente remover nó B.3 `"Autos físicos não digitalizados"` caso S0-T3 confirme obsolescência — ✅ B.3 REMOVIDO (S0-T3: caso muito raro, irrelevant). Nota: nó nunca existiu no flow.ts atual, apenas na arvore_final.md — simplesmente não implementar.

### Alterações Correspondentes (App.tsx)

- [x] **S2-T9:** Atualizar `STEP_LABELS` com labels para todos os novos nós criados em S2-T1 a S2-T7 — ✅ adicionados `intempestivo`, `desistencia_jg`, `apos_indeferimento_jg`
- [x] **S2-T10:** Atualizar `STEP_ICONS` com ícones para novos nós — ✅ adicionados ícones para `intempestivo` (⏰), `desistencia_jg` (⚖️), `apos_indeferimento_jg` (⚖️). Mantido `desercao_intempestivo` como alias.
- [x] **S2-T11:** Executar `npm run lint` e garantir 0 erros — ✅ `tsc --noEmit` passa com 0 erros

### Caminhos NOVOS no fluxo (17 ausentes na árvore atual)

| # | Caminho-Alvo | Status |
|---|-------------|--------|
| 1 | A.2-2: GRU → Valor divergente (complementação) | [x]Criar nó — ✅ adicionado em `comp_gru` |
| 2 | A.2-4: FUNJUS → Valor divergente (complementação) | [x]Criar nó — ✅ adicionado em `comp_funjus` |
| 3 | A.4-2: FUNJUS → Valor divergente (irregularidade) | [x]Criar nó — ✅ mesmo que #2 (mesma opção em comp_funjus) |
| 4 | B.1-2: 2 valores divergentes (dobro) | [ ]Criar nó — pendente em dobro_nd |
| 5 | B.1-5: 2 guias de outros processos (dobro) | [ ]Criar nó — pendente em dobro_nd |
| 6 | B.2-2: 2 comprovantes → valores divergentes (dobro) | [ ]Criar nó — pendente em dobro_nd |
| 7 | B.2-3: 2 comprovantes → N/D (dobro) | [x]Criar nó — ✅ já existe como "2 documentos N/D" em dobro_nd |
| 8 | B.3: Autos físicos (3 guias) | REMOVIDO (S0-T3) |
| 9 | B.4-1: Pagamento intempestivo → GRU | [x]Criar nó — ✅ nó `intempestivo` acessível via `classif` com "Pagamento fora do prazo" |
| 10 | B.4-2: Pagamento intempestivo → FUNJUS | [x]Criar nó — ✅ nó `intempestivo` cobre ambos REsp/RE |
| 11 | B.4-3: Pagamento intempestivo → GRU+FUNJUS | [x]Criar nó — ✅ nó `intempestivo` cobre ambos |
| 12 | C.1-2: Deserção GRU → Valor insuficiente não regularizado | [x]Criar nó — ✅ adicionado "Valor divergente ou insuficiente" em desercao_gru_1pgto e desercao_gru_2pgto |
| 13 | C.1-3: Deserção GRU → Pagou simples em vez de dobro | [x]Criar nó — ✅ já existe em desercao_gru_2pgto |
| 14 | C.2-2: Deserção ambas → Valores divergentes | [x]Criar nó — ✅ adicionado em desercao_nd_1pgto e desercao_nd_2pgto |
| 15 | C.3-2: Deserção FUNJUS → Valor divergente | [x]Criar nó — ✅ adicionado "Valor divergente ou insuficiente" em desercao_funjus_1pgto e desercao_funjus_2pgto |
| 16 | S2-T7: JUNTAR DECRETO E DOBRO (caminho combinado) | [x]Criar nó — ✅ S0-T5: já existe via `classif → dobro`, acessível para RE e REsp |
| 17 | Separação: Divergência vs Ausência de código de barras | [x]Criar nós — ✅ separado em comp_gru, comp_funjus, dobro_nd, deserção |

---

## Sprint 3 — Templates no Supabase (dados)

> Criação e atualização dos textos de minuta na tabela `minuta_templates`. **CADA TEXTO DEVE VIR DAS MINUTAS DE REFERÊNCIA EM `minutas/`.** Onde não houver PDF de referência, inserir `SEM_REFERENCIA` e marcar para preenchimento manual.

### Grupo A — Complementação (24 templates: 12 paths × REsp/RE)

| Path | REsp | RE | PDF Referência | Status |
|------|:----:|:--:|---------------|--------|
| A.1-1: Falta só a guia → GRU ausente | [ ] | [ ] | 670588, 596358 (valor 2026) | Template base: 670588 |
| A.1-2: Falta só a guia → FUNJUS ausente | [ ] | [ ] | 596361 | Template base: 596361 |
| A.2-1: Comprovante agendamento → GRU | [ ] | [ ] | 609103 | Texto extraído de 609103. **ATENÇÃO:** reviewer pede "COLOCAR PARA TODOS" |
| A.2-2: Valor divergente → GRU | [ ] | [ ] | SEM REFERÊNCIA | **SEM MINUTA DE REFERÊNCIA** — criado a partir de modelo similar |
| A.2-3: Comprovante agendamento → FUNJUS | [ ] | [ ] | SEM REFERÊNCIA | Derivar de 609103 adaptando valores FUNJUS |
| A.2-4: Valor divergente → FUNJUS | [ ] | [ ] | SEM REFERÊNCIA | **SEM MINUTA DE REFERÊNCIA** |
| A.3-1: GRU nº processo incorreto | [ ] | [ ] | 628802 (divergência código barras) | Texto extraído de 628802 |
| A.3-2: GRU de outro processo | [ ] | [ ] | SEM REFERÊNCIA | Derivar de modelo existente |
| A.4-1: FUNJUS agendamento | [ ] | [ ] | SEM REFERÊNCIA | Derivar de 609103 |
| A.4-2: FUNJUS valor divergente | [ ] | [ ] | SEM REFERÊNCIA | **SEM MINUTA DE REFERÊNCIA** |
| A.4-3: FUNJUS nº processo incorreto | [ ] | [ ] | SEM REFERÊNCIA | Derivar de 628802 |
| A.4-4: FUNJUS de outro processo | [ ] | [ ] | 596214, 608076 | Texto extraído de 596214/608076 |

- [ ] **S3-T1:** Criar templates A.1-1 REsp e RE (adaptar valores: REsp usa GRU, RE usa valores STF)
- [ ] **S3-T2:** Criar templates A.1-2 REsp e RE
- [ ] **S3-T3:** Criar templates A.2-1 REsp e RE — **incluir variante "comprovante de agendamento" para todos os caminhos conforme reviewer**
- [ ] **S3-T4:** Criar templates A.2-2 REsp e RE (sem referência — marcar para revisão)
- [ ] **S3-T5:** Criar templates A.2-3 REsp e RE (derivado)
- [ ] **S3-T6:** Criar templates A.2-4 REsp e RE (sem referência)
- [ ] **S3-T7:** Criar templates A.3-1 REsp e RE
- [ ] **S3-T8:** Criar templates A.3-2 REsp e RE (sem referência)
- [ ] **S3-T9:** Criar templates A.4-1 a A.4-4 REsp e RE
- [ ] **S3-T10:** Atualizar valores em todos os templates: GRU R$270,12 (a partir de 02/02/2026), FUNJUS R$300,00 (a partir de 18/03/2026 conforme Lei 22.956/2025)
- [ ] **S3-T11:** Garantir que valores diferem entre REsp (Tabela B — STJ) e RE (valores STF) — reviewer: "alterar valor, visto que é RE e não REsp"

### Grupo B — Pagamento em Dobro (24 templates: 12 paths × REsp/RE)

| Path | REsp | RE | PDF Referência | Status |
|------|:----:|:--:|---------------|--------|
| B.1-1: 2 agendamentos bancários | [ ] | [ ] | 596207, 676940 | 676940 = "em processo de autenticação" |
| B.1-2: 2 valores divergentes | [ ] | [ ] | SEM REFERÊNCIA | **SEM MINUTA DE REFERÊNCIA** |
| B.1-3: 2 guias sem nº processo | [ ] | [ ] | REMOVER (F1-T1) | **A SER REMOVIDO** |
| B.1-4: 2 documentos N/D | [ ] | [ ] | 597127 | 597127 = "J.G. NÃO LOCALIZADA" |
| B.1-5: 2 guias de outros processos | [ ] | [ ] | SEM REFERÊNCIA | **SEM MINUTA DE REFERÊNCIA** |
| B.2-1: 2 agendamentos (comprovantes) | [ ] | [ ] | 676940 | Derivar |
| B.2-2: 2 valores divergentes | [ ] | [ ] | SEM REFERÊNCIA | **SEM MINUTA DE REFERÊNCIA** |
| B.2-3: 2 comprovantes N/D | [ ] | [ ] | 596207, 599298 | 596207 = "comprovantes ou guias" |
| B.3: Autos físicos (3 guias) | [ ] | [ ] | SEM REFERÊNCIA | Pendente S0-T3 |
| B.4-1: Pagamento intempestivo GRU | [ ] | [ ] | 607948 | "Comprovação fora do prazo legal" |
| B.4-2: Pagamento intempestivo FUNJUS | [ ] | [ ] | SEM REFERÊNCIA | Derivar de B.4-1 |
| B.4-3: Pagamento intempestivo GRU+FUNJUS | [ ] | [ ] | 600448 | "recolhimento recurso originário - ato incompatível" |

- [ ] **S3-T12:** Criar templates B.1 grupado
- [ ] **S3-T13:** Criar templates B.2 grupado
- [ ] **S3-T14:** Criar templates B.3 (pendente decisão S0-T3)
- [ ] **S3-T15:** Criar templates B.4 grupado
- [ ] **S3-T16:** Revisar: reviewer sinalizou "ESSES NÃO SERIAM DOBRO - SERIA SIMPLES" para alguns casos — verificar base legal (§2° vs §4°) caso a caso

### Grupo C — Deserção (34 templates: 17 paths × REsp/RE)

| Path | REsp | RE | PDF Referência | Status |
|------|:----:|:--:|---------------|--------|
| C.1-1: Deserção GRU → Agendamento | [ ] | [ ] | 596186, 609103 | §2° ou §4° depende do caminho |
| C.1-2: Deserção GRU → Valor insuficiente | [ ] | [ ] | SEM REFERÊNCIA | **SEM MINUTA DE REFERÊNCIA** |
| C.1-3: Deserção GRU → Pagou simples | [ ] | [ ] | 604326, 606008 | "comprovou FUNJUS forma simples" |
| C.1-4: Deserção GRU → N/D | [ ] | [ ] | 596230, 596222 | "Ausência de manifestação" / "Ausência de complementação" |
| C.1-5: Deserção GRU → Guia outro processo | [ ] | [ ] | 596214 | "FUNJUS pela guia GRU" |
| C.2-1: Deserção ambas → Agendamentos | [ ] | [ ] | SEM REFERÊNCIA | Derivar de C.1-1 |
| C.2-2: Deserção ambas → Valores divergentes | [ ] | [ ] | SEM REFERÊNCIA | **SEM MINUTA DE REFERÊNCIA** |
| C.2-3: Deserção ambas → Sem nº processo | [ ] | [ ] | SEM REFERÊNCIA | Derivar |
| C.2-4: Deserção ambas → N/D | [ ] | [ ] | 596230, 596237 | "Ausência de manifestação" |
| C.2-5: Deserção ambas → Guias de outros processos | [ ] | [ ] | 596214, 596217 | "FUNJUS pela guia GRU" |
| C.3-1: Deserção FUNJUS → Agendamento | [ ] | [ ] | SEM REFERÊNCIA | Derivar de C.1-1 |
| C.3-2: Deserção FUNJUS → Valor divergente | [ ] | [ ] | SEM REFERÊNCIA | **SEM MINUTA DE REFERÊNCIA** |
| C.3-3: Deserção FUNJUS → Sem nº processo | [ ] | [ ] | 596347 | "Códigos de barras não correspondem" |
| C.3-4: Deserção FUNJUS → N/D | [ ] | [ ] | 596222, 596227 | "Ausência de complementação" |
| C.3-5: Deserção FUNJUS → Justaposição guia | [ ] | [ ] | 608076 | "FUNJUS pela guia FUNREJUS" |

- [ ] **S3-T17:** Criar templates C.1 grupado
- [ ] **S3-T18:** Criar templates C.2 grupado
- [ ] **S3-T19:** Criar templates C.3 grupado
- [ ] **S3-T20:** Corrigir base legal em todos os templates de deserção: §4°-5° + Súmula 187/STJ (não §2°)
- [ ] **S3-T21:** Adequar textos "Deserto" vs "Inadmitido" conforme caminho (deserção = "Declaro a deserção"; intempestivo = "Inadmito o recurso")

### Grupo D — Intempestivo (4 templates: 2 paths × REsp/RE)

| Path | REsp | RE | PDF Referência | Status |
|------|:----:|:--:|---------------|--------|
| D-1: Pagamento fora do prazo recursal | [ ] | [ ] | 607948, 627206, 670304 | 670304 = intempestivo + dobro |
| D-2: Comprovante fora do prazo | [ ] | [ ] | 607949 | "Comprovação fora do prazo legal" |

- [ ] **S3-T22:** Criar templates D-1 e D-2 (REsp e RE)

### Casos Especiais (não classificados na árvore-alvo)

| Caso | PDF Referência | Status |
|------|---------------|--------|
| Após indeferimento JG + intimação preparo simples + inércia | 0002812, 606190, 672340 | [ ] Criar template |
| Após indeferimento JG + intimação dobro + pedido JG | 604597, 676412 | [ ] Criar template |
| JUNTAR DECRETO + DOBRO + intempestividade | 615885, 646311, 677400 | [ ] Criar template (pendente S0-T5) |
| INTEMPESTIVO + DESERTO (complementação) | 627206 | [ ] Criar template |
| INTEMPESTIVO + DESERTO (dobro) | 670304 | [ ] Criar template |
| Desistência JG + custas em dobro | 0015914 | [ ] Criar template |
| Número único processo divergente + FUNJUS | 0148996 | [ ] Criar template |
| FUNJUS complementação (valores novos 18/03/2025) | 676727 | [ ] Criar template |

- [ ] **S3-T23:** Definir onde cada caso especial se encaixa na árvore (após S0-T5)
- [ ] **S3-T24:** Criar templates para casos especiais

---

## Sprint 4 — Atualização de Valores e Textos

> Atualização de valores monetários e ajustes textuais em templates existentes.

- [ ] **S4-T1:** Atualizar GRU de R$??? para R$270,12 (IN STJ/GP nº 13/2026, vigência 02/02/2026) em todos os templates REsp
- [ ] **S4-T2:** Atualizar FUNJUS de R$66,85/R$133,70 para R$300,00/R$600,00 (Lei Estadual 22.956/2025, vigência 18/03/2026) em todos os templates
- [ ] **S4-T3:** Atualizar referência à Lei Estadual da FUNJUS: de "Lei n° 21.868/2023" para "Lei n° 22.956/2025" em todos os templates
- [ ] **S4-T4:** Atualizar referência à IN STJ/GP nº 13/2026 (valor GRU 02/02/2026) em templates que citam valores
- [ ] **S4-T5:** Garantir distinção de valores entre REsp (STJ — Tabela B) e RE (STF) em todos os templates
- [ ] **S4-T6:** Revisar todos os templates que citam "R$66,85" ou "R$133,70" — são valores antigos da FUNJUS que precisam ser atualizados para R$300,00 e R$600,00 respectivamente
- [ ] **S4-T7:** Adicionar nota sobre "PagTesouro" (plataforma digital STJ) em templates de complementação e dobro que ainda não mencionam, conforme modelos 670588, 670902, 677400
- [ ] **S4-T8:** Padronizar fórmula de incentivo: todos os templates devem conter link `https://www.tjpr.jus.br/preparo-de-recurso-2o-grau` para geração da guia FUNJUS, conforme modelos recentes

---

## Sprint 5 — Validação e Revisão Final

- [ ] **S5-T1:** Executar `npm run lint` — deve passar com 0 erros
- [ ] **S5-T2:** Executar `npm run build` — deve gerar `dist/` sem erros
- [ ] **S5-T3:** Testar manualmente TODOS os caminhos REsp no wizard (43 caminhos × REsp)
- [ ] **S5-T4:** Testar manualmente TODOS os caminhos RE no wizard (43 caminhos × RE) — RE deve retornar `SEM_REFERENCIA` ou template adaptado conforme definido
- [ ] **S5-T5:** Verificar que A.3/A.4 ainda têm opção "Guia de outro processo" → INTIMAÇÃO (§7°)
- [ ] **S5-T6:** Verificar que C.1/C.3 têm "Guia de outro processo" → DESERÇÃO (§4°-5°)
- [ ] **S5-T7:** Verificar que C.1 e C.3 têm "Guia não apresentada após intimação" → DESERÇÃO
- [ ] **S5-T8:** Verificar que B.1 não tem mais "2 guias sem número" (removido por F1-T1)
- [ ] **S5-T9:** Verificar que intempestivo não aparece mais sob deserção (removido por F1-T2)
- [ ] **S5-T10:** Verificar que "Divergência de código de barras" e "Ausência de código de barras" são opções distintas nos nós relevantes
- [ ] **S5-T11:** Verificar dark mode em todos os novos componentes
- [ ] **S5-T12:** Verificar accessibility (radio buttons, screen readers) nos novos passos
- [ ] **S5-T13:** Verificar copy-to-clipboard (Word-compatible HTML) nos novos templates
- [ ] **S5-T14:** Verificar valores monetários corretos em todos os templates (REsp: R$270,12 GRU / R$300,00 FUNJUS; RE: valores STF)
- [ ] **S5-T15:** Deploy de teste em `base: '/minuta/'` — verificar no GitHub Pages

---

## Anexo A — Mapeamento Completo: PDFs × Caminhos da Árvore

> Legenda: ✅ = PDF de referência existe, ❌ = SEM MINUTA DE REFERÊNCIA, ⚠️ = PDF existe mas precisa adaptação

### Complementação (A)

| Caminho | REsp | RE | PDF Ref |
|---------|:----:|:--:|---------|
| A.1-1 GRU ausente (§7°) | ⚠️ | ❌ | 670588 (REsp, valores 2026); 596358 (REsp, valores 2024) |
| A.1-2 FUNJUS ausente (§7°) | ⚠️ | ❌ | 596361 (REsp); Sem para RE |
| A.2-1 GRU agendamento (§2°) | ✅ | ❌ | 609103 (DESSERTO — conteúdo é complementação agendamento) |
| A.2-2 GRU valor divergente (§2°) | ❌ | ❌ | SEM REFERÊNCIA |
| A.2-3 FUNJUS agendamento (§2°) | ❌ | ❌ | Derivar de 609103 |
| A.2-4 FUNJUS valor divergente (§2°) | ❌ | ❌ | SEM REFERÊNCIA |
| A.3-1 GRU nº processo incorreto (§7°) | ⚠️ | ❌ | 628802 (divergência código barras) |
| A.3-2 GRU outro processo (§7°) | ❌ | ❌ | SEM REFERÊNCIA |
| A.4-1 FUNJUS agendamento (§2°) | ❌ | ❌ | Derivar de 609103 |
| A.4-2 FUNJUS valor divergente (§2°) | ❌ | ❌ | SEM REFERÊNCIA |
| A.4-3 FUNJUS nº processo incorreto (§7°) | ❌ | ❌ | SEM REFERÊNCIA |
| A.4-4 FUNJUS outro processo (§2°) | ⚠️ | ❌ | 596214 (FUNJUS via GRU — justaposição) |

### Pagamento em Dobro (B)

| Caminho | REsp | RE | PDF Ref |
|---------|:----:|:--:|---------|
| B.1-1 2 agendamentos | ⚠️ | ❌ | 596207, 676940 (autenticação) |
| B.1-2 2 valores divergentes | ❌ | ❌ | SEM REFERÊNCIA |
| B.1-3 2 guias sem nº processo | — | — | A SER REMOVIDO (F1-T1) |
| B.1-4 2 documentos N/D | ⚠️ | ❌ | 597127 (J.G. não localizada) |
| B.1-5 2 guias de outros processos | ❌ | ❌ | SEM REFERÊNCIA |
| B.2-1 2 agendamentos (comprovantes) | ⚠️ | ❌ | Derivar de 676940 |
| B.2-2 2 valores divergentes | ❌ | ❌ | SEM REFERÊNCIA |
| B.2-3 2 comprovantes N/D | ⚠️ | ❌ | 596207, 599298 |
| B.3 Autos físicos (3 guias) | ❌ | ❌ | SEM REFERÊNCIA (pendente S0-T3) |
| B.4-1 Intempestivo GRU | ⚠️ | ❌ | 607948 |
| B.4-2 Intempestivo FUNJUS | ❌ | ❌ | Derivar |
| B.4-3 Intempestivo GRU+FUNJUS | ⚠️ | ❌ | 600448 |

### Deserção (C)

| Caminho | REsp | RE | PDF Ref |
|---------|:----:|:--:|---------|
| C.1-1 GRU agendamento | ⚠️ | ❌ | 596186, 609103 |
| C.1-2 GRU valor insuficiente | ❌ | ❌ | SEM REFERÊNCIA |
| C.1-3 GRU pagou simples | ⚠️ | ❌ | 604326, 606008 |
| C.1-4 GRU N/D | ⚠️ | ⚠️ | 596230 (REsp), 596222 (REsp §2°) |
| C.1-5 GRU outro processo | ⚠️ | ❌ | 596214 |
| C.2-1 ambas agendamentos | ❌ | ❌ | Derivar |
| C.2-2 ambas valores divergentes | ❌ | ❌ | SEM REFERÊNCIA |
| C.2-3 ambas nº processo | ❌ | ❌ | Derivar |
| C.2-4 ambas N/D | ⚠️ | ⚠️ | 596230 (REsp), 596237 (RE) |
| C.2-5 ambas guias outros processos | ⚠️ | ❌ | 596214, 596217 |
| C.3-1 FUNJUS agendamento | ❌ | ❌ | Derivar |
| C.3-2 FUNJUS valor divergente | ❌ | ❌ | SEM REFERÊNCIA |
| C.3-3 FUNJUS nº processo | ⚠️ | ❌ | 596347 |
| C.3-4 FUNJUS N/D | ⚠️ | ⚠️ | 596222 (REsp), 596227 (RE) |
| C.3-5 FUNJUS justaposição | ⚠️ | ❌ | 608076 |

### Intempestivo (D)

| Caminho | REsp | RE | PDF Ref |
|---------|:----:|:--:|---------|
| D-1 Pagamento fora do prazo | ✅ | ❌ | 607948, 627206, 670304 |
| D-2 Comprovante fora do prazo | ✅ | ❌ | 607949 |

### Casos Especiais (não mapeados na árvore-alvo)

| Caso | PDF Ref | Status |
|------|---------|--------|
| Após indeferimento JG + inércia | 0002812, 606190, 672340 | ⚠️ Mapear como C.1-4 ou nó novo |
| Após indeferimento JG + dobro + pedido JG | 604597, 676412 | ⚠️ Mapear como C.1-3 ou nó novo |
| JUNTAR DECRETO + DOBRO | 615885, 646311, 677400 | ⚠️ Mapear como B.4 + D ou nó combinado |
| Desistência JG + dobro | 0015914 | ⚠️ Mapear como B.(novo) |
| Recolhimento FUNJUS pela guia GRU | 596214, 596217 | ⚠️ Mapear como A.3-2 ou C.1-5 |
| FUNJUS valores novos 18/03/2025 | 676727 | ⚠️ Template de valores atualizados |
| Divergência código barras GRU | 628802, 596347 | ⚠️ Mapear separado de "ausência" |
| Comprovante de agendamento FUNJUS | nao_tem_comprovante_de_agendamento | ⚠️ Derivar para todos os caminhos |
| Número único processo divergente | 0148996 | ⚠️ Mapear como A.3-1 ou A.4-3 |

---

## Anexo B — Correções Específicas do Reviewer (correcoes.docx)

> Transcrição das anotações da equipe TJPR nos PDFs, com mapeamento para tasks.

| Anotação Reviewer | Task Relacionada | Ação |
|---|---|---|
| "FALTA MINUTA 596358" | S3-T1 | Criar template complementação GRU com valores 2026 |
| "FALTA MINUTA 596359" | S3-T1 | Criar template complementação GRU para RE |
| "FALTOU MINUTA 596359" (REsp) | S3-T1 | Mesmo que acima |
| "FALTOU MINUTA 670588" | S3-T1 | Template complementação GRU sem comprovante (valores 02/2026) |
| "FALTOU MINUTA 676727" | S3-T10, S4-T2 | Template complementação FUNJUS (valores 18/03/2025) |
| "ESSE NÃO TEM - COMPROVANTE DE AGENDAMENTO - COLOCAR PARA TODOS" | S3-T3, S3-T5 | Adicionar variante "comprovante de agendamento" em TODOS os caminhos de complementação e dobro |
| "NESTE CASO, VAI SER NECESSÁRIO ALTERAR O VALOR, VISTO QUE É RE E NÃO RESP" | S4-T5 | RE usa valores STF, não STJ. Garantir templates diferenciados |
| "ESSES NÃO SERIAM DOBRO - SERIA SIMPLES" | S3-T16 | Verificar base legal caso a caso (§2° vs §4°) |
| "QUANDO A PARTE DESISTE DA J.G. AS CUSTAS SÃO EM DOBRO" | S3-T17 | Criar template específico para pós-indeferimento JG |
| "FALTOU MINUTA 596347" | S3-T9, A.4-3 | Template complementação FUNJUS código barras REsp |
| "FALTOU MINUTA 596757" | S3-T9 | Template complementação FUNJUS ausência código barras |
| "FALTOU MINUTA 596798" | S3-T7 | Template complementação GRU ausência código barras |
| "FALTOU MINUTA 596212" | S3-T12 | Template dobro para RE |
| "FALTOU MINUTA 628802" | S3-T7 | Template divergência código barras GRU |
| "ESSE NÃO TEM MODELO" (para alguns nós) | S3-T4, S3-T6 | Manter como SEM_REFERENCIA até preenchimento manual |
| "NESTE CASO - ALTERAR PARA DIVERGÊNCIA DE CÓDIGO DE BARRAS" | S2-T5 | Separar "divergência" de "ausência" |
| "INCLUIR AUSÊNCIA DE CÓDIGO DE BARRAS" | S2-T5 | Criar nó distinto para ausência |
| "UTILIZAR O MESMO MODELO" (615885, 646311) | S3-T23 | Derivar template JUNTAR DECRETO + DOBRO |
| "UTILIZAR PARA RE E RESP E ALTERAR VALORES APÓS" | S4-T5 | Template base serve para ambos, valores diferem |

---

## Anexo C — Estatísticas

| Métrica | Valor |
|---------|-------|
| Caminhos-alvo (árvore final) | 43 únicos × 2 = 86 |
| Caminhos no fluxo atual (flow.ts) | 33 folhas × 2 = 66 |
| Caminhos AUSENTES no fluxo atual | 17 |
| Caminhos a REMOVER do fluxo atual | 2 (IE-01, IE-05) |
| PDFs de referência disponíveis | 70 |
| Templates SEM referência | ~17 |
| Templates com referência (parcial ou total) | ~26 |
| REsp com template | ~15 |
| RE com template | ~3 (maioria SEM REFERENCIA para RE) |

---

## Ordem de Execução Recomendada

```
Sprint 0 (bloqueante) → Sprint 1 (correções imediatas) → Sprint 2 (reestruturação) → Sprint 3 (templates) → Sprint 4 (valores) → Sprint 5 (validação)
```

Sprints 1 e 2 podem ser executados em paralelo por agentes diferentes (flow.ts vs minutaTemplates.ts), mas Sprint 2 exige que Sprint 1 esteja completo antes do merge. Sprint 3 depende de Sprint 2 (novos nós). Sprint 4 pode executar em paralelo com Sprint 3. Sprint 5 exige tudo completo.