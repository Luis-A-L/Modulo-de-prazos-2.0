# Auditoria do Fluxo — Gerador de Minutas TJPR

**Escopo:** Comparação entre os três documentos de referência e o estado atual de `src/data/flow.ts` (pós-refatoração).
**Não inclui:** análise de textos das minutas (fora do escopo definido).
**Data:** 2026-03-31

---

## Documentos Auditados

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | `3.1 Novo manual do triário.pdf` | Manual de uso do SIMBA-RTS (Pág. 1–14) |
| 2 | `3.2 Manual de triagem Prático.pdf` | Manual prático da triagem com exemplos reais |
| 3 | `Manual STJ RESP 15JUN25_Capa.pdf` | Manual de admissibilidade recursal do STJ (9.576 linhas) |

---

## Resumo Executivo

Foram identificadas **10 inconsistências**, sendo **3 críticas** (base legal errada ou resultado inverso ao previsto) e **7 estruturais** (lacunas no fluxo, cenários ausentes, nomenclatura confusa).

---

## INCONSISTÊNCIAS CRÍTICAS

### IC-01 — A.1 usa §7° quando deveria usar §4°

**Categoria do app:** A.1 — Falta só a guia (GRU ausente / FUNJUS ausente)
**Resultado atual:** INTIMAÇÃO — art. 1.007 §7° CPC
**Problema:**

O §7° trata de "equívoco no preenchimento da guia" (guia presente com dado errado).
Quando a guia está **ausente** (não foi juntada), o STJ aplica o §4° (inexistência de preparo → intimar para pagar em dobro), não o §7°.

> STJ — AgInt no AREsp n. 2.258.023/GO (2023):
> "a intimação para complementação do preparo somente é admitida quando pago o valor de forma insuficiente, e **não por ausência das guias de recolhimento**, como no caso dos autos, por operada a preclusão consumativa"
> "Considera-se deserto o recurso especial interposto **sem a comprovação do preparo mediante a apresentação conjunta** dos comprovantes de pagamento das custas processuais e das respectivas guias de recolhimento da União."

**Impacto:** A minuta gerada cita §7° e dá prazo de 5 dias para "corrigir equívoco", mas o correto seria §4° intimando ao recolhimento em dobro (ou, segundo a jurisprudência mais rígida, poderia ser diretamente deserção por preclusão consumativa).

**Recomendação:** Revisar com os Assessores qual a prática atual da 1ª Vice-Presidência:
- Se for prática intimar pelo §4° (dobro): mover A.1 para a categoria B (Pagamento em Dobro).
- Se for prática decretar deserção diretamente: mover A.1 para a categoria C (Deserção).
- Se for prática local usar §7° como concessão de oportunidade: manter, mas documentar como desvio intencional da jurisprudência do STJ.

---

### IC-02 — Tratamento inconsistente de "guia de outro processo" entre A e C

**Categorias envolvidas:**
- A.3 (Complementação — Irregularidade GRU): "Guia pertencente a outro processo" → **INTIMAÇÃO §7°**
- C.1 (Deserção GRU): "Guia pertencente a outro processo" → **DESERÇÃO**
- A.4 (Complementação — Irregularidade FUNJUS): "Guia pertencente a outro processo" → **INTIMAÇÃO §7°** (fundamento citado incorretamente como §2°)

**Problema:** O mesmo fato (guia de outro processo) leva a resultados opostos (intimação vs. deserção) dependendo de qual categoria o usuário escolheu, sem um critério claro de distinção na interface. Conforme o manual 3.1 (p. 7-8), apresentar guia de outro processo junto com comprovante compatível é **má-fé** para burlar as custas — o que deveria levar diretamente a deserção, não a uma segunda chance.

**Observação adicional:** Em A.4, a jurisprudência citada deveria ser AgInt AREsp 2.665.947/MS (código de barras/má-fé), não genérica de §2°.

**Recomendação:**
- Definir se a distinção A vs. C é temporal (A = primeiro contato, C = após intimação não atendida). Se sim: documentar isso explicitamente na interface para o usuário, com uma pergunta "já foi intimado anteriormente?".
- Para o caso de má-fé (justaposição), considerar que a deserção seja direta (sem intimação prévia), alinhada com a jurisprudência do STJ.

---

### IC-03 — A.4 cita §2° para "sem número de processo" e "guia de outro processo"

**Categoria:** A.4 (Irregularidade FUNJUS — GRU regular)
**Resultados afetados:**
- "Sem número de processo / número incorreto" → INTIMAÇÃO §7° ✅ (correto), mas fundamento no arquivo arvore_final.md não cita §7° explicitamente para estas.
- "Guia pertencente a outro processo" → INTIMAÇÃO §2° ❌

**Problema:** "Sem número" é equívoco de preenchimento = §7°. "Valor divergente/insuficiente" é insuficiência = §2°. "Guia de outro processo" é fraude/vício insan ável — não há base no §2° para isso.

**Recomendação:** Alinhar a base legal de cada opção de A.4 corretamente:
- Agendamento/em análise → §4°
- Valor divergente/insuficiente → §2°
- Sem número/incorreto → §7°
- Guia de outro processo → (discutir se é §7° com intimação ou deserção direta)

---

## INCONSISTÊNCIAS ESTRUTURAIS

### IE-01 — B.1 e A.3/A.4 tratam "sem número de processo" com bases legais diferentes

**B.1** "2 guias sem número / número incorreto" → §4° (inexistência/dobro)
**A.3** "Sem número de processo" → §7° (equívoco de preenchimento)
**A.4** "Sem número de processo" → §7° (correto per STJ)

Se ausência de número é um equívoco de preenchimento (§7°), deveria ser §7° em todos os contextos, não §4° em B.1.

**Recomendação:** Remover a opção "2 guias sem número" da categoria B (Pagamento em Dobro), pois o tratamento correto é a intimação por §7° para cada guia individualmente (A.3 + A.4).

---

### IE-02 — Ausência de cenário: "guia ausente após intimação não atendida" em C

A categoria C (Deserção) tem opções para agendamento, valor divergente, N/D, etc., mas **não tem uma opção explícita para "guia ausente (não juntada mesmo após intimação)"**. Se A.1 intima por §7° e a parte não cumpre, qual caminho o usuário segue em C? Não há opção correspondente em C.1 ou C.3.

**Recomendação:** Adicionar em C.1 a opção "Guia GRU nunca juntada / não apresentada após intimação" e em C.3 a opção análoga para FUNJUS, com deserção por descumprimento do §7°.

---

### IE-03 — B.3 (Autos físicos) pode ser obsoleto no contexto do PROJUDI

**B.3:** "Autos físicos não digitalizados (N/D) — 3 guias (GRU + FUNJUS + porte de remessa)" → §4° + Súmula 187/STJ.

O manual 3.2 e o SIMBA-RTS (manual 3.1) operam exclusivamente em PROJUDI (processo eletrônico). O §3° do art. 1.007 CPC dispensa o porte de remessa em autos eletrônicos. B.3 pressupõe autos físicos, que podem ser residuais na prática atual.

**Recomendação:** Verificar com a equipe se ainda existem processos físicos na triagem. Se não, avaliar se B.3 pode ser removido ou substituído por um cenário mais atual. Se mantido, incluir uma nota explicativa na opção do fluxo.

---

### IE-04 — Agendamento bancário: §4° ou §2°?

O app usa §2° (insuficiência) para agendamentos em A.2 (só o comprovante ausente) e §4° para agendamentos em B.1 (ambas as guias com agendamento). O STJ é claro:

> STJ — Manual, p. 6: "comprovante deve ser definitivo de pagamento, não agendamento"

O agendamento é tratado como **não-pagamento** (inexistência), portanto §4° (pagar em dobro) é o fundamento correto — não §2° (insuficiência de valor). A.2 cita §2° para "Agendamento / em análise", o que parece errado.

**Recomendação:** Revisar A.2 e A.4: opções de "agendamento" deveriam usar §4° (dobro), não §2° (complementação).

---

### IE-05 — Categoria D (Intempestivo) acessível por duas rotas sem distinção clara

D.Intempestivo é acessível:
1. **Diretamente** via seleção do tipo de irregularidade "D. Intempestivo"
2. **Via C.1** (Deserção GRU) → "Inadmissão por intempestividade"

Não está claro ao usuário a diferença entre acessar D diretamente vs. passar por C.1. Qual é o critério? A rota C.1 → D implica que o usuário primeiro identificou "deserção GRU" e depois escolheu intempestividade? Isso é confuso.

**Recomendação:** Eliminar o acesso a "intempestivo" via C.1. Manter D como categoria autônoma e separar claramente: se o preparo foi feito fora do prazo, o usuário vai diretamente a D, independentemente de qual guia foi afetada.

---

### IE-06 — Manual 3.2 menciona "guia originária da árvore" para FUNJUS, sem cenário correspondente no fluxo

O manual 3.2 (p. 109): "O Funjus... conferir se a guia é originaria daquela arvore processual (observando na guia o número do recurso originário)". Esta verificação de "originalidade" (guia gerada para este processo vs. reaproveitada de outro) está mapeada apenas em C.3 como "Justaposição de guia FUNJUS" (deserção). Mas o primeiro contato com essa irregularidade (antes de qualquer intimação) não tem caminho explícito no fluxo.

**Recomendação:** Adicionar em A.4 uma opção específica: "Guia FUNJUS originária de outro processo (justaposição)" → INTIMAÇÃO §7° (ou deserção direta conforme prática local, ver IC-02).

---

### IE-07 — Ausência de cenário: "GRU ausente + FUNJUS com irregularidade" (ou vice-versa)

As categorias A e B cobrem casos onde ambas as guias têm o mesmo tipo de problema ou onde cada guia tem problema diferente de forma isolada. Mas não existe caminho para: **GRU completamente ausente + FUNJUS com valor divergente** (situações mistas entre ausência total de uma e irregularidade parcial de outra).

O usuário nesses casos teria que escolher entre B (pagamento em dobro de ambas) ou iterar pelas categorias individualmente, o que pode gerar minutas incorretas.

**Recomendação:** Avaliar se cenários mistos (guias em situações diferentes entre si) precisam de um sub-fluxo próprio, ou se a prática da 1ª Vice-Presidência é sempre intimar pelo item mais grave (ausência = §4° de ambas).

---

## Tabela de Referência Cruzada — Bases Legais

| Situação | Base Correta (STJ) | App Atual | Status |
|----------|-------------------|-----------|--------|
| Guia ausente (não juntada) | §4° (dobro) ou deserção | §7° (equívoco) | ❌ IC-01 |
| Valor insuficiente | §2° (complementar em 5 dias) | §2° | ✅ |
| Agendamento bancário | §4° (dobro — não é pagamento) | §2° em A.2 / §4° em B.1 | ⚠️ IE-04 |
| Número do processo errado na guia | §7° (equívoco, 5 dias) | §7° | ✅ |
| Guia de outro processo | §7° ou deserção direta (depende da prática) | §7° em A / Deserção em C | ⚠️ IC-02 |
| Intimado §4°, pagou simples | Deserção (§4°-5°) | Deserção | ✅ |
| Comprovante juntado fora do prazo recursal | Inadmissão (art. 1.003 §5°) | Inadmissão | ✅ |
| Processo eletrônico — porte de remessa | Dispensado (§3°) | Apenas em B.3 | ⚠️ IE-03 |

---

## Achados dos Manuais TJPR (3.1 e 3.2) vs. Fluxo

| Manual | Diretriz | Implementado no Fluxo? |
|--------|---------|------------------------|
| 3.2 p.73-75 | Verificar data do pagamento (dia da interposição ou dia seguinte) | ✅ Via B.4 (pagamento intempestivo) |
| 3.2 p.104 | GRU: verificar valor, cód. de barras e número do processo na guia | ✅ Coberto em A.3, C.1 |
| 3.2 p.109 | FUNJUS: verificar originalidade (guia originária da árvore) | ⚠️ Só em C.3, não em A.4 (IE-06) |
| 3.2 p.74 | Agendamento ≠ comprovante de pagamento | ⚠️ Implementado mas com §§ errados (IE-04) |
| 3.1 p.7 | Guia FUNJUS de outro processo = má-fé (fraude) | ⚠️ Tratado diferente em A vs. C (IC-02) |
| 3.1 p.5-6 | JG tácita e pedido de JG no recurso dispensam preparo | ❌ Não há caminho no fluxo para "JG solicitada no recurso" |

---

## Cenários Ausentes no Fluxo (a confirmar com a equipe)

1. **JG solicitada no próprio recurso** (3.1 p. 6; 3.2 p. 89-91): parte solicita JG no bojo do recurso → não exige preparo. Não há saída específica no fluxo para este caso.

2. **Guia GRU ausente após intimação não atendida** (ausência de opção em C.1): IC-01 + IE-02.

3. **FUNJUS com justaposição / originalidade — primeiro contato** (antes da deserção): IE-06.

4. **Cenários mistos (uma guia ausente + outra com valor divergente)**: IE-07.

5. **PagTesouro / boleto vencido**: O GRU atualmente é gerado via `stj.jus.br` com vencimento. Guia vencida antes do pagamento — não há cobertura específica.

---

## Priorização

| # | Inconsistência | Impacto | Prioridade |
|---|---------------|---------|------------|
| IC-01 | A.1 usa §7° ao invés de §4° | Alto — cita base legal errada nas minutas | 🔴 Alta |
| IC-02 | "Guia de outro processo" inconsistente entre A e C | Alto — mesma situação, resultados opostos | 🔴 Alta |
| IC-03 | A.4 cita §2° para situações de §7° | Médio — base legal errada | 🟡 Média |
| IE-04 | Agendamento com §2° em vez de §4° | Médio — resultado correto mas §§ divergente do STJ | 🟡 Média |
| IE-02 | Sem caminho em C para "guia ausente após intimação" | Médio — usuário não tem saída correta | 🟡 Média |
| IE-01 | B.1 trata "sem número" com §4° e A.3/A.4 com §7° | Médio — inconsistência de tratamento | 🟡 Média |
| IE-06 | FUNJUS justaposição só em C, não em A (primeiro contato) | Baixo-médio | 🟢 Baixa |
| IE-05 | D acessível via C.1 sem critério claro | Baixo — UX confusa | 🟢 Baixa |
| IE-03 | B.3 (autos físicos) pode ser obsoleto | Baixo — confirmar com equipe | 🟢 Baixa |
| IE-07 | Cenários mistos (ausência + irregularidade mistas) | Baixo — casos raros | 🟢 Baixa |

---

## Próximos Passos Sugeridos

1. **Reunião com Assessores** para validar as dúvidas de IC-01 e IC-02 (prática real da 1ª Vice-Presidência sobre guia ausente e guia de outro processo).
2. **Corrigir IC-03 e IE-04** (ajuste de §§ nas minutas de A.4 e A.2 para agendamentos).
3. **Adicionar cenário IE-02** (opção em C.1 e C.3 para guia nunca juntada após intimação).
4. **Revisar ou remover B.1 opção "sem número"** (IE-01) — duplicidade com A.3/A.4.
5. **Confirmar situação do B.3** com a equipe (processos físicos residuais?).
