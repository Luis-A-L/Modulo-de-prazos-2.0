# FLOW_SPEC — Especificação Completa da Árvore de Decisão

> **Alimenta a implementação de `src/data/flow.ts`.**
> **Base jurídica:** CPC/2015 (arts. 932 §único, 1.007, 1.023, 1.029, 1.042), Lei 9.099/95 (art. 54),
> Súmula 187/STJ, Resolução STJ 01/2016.
> **Fonte primária:** Manual de Admissibilidade Recursal — STJ/CEFOR, Prof. Dr. Fabiano Tesolin (jun/2025).
> Os snippets são textos prontos para composição da minuta; concatenados com espaço pelo `App.tsx`.

---

## Fundamentos Jurídicos por Ramo

| Ramo | Base legal | Lógica |
|------|-----------|--------|
| **Complementação** | Art. 1.007, §2° CPC | Preparo pago, mas valor **insuficiente** → intimação para complementar em 5 dias |
| **Equívoco de preenchimento** | Art. 1.007, §7° CPC | Guia com erro formal (número de processo, tipo errado) → relator intima para sanar em 5 dias |
| **Dobro** | Art. 1.007, §4° CPC | Preparo **não comprovado** no ato → intimação para recolher em **dobro** |
| **Deserção** | Art. 1.007, §4°-5° CPC | Prazo de dobro ou complementação esgotado sem atendimento → decreto de deserção |
| **Ausência de preparo** | Arts. 1.023, 1.042 §2° CPC | EDcl, AREsp e AgInt **não exigem preparo** |

> ⚠️ **Distinção crítica (Súmula 187/STJ + julgados da Corte Especial):**
> - A intimação para **complementar** (§2°) só cabe quando houve **pagamento com valor insuficiente**.
> - Quando não há pagamento algum → aplica-se o §4° (dobro), não o §2°.
> - Comprovante de **agendamento bancário** NÃO é preparo válido: "a mera juntada do comprovante
>   de agendamento não constitui meio apto à comprovação de que o preparo foi efetivamente recolhido"
>   (AgInt nos EDcl no AREsp n. 2.054.401/GO, STJ, 3ª Turma, 2023).
> - GRU e comprovante de pagamento devem ser juntados **simultaneamente**; só o comprovante sem a
>   GRU = deserção sem nova oportunidade (preclusão consumativa — AgInt no AREsp n. 2.258.023/GO).

---

## Convenções

- **Chave** (snake_case) → valor do campo `proximo` em `flow.ts`
- Nós terminais → `proximo: "final"`
- Prazo padrão de intimação: **5 (cinco) dias úteis**
- Penalidade complementação: **"sob pena de deserção (art. 1.007, §2°, do CPC)"**
- Penalidade dobro: **"sob pena de não conhecimento do recurso (art. 1.007, §4°, do CPC)"**
- Decreto de deserção: **"art. 1.007, §4°-5°, do CPC"**

---

## NÍVEL 0 — Raiz: Tipo de Recurso

```
chave: "inicio"
pergunta: "Qual o tipo de recurso/ação em análise?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| Apelação | `classif_irregularidade` | `"Recurso de Apelação."` |
| Recurso Inominado (JEC) | `classif_irregularidade` | `"Recurso Inominado (Juizados Especiais)."` |
| Agravo de Instrumento | `classif_irregularidade` | `"Agravo de Instrumento."` |
| Recurso Especial (REsp) | `classif_irregularidade` | `"Recurso Especial (REsp)."` |
| Agravo em REsp (AREsp) | `final` | `"Agravo em Recurso Especial (AREsp). Não há exigência de preparo recursal para o AREsp (art. 1.042, §2°, do CPC). Recurso regular quanto ao preparo."` |
| Agravo Interno (AgInt) | `final` | `"Agravo Interno/Regimental. O AgInt não está sujeito a preparo recursal. Recurso regular quanto ao preparo."` |
| Embargos de Declaração (EDcl) | `final` | `"Embargos de Declaração. Os EDcl não se sujeitam a preparo (art. 1.023, do CPC). Recurso regular quanto ao preparo."` |

---

## NÍVEL 1 — Classificação da Irregularidade

```
chave: "classif_irregularidade"
pergunta: "Qual a classificação da irregularidade no preparo?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| Complementação (pagamento insuficiente / vício formal) | `complementacao` | `"Trata-se de caso de complementação de preparo."` |
| Pagamento em Dobro (preparo não comprovado no ato) | `dobro` | `"Trata-se de recolhimento não comprovado no ato da interposição, sujeito ao pagamento em dobro (art. 1.007, §4°, do CPC)."` |
| Deserção (prazo de regularização esgotado) | `desercao` | `"Trata-se de hipótese de deserção por irregularidade insanável ou prazo de regularização não atendido."` |

---

## RAMO 2 — COMPLEMENTAÇÃO

> Aplica-se quando houve tentativa de pagamento, mas o preparo está com valor insuficiente
> ou com vício formal no preenchimento (art. 1.007, §2° e §7°, CPC).

### Nó: `complementacao`
```
pergunta: "Qual é a natureza da pendência documental?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| Falta só a guia (pagamento feito, mas formulário GRU/FUNJUS não juntado) | `comp_falta_guia` | `"Constatada a ausência do formulário de guia de recolhimento, embora o comprovante de débito exista."` |
| Falta só o comprovante de pagamento (guia presente, sem recibo) | `comp_falta_comprovante` | `"A guia foi juntada; todavia, o comprovante de débito efetivo está ausente."` |
| Irregularidade na guia GRU (FUNJUS está regular) | `comp_irr_gru` | `"Verificada irregularidade na guia GRU; a guia FUNJUS encontra-se regular."` |
| Irregularidade na guia FUNJUS (GRU está regular) | `comp_irr_funjus` | `"Verificada irregularidade na guia FUNJUS; a guia GRU encontra-se regular."` |

---

### Nó: `comp_falta_guia`
```
pergunta: "Qual guia (documento) está ausente?"
```

> **Escopo confirmado (TJPR):** O pagamento foi realizado — o comprovante bancário de débito
> existe — mas o formulário GRU ou FUNJUS não foi juntado aos autos. Vício formal sanável (§7°).
> **Ausência de pagamento = Ramo Dobro.** Guia ausente + sem comprovante = §4° (dobro).

| Opção | proximo | snippet |
|-------|---------|---------|
| GRU | `final` | `"Intime-se a parte recorrente para, no prazo de 5 (cinco) dias úteis, proceder à juntada da guia GRU correspondente ao recolhimento já efetuado, sob pena de deserção (art. 1.007, §7°, do CPC)."` |
| FUNJUS | `final` | `"Intime-se a parte recorrente para, no prazo de 5 (cinco) dias úteis, proceder à juntada da guia FUNJUS correspondente ao recolhimento já efetuado, sob pena de deserção (art. 1.007, §7°, do CPC)."` |

---

### Nó: `comp_falta_comprovante`
```
pergunta: "Comprovante de qual guia está ausente?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| GRU | `final` | `"Intime-se a parte recorrente para, no prazo de 5 (cinco) dias úteis, juntar o comprovante de débito efetivo referente à guia GRU. Ressalta-se que comprovante de agendamento bancário não constitui prova de quitação, sob pena de deserção (art. 1.007, §7°, do CPC)."` |
| FUNJUS | `final` | `"Intime-se a parte recorrente para, no prazo de 5 (cinco) dias úteis, juntar o comprovante de débito efetivo referente à guia FUNJUS. Ressalta-se que comprovante de agendamento bancário não constitui prova de quitação, sob pena de deserção (art. 1.007, §7°, do CPC)."` |

---

### Nó: `comp_irr_gru`
```
pergunta: "Qual a irregularidade constatada na guia GRU?"
```

| Opção | proximo | snippet | Base legal |
|-------|---------|---------|------------|
| Agendamento / em análise (transação não efetivada) | `final` | `"O comprovante da guia GRU refere-se a agendamento bancário ainda não efetivado (transação pendente/em análise). Comprovante de agendamento não constitui prova de recolhimento efetivo. Intime-se para, no prazo de 5 (cinco) dias úteis, apresentar comprovante de débito definitivo da guia GRU, sob pena de deserção (art. 1.007, §7°, do CPC)."` | §7° (vício formal) |
| Valor divergente / insuficiente (e val. falso) | `final` | `"O comprovante da guia GRU apresenta valor divergente do exigido (insuficiência de preparo). Intime-se para, no prazo de 5 (cinco) dias úteis, efetuar o recolhimento complementar da diferença na guia GRU, sob pena de deserção (art. 1.007, §2°, do CPC)."` | §2° (insuficiência) |
| Sem número de processo / número incorreto | `final` | `"A guia GRU não contém o número do processo ou apresenta numeração incorreta, impossibilitando a vinculação eletrônica do recolhimento ao feito. Intime-se para, no prazo de 5 (cinco) dias úteis, juntar guia GRU com a correta identificação processual, sob pena de deserção (art. 1.007, §7°, do CPC)."` | §7° (equívoco no preenchimento) |
| Pago a destempo — PAD (após o prazo recursal) | `final` | `"O recolhimento da guia GRU foi efetuado após o prazo recursal (recolhimento intempestivo). Intime-se para, no prazo de 5 (cinco) dias úteis, regularizar o recolhimento da guia GRU, sob pena de deserção."` | §2°/§4° (conforme análise) |
| Guia pertencente a outro processo | `final` | `"A guia GRU juntada pertence a outro processo ou recurso, não sendo imputável ao presente feito. Intime-se para, no prazo de 5 (cinco) dias úteis, juntar a guia GRU correspondente a este processo, sob pena de deserção (art. 1.007, §7°, do CPC)."` | §7° (equívoco) |

---

### Nó: `comp_irr_funjus`
```
pergunta: "Qual a irregularidade constatada na guia FUNJUS?"
```

| Opção | proximo | snippet | Base legal |
|-------|---------|---------|------------|
| Agendamento / em análise | `final` | `"O comprovante da guia FUNJUS refere-se a agendamento bancário ainda não efetivado. Comprovante de agendamento não constitui prova de recolhimento efetivo. Intime-se para, no prazo de 5 (cinco) dias úteis, apresentar comprovante de débito definitivo da guia FUNJUS, sob pena de deserção (art. 1.007, §7°, do CPC)."` | §7° |
| Valor divergente / insuficiente | `final` | `"O comprovante da guia FUNJUS apresenta valor divergente do exigido. Intime-se para, no prazo de 5 (cinco) dias úteis, efetuar o recolhimento complementar da diferença na guia FUNJUS, sob pena de deserção (art. 1.007, §2°, do CPC)."` | §2° |
| Sem número de processo / número incorreto | `final` | `"A guia FUNJUS não contém o número do processo ou apresenta numeração incorreta. Intime-se para, no prazo de 5 (cinco) dias úteis, juntar guia FUNJUS com a correta identificação processual, sob pena de deserção (art. 1.007, §7°, do CPC)."` | §7° |
| Pago a destempo — PAD | `final` | `"O recolhimento da guia FUNJUS foi efetuado após o prazo recursal. Intime-se para, no prazo de 5 (cinco) dias úteis, regularizar o recolhimento da guia FUNJUS, sob pena de deserção."` | §2°/§4° |
| Guia pertencente a outro processo | `final` | `"A guia FUNJUS juntada pertence a outro processo ou recurso. Intime-se para, no prazo de 5 (cinco) dias úteis, juntar a guia FUNJUS correspondente a este processo, sob pena de deserção (art. 1.007, §7°, do CPC)."` | §7° |

---

## RAMO 3 — PAGAMENTO EM DOBRO

> Aplica-se quando o preparo **não foi comprovado** no ato da interposição — situação mais grave
> que a mera insuficiência. A parte é intimada para recolher **em dobro** (art. 1.007, §4°, CPC).
> Se recolher em dobro com valor insuficiente → vedada complementação (§5°) → deserção.

### Nó: `dobro`
```
pergunta: "Qual é a situação documental do preparo no momento da interposição?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| Falta só a guia (GRU + FUNJUS ausentes — sem nenhum documento) | `dobro_falta_guia` | `"Verificada a ausência das guias de recolhimento GRU e FUNJUS no ato da interposição."` |
| Falta só o comprovante (GRU + FUNJUS sem comprovante de débito) | `dobro_falta_comprovante` | `"As guias GRU e FUNJUS foram juntadas; os comprovantes de débito efetivo estão ausentes."` |
| Autos não digitalizados — processo físico (N/D) | `dobro_nd` | `"Tratando-se de processo físico não digitalizado, verificada ausência ou irregularidade de recolhimento do preparo."` |

---

### Nó: `dobro_falta_guia`
```
pergunta: "Qual a razão identificada para a ausência das guias GRU e FUNJUS?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| 2 agendamentos / em análise | `final` | `"Os documentos apresentados para GRU e FUNJUS referem-se a agendamentos bancários não efetivados, o que não constitui comprovação válida do preparo. Intime-se para, no prazo de 5 (cinco) dias úteis, efetuar o recolhimento em dobro de GRU e FUNJUS com comprovantes de débito efetivo, nos termos do art. 1.007, §4°, do CPC, sob pena de não conhecimento do recurso."` |
| 2 valores divergentes / insuficientes | `final` | `"As guias GRU e FUNJUS apresentam valores inferiores aos exigidos. Intime-se para, no prazo de 5 (cinco) dias úteis, efetuar o recolhimento em dobro dos valores corretos de ambas as guias, nos termos do art. 1.007, §4°, do CPC, sob pena de não conhecimento do recurso."` |
| 2 guias sem número / número incorreto de processo | `final` | `"As guias GRU e FUNJUS não identificam o número do processo ou apresentam numeração incorreta. Intime-se para, no prazo de 5 (cinco) dias úteis, recolher em dobro GRU e FUNJUS com correta identificação processual, nos termos do art. 1.007, §4°, do CPC, sob pena de não conhecimento do recurso."` |
| 2 não localizadas / não disponíveis (N/D) | `final` | `"Não localizados nos autos comprovantes de recolhimento das guias GRU e FUNJUS. Intime-se para, no prazo de 5 (cinco) dias úteis, efetuar o recolhimento em dobro de ambas as guias, nos termos do art. 1.007, §4°, do CPC, sob pena de não conhecimento do recurso."` |
| 2 guias pertencentes a outros processos | `final` | `"As guias GRU e FUNJUS juntadas pertencem a outros processos ou recursos, não sendo imputáveis ao presente feito. Intime-se para, no prazo de 5 (cinco) dias úteis, efetuar o recolhimento em dobro das guias GRU e FUNJUS correspondentes a este processo, nos termos do art. 1.007, §4°, do CPC, sob pena de não conhecimento do recurso."` |

---

### Nó: `dobro_falta_comprovante`
```
pergunta: "Qual a situação específica dos comprovantes ausentes (GRU + FUNJUS)?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| 2 agendamentos / em análise | `final` | `"Os comprovantes das guias GRU e FUNJUS correspondem a agendamentos não efetivados. Agendamento bancário não constitui prova de quitação. Intime-se para, no prazo de 5 (cinco) dias úteis, apresentar comprovantes de débito definitivo em dobro de ambas as guias, nos termos do art. 1.007, §4°, do CPC, sob pena de não conhecimento do recurso."` |
| 2 valores divergentes / insuficientes | `final` | `"Os comprovantes das guias GRU e FUNJUS registram valores inferiores aos devidos. Intime-se para, no prazo de 5 (cinco) dias úteis, recolher em dobro os valores corretos de ambas as guias e apresentar os comprovantes correspondentes, nos termos do art. 1.007, §4°, do CPC, sob pena de não conhecimento do recurso."` |
| 2 guias sem número / número incorreto de processo | `final` | `"Os comprovantes das guias GRU e FUNJUS não identificam o processo corretamente. Intime-se para, no prazo de 5 (cinco) dias úteis, apresentar comprovantes do recolhimento em dobro com a correta identificação processual, nos termos do art. 1.007, §4°, do CPC, sob pena de não conhecimento do recurso."` |
| 2 não localizados / não disponíveis (N/D) | `final` | `"Ausentes os comprovantes de quitação das guias GRU e FUNJUS. Intime-se para, no prazo de 5 (cinco) dias úteis, juntar os comprovantes do recolhimento em dobro de ambas as guias, nos termos do art. 1.007, §4°, do CPC, sob pena de não conhecimento do recurso."` |
| 2 pertencentes a outros processos | `final` | `"Os comprovantes juntados referem-se a guias de outros processos. Intime-se para, no prazo de 5 (cinco) dias úteis, apresentar comprovantes do recolhimento em dobro das guias GRU e FUNJUS deste feito, nos termos do art. 1.007, §4°, do CPC, sob pena de não conhecimento do recurso."` |

---

### Nó: `dobro_nd`
```
pergunta: "Qual a situação das guias em autos físicos (não digitalizados)?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| 3 guias ausentes / incorretas (GRU + FUNJUS + porte de remessa) | `final` | `"Tratando-se de processo físico não digitalizado, verificada a ausência ou irregularidade das guias de recolhimento (GRU, FUNJUS e porte de remessa e retorno). Intime-se para, no prazo de 5 (cinco) dias úteis, efetuar o recolhimento em dobro das guias GRU, FUNJUS e porte de remessa e retorno com a correta identificação processual, nos termos do art. 1.007, §4°, do CPC e Súmula 187/STJ, sob pena de não conhecimento do recurso."` |

---

## RAMO 4 — DESERÇÃO

> Aplica-se quando: (a) o prazo de complementação (§2°) foi concedido e não atendido; ou
> (b) o prazo de recolhimento em dobro (§4°) foi concedido e não atendido; ou
> (c) a irregularidade é insanável (ex: justaposição de guia).
> Resultado: decreto de deserção com fundamento nos §§4°-5° do art. 1.007 do CPC.

### Nó: `desercao`
```
pergunta: "Qual guia apresenta irregularidade definitiva (ensejando a deserção)?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| Irregularidade definitiva na GRU (FUNJUS regular) | `desercao_gru` | `"Verificada irregularidade definitiva na guia GRU, não regularizada no prazo assinado."` |
| Irregularidade definitiva em ambas (GRU + FUNJUS) | `desercao_ambas` | `"Verificada irregularidade definitiva nas guias GRU e FUNJUS, não regularizadas no prazo assinado."` |
| Irregularidade definitiva na FUNJUS (GRU regular) | `desercao_funjus` | `"Verificada irregularidade definitiva na guia FUNJUS, não regularizada no prazo assinado."` |

---

### Nó: `desercao_gru`
```
pergunta: "Qual a irregularidade que fundamenta a deserção na GRU?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| Agendamento não efetivado | `final` | `"O comprovante da guia GRU refere-se a agendamento bancário que não foi efetivado, o que não constitui prova de quitação. Comprovante de agendamento não sana o preparo. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |
| Valor divergente (insuficiente) | `final` | `"O comprovante da guia GRU apresenta valor divergente do exigido, não tendo sido efetuada a complementação no prazo assinado. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |
| Sem número de processo / número incorreto | `final` | `"A guia GRU não identifica o processo ou apresenta numeração incorreta, não tendo sido regularizada no prazo assinado. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |
| Não localizada / não disponível (N/D) | `final` | `"Ausente o comprovante de quitação da guia GRU, não tendo sido regularizado o preparo no prazo assinado. Decreto a deserção do recurso por falta de preparo (art. 1.007, §4°-5°, do CPC — Súmula 187/STJ)."` |
| Guia pertencente a outro processo | `final` | `"A guia GRU apresentada pertence a outro processo, não tendo sido juntada a guia correspondente a este feito no prazo assinado. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |

---

### Nó: `desercao_ambas`
```
pergunta: "Qual a irregularidade que fundamenta a deserção nas guias GRU e FUNJUS?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| Agendamentos não efetivados | `final` | `"Os comprovantes das guias GRU e FUNJUS referem-se a agendamentos bancários não efetivados. Comprovante de agendamento não constitui prova de quitação. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |
| Valores divergentes | `final` | `"As guias GRU e FUNJUS apresentam valores divergentes dos exigidos, não tendo sido efetuada a regularização no prazo assinado. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |
| Sem número de processo / número incorreto | `final` | `"As guias GRU e FUNJUS não identificam o processo corretamente, não tendo sido regularizadas no prazo assinado. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |
| Não localizadas / não disponíveis (N/D) | `final` | `"Ausentes os comprovantes de quitação das guias GRU e FUNJUS, não tendo sido regularizado o preparo no prazo assinado. Decreto a deserção do recurso por falta de preparo (art. 1.007, §4°-5°, do CPC — Súmula 187/STJ)."` |
| Guias pertencentes a outros processos | `final` | `"As guias GRU e FUNJUS apresentadas pertencem a outros processos, não tendo sido juntadas as guias correspondentes a este feito no prazo assinado. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |

---

### Nó: `desercao_funjus`
```
pergunta: "Qual a irregularidade que fundamenta a deserção na FUNJUS?"
```

| Opção | proximo | snippet |
|-------|---------|---------|
| Agendamento não efetivado | `final` | `"O comprovante da guia FUNJUS refere-se a agendamento bancário não efetivado. Comprovante de agendamento não constitui prova de quitação. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |
| Valor divergente (insuficiente) | `final` | `"O comprovante da guia FUNJUS apresenta valor divergente do exigido, não tendo sido efetuada a regularização no prazo assinado. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |
| Sem número de processo / número incorreto | `final` | `"A guia FUNJUS não identifica o processo ou apresenta numeração incorreta, não tendo sido regularizada no prazo assinado. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |
| Não localizada / não disponível (N/D) | `final` | `"Ausente o comprovante de quitação da guia FUNJUS, não tendo sido regularizado o preparo no prazo assinado. Decreto a deserção do recurso por falta de preparo (art. 1.007, §4°-5°, do CPC — Súmula 187/STJ)."` |
| Justaposição de guia FUNJUS | `final` | `"Verificada a justaposição de guia FUNJUS nos autos: o comprovante de recolhimento apresentado é o mesmo já utilizado em outro processo ou recurso anterior, não sendo hábil a comprovar o recolhimento neste feito. Trata-se de vício insanável. Decreto a deserção do recurso por irregularidade insanável no preparo (art. 1.007, §4°-5°, do CPC)."` |

---

## Resumo de Nós e Contagem de Terminais

| Ramo | Nós intermediários | Terminais |
|------|--------------------|-----------|
| Raiz (tipo de recurso) | 1 | 3 (AREsp, AgInt, EDcl) |
| Classificação da irregularidade | 1 | — |
| Complementação | 4 | 14 |
| Dobro | 3 | 11 |
| Deserção | 3 | 15 |
| **Total** | **12 + raiz** | **43** |

---

## Notas de Implementação

### 1. Snippets são cumulativos
O `App.tsx` concatena com espaço: o snippet do tipo de recurso + classificação + nós intermediários + terminal formam a minuta completa.

### 2. Distinção §2° vs §7° vs §4° nos snippets
Os snippets já indicam o artigo correto por opção. Tabela de referência rápida:

| Situação | Artigo | Resultado |
|----------|--------|-----------|
| Valor insuficiente | §2° | Intimação para complementar (5 dias) |
| Equívoco formal (número, tipo de guia, agendamento) | §7° | Intimação para sanar (5 dias) |
| Sem preparo algum | §4° | Intimação para dobro (5 dias) |
| Dobro insuficiente | §5° | Deserção imediata (sem nova chance) |
| Prazo não atendido | §4°-5° | Decreto de deserção |
| Justaposição | Insanável | Decreto de deserção direto |

### 3. Agendamento bancário
Mencionado em **todos** os snippets de agendamento que não constitui prova válida, com base na jurisprudência consolidada do STJ (AgInt nos EDcl no AREsp n. 2.054.401/GO, 3ª Turma, 2023).

### 4. REsp — apenas GRU federal
Para o REsp, o preparo no tribunal de origem inclui: **GRU (código de receita STJ)** + **porte de remessa e retorno** (dispensado em autos eletrônicos — art. 1.007, §3°, CPC e Resolução 01/2016 do STJ). **NÃO inclui FUNJUS** — a FUNJUS é taxa estadual devida apenas nos recursos perante o TJPR. Considerar adaptar os snippets do REsp para mencionar apenas GRU + porte.

### 5. PAD — incluir todas as minutas ✅
Confirmado pelo TJPR: incluir PAD em todos os ramos (complementação, dobro e deserção).
Os snippets já estão presentes; nenhuma exclusão necessária.

### 6. Recurso Inominado (JEC) — prazo não se aplica ✅
Confirmado pelo TJPR: o prazo diferenciado do JEC não é relevante para este sistema.
Recurso Inominado segue o mesmo prazo de **5 dias úteis** do CPC. Sem tratamento especial.

### 7. Guia ausente + sem pagamento = Dobro (§4°) ✅
Confirmado pelo TJPR: "a que não foi paga e mais uma".
- **Guia ausente mas pagamento realizado** (comprovante existe) → `comp_falta_guia` → Complementação §7°
- **Guia ausente e sem pagamento algum** → Ramo Dobro §4° → pagar a que não foi paga + mais uma (dobro)
Esta distinção está refletida no label do nó `comp_falta_guia` e no escopo documentado acima.

### 8. Simultaneidade de GRU + comprovante
Os snippets refletem a orientação do STJ: GRU e comprovante de pagamento devem ser apresentados simultaneamente. O nó `comp_falta_guia` cobre o caso em que só o formulário GRU está faltando (o comprovante existe), fundamentado no §7°.
