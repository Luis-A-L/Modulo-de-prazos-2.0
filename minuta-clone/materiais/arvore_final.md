# Árvore de Saídas — Gerador de Minutas TJPR

**Base:** `src/data/flow.ts` (estado atualizado 2026-04-24)
**Total de saídas terminais:** 113
**Templates extraídos de PDFs:** 49
**Saídas sem template:** 64

Legenda:
- `✅` = template extraído fielmente de PDF na pasta `minutas/`
- `❌` = sem template de referência (SEM TEMPLATE)
- `🔴 INTIMAÇÃO` = gera despacho intimando a parte para regularizar
- `⚖️ DESERÇÃO` = decreta a deserção / inadmissão do recurso

---

## A. COMPLEMENTAÇÃO

### Falta só a guia (`comp_falta_guia`)

```
❌ GRU
   └── 🔴 INTIMAÇÃO
❌ FUNJUS
   └── 🔴 INTIMAÇÃO
```
**Cobertura: 0/2**

### Falta só o comprovante (`comp_falta_comprovante`)

```
❌ GRU
   └── 🔴 INTIMAÇÃO
❌ FUNJUS
   └── 🔴 INTIMAÇÃO
```
**Cobertura: 0/2**

### Irregularidade na GRU (`comp_irr_gru`)

```
✅ Juntou só a guia GRU (sem comprovante de pagamento)
   └── 🔴 INTIMAÇÃO
❌ Juntou só o comprovante GRU (sem a guia de recolhimento)
   └── 🔴 INTIMAÇÃO
❌ Agendamento / em análise (transação não efetivada)
   └── 🔴 INTIMAÇÃO
✅ Valor divergente / insuficiente (e val. falso)
   └── 🔴 INTIMAÇÃO
❌ Sem número de processo / número incorreto
   └── 🔴 INTIMAÇÃO
❌ Número único divergente do processo ou da árvore processual
   └── 🔴 INTIMAÇÃO
✅ Comprovante sem código de barras legível
   └── 🔴 INTIMAÇÃO
✅ Divergência no código de barras da guia e do comprovante
   └── 🔴 INTIMAÇÃO
❌ Pago a destempo - PAD (após o prazo recursal)
   └── 🔴 INTIMAÇÃO
❌ Comprovante não localizado (N/D)
   └── 🔴 INTIMAÇÃO
❌ Guia pertencente a outro processo
   └── 🔴 INTIMAÇÃO
```
**Cobertura: 4/11**

### Irregularidade na FUNJUS (`comp_irr_funjus`)

```
✅ Juntou só a guia FUNJUS (sem comprovante de pagamento)
   └── 🔴 INTIMAÇÃO
❌ Juntou só o comprovante FUNJUS (sem a guia de recolhimento)
   └── 🔴 INTIMAÇÃO
❌ Agendamento / em análise
   └── 🔴 INTIMAÇÃO
✅ Valor divergente / insuficiente
   └── 🔴 INTIMAÇÃO
❌ Sem número de processo / número incorreto
   └── 🔴 INTIMAÇÃO
❌ Número único divergente do processo ou da árvore processual
   └── 🔴 INTIMAÇÃO
✅ Comprovante sem código de barras legível
   └── 🔴 INTIMAÇÃO
✅ Divergência no código de barras da guia e do comprovante
   └── 🔴 INTIMAÇÃO
❌ Pago a destempo - PAD
   └── 🔴 INTIMAÇÃO
❌ Comprovante não localizado (N/D)
   └── 🔴 INTIMAÇÃO
❌ Guia pertencente a outro processo
   └── 🔴 INTIMAÇÃO
```
**Cobertura: 4/11**

**TOTAL A. COMPLEMENTAÇÃO: 8/26 templates**

---

## B. PAGAMENTO EM DOBRO

### Dobro — opções diretas (`dobro`)

```
✅ Juntou só as guias GRU e FUNJUS (sem comprovantes de pagamento)
   └── 🔴 INTIMAÇÃO
✅ Juntou só os comprovantes GRU e FUNJUS (sem as guias de recolhimento)
   └── 🔴 INTIMAÇÃO
✅ Preparo juntado após o ato da interposição (pagamento simples)
   └── 🔴 INTIMAÇÃO
✅ JG pedida no ato da interposição - depois desistiu ou renunciou ao pedido
   └── 🔴 INTIMAÇÃO
```
**Cobertura: 4/4**

### Dobro — faltam guias (`dobro_falta_guia`)

```
❌ 2 agendamentos / em análise
   └── 🔴 INTIMAÇÃO
❌ 2 valores divergentes / insuficientes
   └── 🔴 INTIMAÇÃO
❌ 2 guias sem número / número incorreto de processo
   └── 🔴 INTIMAÇÃO
❌ 2 não localizadas / não disponíveis (N/D)
   └── 🔴 INTIMAÇÃO
❌ 2 guias pertencentes a outros processos
   └── 🔴 INTIMAÇÃO
```
**Cobertura: 0/5**

### Dobro — faltam comprovantes (`dobro_falta_comprovante`)

```
❌ 2 agendamentos / em análise
   └── 🔴 INTIMAÇÃO
❌ 2 valores divergentes / insuficientes
   └── 🔴 INTIMAÇÃO
❌ 2 guias sem número / número incorreto de processo
   └── 🔴 INTIMAÇÃO
❌ 2 não localizados / não disponíveis (N/D)
   └── 🔴 INTIMAÇÃO
❌ 2 pertencentes a outros processos
   └── 🔴 INTIMAÇÃO
```
**Cobertura: 0/5**

### Dobro — N/D ou inválidos (`dobro_nd`)

```
❌ 2 agendamentos bancários como comprovante
   └── 🔴 INTIMAÇÃO
✅ 2 comprovantes sem código de barras legível
   └── 🔴 INTIMAÇÃO
❌ 2 guias com número de processo ausente ou incorreto
   └── 🔴 INTIMAÇÃO
❌ Número único divergente do processo ou da árvore processual
   └── 🔴 INTIMAÇÃO
❌ 2 documentos não localizados (N/D)
   └── 🔴 INTIMAÇÃO
✅ 1 guia certa (GRU ou FUNJUS) + comprovante ausente/inválido
   └── 🔴 INTIMAÇÃO
✅ Comprovante GRU sem guia + FUNJUS não recolhida
   └── 🔴 INTIMAÇÃO
✅ Guia GRU sem comprovante + FUNJUS não recolhida
   └── 🔴 INTIMAÇÃO
✅ Divergência entre código de barras da guia e do comprovante
   └── 🔴 INTIMAÇÃO
❌ 3 guias ausentes / incorretas (GRU + FUNJUS + porte de remessa)
   └── 🔴 INTIMAÇÃO
```
**Cobertura: 5/10**

### Dobro + Decreto (`dobro_decreto`)

```
✅ Juntou só comprovantes (sem guias de recolhimento) + Decreto não apresentado
   └── 🔴 INTIMAÇÃO
✅ Documentos de preparo não localizados (N/D) + Decreto não apresentado
   └── 🔴 INTIMAÇÃO
```
**Cobertura: 2/2**

### Dobro + Procuração (`dobro_proc`)

```
✅ Procuração e preparo em dobro - ambos ausentes
   └── 🔴 INTIMAÇÃO
```
**Cobertura: 1/1**

### Preparo simples após JG (`preparo_simples_jg`)

```
❌ JG alegada - concessão não localizada nos autos
   └── 🔴 INTIMAÇÃO
✅ JG alegada - ato incompatível (pagamento anterior no recurso originário)
   └── 🔴 INTIMAÇÃO
```
**Cobertura: 1/2**

**TOTAL B. PAGAMENTO EM DOBRO: 13/29 templates**

---

## C. DESERÇÃO

### Deserção — opções diretas (`desercao`)

```
❌ Juntou só as guias GRU e FUNJUS (sem comprovantes)
   └── ⚖️ DESERÇÃO
❌ Juntou só os comprovantes GRU e FUNJUS (sem guias)
   └── ⚖️ DESERÇÃO
```
**Cobertura: 0/2**

### Deserção N/D §2º (`desercao_nd_1pgto`)

```
✅ Permaneceu inerte (certidão de decurso de prazo)
   └── ⚖️ DESERÇÃO
❌ Renunciou expressamente ao prazo
   └── ⚖️ DESERÇÃO
✅ Agendamento bancário
   └── ⚖️ DESERÇÃO
✅ Sem código de barras legível
   └── ⚖️ DESERÇÃO
✅ Comprovação da complementação apresentada fora do prazo legal
   └── ⚖️ DESERÇÃO
```
**Cobertura: 4/5**

### Deserção N/D §4º (`desercao_nd_2pgto`)

```
✅ Permaneceu inerte (certidão de decurso de prazo)
   └── ⚖️ DESERÇÃO
❌ Renunciou expressamente ao prazo
   └── ⚖️ DESERÇÃO
✅ Documentos não localizados (N/D)
   └── ⚖️ DESERÇÃO
✅ Intimado para pagar em dobro e pagou em valor simples
   └── ⚖️ DESERÇÃO
✅ Pedido de JG após intimação para dobro (sem efeito retroativo)
   └── ⚖️ DESERÇÃO
✅ Comprovação do dobro apresentada fora do prazo legal
   └── ⚖️ DESERÇÃO
```
**Cobertura: 5/6**

### Deserção GRU §2º (`desercao_gru_1pgto`)

```
❌ Agendamento bancário
   └── ⚖️ DESERÇÃO
❌ Sem código de barras legível
   └── ⚖️ DESERÇÃO
❌ Divergência de código de barras
   └── ⚖️ DESERÇÃO
❌ Número de processo ausente ou incorreto
   └── ⚖️ DESERÇÃO
❌ Juntou só o comprovante GRU (sem guia) após intimação
   └── ⚖️ DESERÇÃO
```
**Cobertura: 0/5**

### Deserção GRU §4º (`desercao_gru_2pgto`)

```
❌ Agendamento bancário
   └── ⚖️ DESERÇÃO
❌ Sem código de barras legível
   └── ⚖️ DESERÇÃO
❌ Divergência de código de barras
   └── ⚖️ DESERÇÃO
❌ Número de processo ausente ou incorreto
   └── ⚖️ DESERÇÃO
❌ Documentos não localizados (N/D)
   └── ⚖️ DESERÇÃO
```
**Cobertura: 0/5**

### Deserção FUNJUS §2º (`desercao_funjus_1pgto`)

```
❌ Agendamento bancário
   └── ⚖️ DESERÇÃO
❌ Sem código de barras legível
   └── ⚖️ DESERÇÃO
❌ Divergência de código de barras
   └── ⚖️ DESERÇÃO
❌ Número de processo ausente ou incorreto
   └── ⚖️ DESERÇÃO
❌ Guia pertencente a outro processo
   └── ⚖️ DESERÇÃO
```
**Cobertura: 0/5**

### Deserção FUNJUS §4º (`desercao_funjus_2pgto`)

```
❌ Agendamento bancário
   └── ⚖️ DESERÇÃO
❌ Sem código de barras legível
   └── ⚖️ DESERÇÃO
❌ Divergência de código de barras
   └── ⚖️ DESERÇÃO
❌ Número de processo ausente ou incorreto
   └── ⚖️ DESERÇÃO
❌ Documentos não localizados (N/D)
   └── ⚖️ DESERÇÃO
```
**Cobertura: 0/5**

### Deserção intempestivo (`desercao_intempestivo`)

```
✅ Pagamento realizado fora do prazo recursal
   └── ⚖️ DESERÇÃO
❌ Comprovante de pagamento juntado fora do prazo recursal
   └── ⚖️ DESERÇÃO
```
**Cobertura: 1/2**

### Deserção após indeferimento JG (`desercao_jg`)

```
✅ Apresentou comprovantes sem código de barras (preparo irregular)
   └── ⚖️ DESERÇÃO
✅ Permaneceu inerte (certidão de decurso de prazo)
   └── ⚖️ DESERÇÃO
✅ Renunciou ao prazo expressamente (petição de renúncia)
   └── ⚖️ DESERÇÃO
```
**Cobertura: 3/3**

### Deserção após Decreto (`desercao_decreto`)

```
❌ Decreto + complementação (§2º) - permaneceu inerte
   └── ⚖️ DESERÇÃO
❌ Decreto + dobro (§4º) - permaneceu inerte
   └── ⚖️ DESERÇÃO
```
**Cobertura: 0/2**

### Deserção GRU (direta) (`desercao_gru`)

```
❌ Agendamento não efetivado
   └── ⚖️ DESERÇÃO
❌ Valor divergente (insuficiente)
   └── ⚖️ DESERÇÃO
❌ Sem número de processo / número incorreto
   └── ⚖️ DESERÇÃO
❌ Não localizada / não disponível (N/D)
   └── ⚖️ DESERÇÃO
❌ Guia pertencente a outro processo
   └── ⚖️ DESERÇÃO
```
**Cobertura: 0/5**

### Deserção ambas (direta) (`desercao_ambas`)

```
❌ Agendamentos não efetivados
   └── ⚖️ DESERÇÃO
❌ Valores divergentes
   └── ⚖️ DESERÇÃO
❌ Sem número de processo / número incorreto
   └── ⚖️ DESERÇÃO
❌ Não localizadas / não disponíveis (N/D)
   └── ⚖️ DESERÇÃO
✅ Guias pertencentes a outros processos
   └── ⚖️ DESERÇÃO
```
**Cobertura: 1/5**

### Deserção FUNJUS (direta) (`desercao_funjus`)

```
❌ Agendamento não efetivado
   └── ⚖️ DESERÇÃO
❌ Valor divergente (insuficiente)
   └── ⚖️ DESERÇÃO
❌ Sem número de processo / número incorreto
   └── ⚖️ DESERÇÃO
❌ Não localizada / não disponível (N/D)
   └── ⚖️ DESERÇÃO
❌ Justaposição de guia FUNJUS
   └── ⚖️ DESERÇÃO
```
**Cobertura: 0/5**

**TOTAL C. DESERÇÃO: 14/55 templates**

---

## Resumo Consolidado

| Categoria | Saídas terminais | Com template | Sem template |
|-----------|:----------------:|:------------:|:------------:|
| A. COMPLEMENTAÇÃO | 26 | 8 | 18 |
| B. PAGAMENTO EM DOBRO | 29 | 13 | 16 |
| C. DESERÇÃO | 55 | 14 | 41 |
| **TOTAL** | **113** | **49** | **64** |

---

## Mapa de nós do fluxo

| Nó | Tipo | Opções | Cobertura |
|----|------|:------:|:---------:|
| `comp_falta_guia` | terminal | 2 | 0/2 |
| `comp_falta_comprovante` | terminal | 2 | 0/2 |
| `comp_irr_gru` | terminal | 11 | 4/11 |
| `comp_irr_funjus` | terminal | 11 | 4/11 |
| `dobro` | terminal | 4 | 4/4 |
| `dobro_falta_guia` | terminal | 5 | 0/5 |
| `dobro_falta_comprovante` | terminal | 5 | 0/5 |
| `dobro_nd` | terminal | 10 | 5/10 |
| `dobro_decreto` | terminal | 2 | 2/2 |
| `dobro_proc` | terminal | 1 | 1/1 |
| `preparo_simples_jg` | terminal | 2 | 1/2 |
| `desercao` | terminal | 2 | 0/2 |
| `desercao_nd_1pgto` | terminal | 5 | 4/5 |
| `desercao_nd_2pgto` | terminal | 6 | 5/6 |
| `desercao_gru_1pgto` | terminal | 5 | 0/5 |
| `desercao_gru_2pgto` | terminal | 5 | 0/5 |
| `desercao_funjus_1pgto` | terminal | 5 | 0/5 |
| `desercao_funjus_2pgto` | terminal | 5 | 0/5 |
| `desercao_intempestivo` | terminal | 2 | 1/2 |
| `desercao_jg` | terminal | 3 | 3/3 |
| `desercao_decreto` | terminal | 2 | 0/2 |
| `desercao_gru` | terminal | 5 | 0/5 |
| `desercao_ambas` | terminal | 5 | 1/5 |
| `desercao_funjus` | terminal | 5 | 0/5 |

---

## Saídas sem template de referência

As seguintes saídas do fluxo não possuem PDF correspondente na pasta `minutas/`:

### A. COMPLEMENTAÇÃO
- `comp_falta_guia` → `GRU`
- `comp_falta_guia` → `FUNJUS`
- `comp_falta_comprovante` → `GRU`
- `comp_falta_comprovante` → `FUNJUS`
- `comp_irr_gru` → `Juntou só o comprovante GRU (sem a guia de recolhimento)`
- `comp_irr_gru` → `Agendamento / em análise (transação não efetivada)`
- `comp_irr_gru` → `Sem número de processo / número incorreto`
- `comp_irr_gru` → `Número único divergente do processo ou da árvore processual`
- `comp_irr_gru` → `Pago a destempo - PAD (após o prazo recursal)`
- `comp_irr_gru` → `Comprovante não localizado (N/D)`
- `comp_irr_gru` → `Guia pertencente a outro processo`
- `comp_irr_funjus` → `Juntou só o comprovante FUNJUS (sem a guia de recolhimento)`
- `comp_irr_funjus` → `Agendamento / em análise`
- `comp_irr_funjus` → `Sem número de processo / número incorreto`
- `comp_irr_funjus` → `Número único divergente do processo ou da árvore processual`
- `comp_irr_funjus` → `Pago a destempo - PAD`
- `comp_irr_funjus` → `Comprovante não localizado (N/D)`
- `comp_irr_funjus` → `Guia pertencente a outro processo`

### B. PAGAMENTO EM DOBRO
- `dobro_falta_guia` → `2 agendamentos / em análise`
- `dobro_falta_guia` → `2 valores divergentes / insuficientes`
- `dobro_falta_guia` → `2 guias sem número / número incorreto de processo`
- `dobro_falta_guia` → `2 não localizadas / não disponíveis (N/D)`
- `dobro_falta_guia` → `2 guias pertencentes a outros processos`
- `dobro_falta_comprovante` → `2 agendamentos / em análise`
- `dobro_falta_comprovante` → `2 valores divergentes / insuficientes`
- `dobro_falta_comprovante` → `2 guias sem número / número incorreto de processo`
- `dobro_falta_comprovante` → `2 não localizados / não disponíveis (N/D)`
- `dobro_falta_comprovante` → `2 pertencentes a outros processos`
- `dobro_nd` → `2 agendamentos bancários como comprovante`
- `dobro_nd` → `2 guias com número de processo ausente ou incorreto`
- `dobro_nd` → `Número único divergente do processo ou da árvore processual`
- `dobro_nd` → `2 documentos não localizados (N/D)`
- `dobro_nd` → `3 guias ausentes / incorretas (GRU + FUNJUS + porte de remessa)`
- `preparo_simples_jg` → `JG alegada - concessão não localizada nos autos`

### C. DESERÇÃO
- `desercao` → `Juntou só as guias GRU e FUNJUS (sem comprovantes)`
- `desercao` → `Juntou só os comprovantes GRU e FUNJUS (sem guias)`
- `desercao_nd_1pgto` → `Renunciou expressamente ao prazo`
- `desercao_nd_2pgto` → `Renunciou expressamente ao prazo`
- `desercao_gru_1pgto` → `Agendamento bancário`
- `desercao_gru_1pgto` → `Sem código de barras legível`
- `desercao_gru_1pgto` → `Divergência de código de barras`
- `desercao_gru_1pgto` → `Número de processo ausente ou incorreto`
- `desercao_gru_1pgto` → `Juntou só o comprovante GRU (sem guia) após intimação`
- `desercao_gru_2pgto` → `Agendamento bancário`
- `desercao_gru_2pgto` → `Sem código de barras legível`
- `desercao_gru_2pgto` → `Divergência de código de barras`
- `desercao_gru_2pgto` → `Número de processo ausente ou incorreto`
- `desercao_gru_2pgto` → `Documentos não localizados (N/D)`
- `desercao_funjus_1pgto` → `Agendamento bancário`
- `desercao_funjus_1pgto` → `Sem código de barras legível`
- `desercao_funjus_1pgto` → `Divergência de código de barras`
- `desercao_funjus_1pgto` → `Número de processo ausente ou incorreto`
- `desercao_funjus_1pgto` → `Guia pertencente a outro processo`
- `desercao_funjus_2pgto` → `Agendamento bancário`
- `desercao_funjus_2pgto` → `Sem código de barras legível`
- `desercao_funjus_2pgto` → `Divergência de código de barras`
- `desercao_funjus_2pgto` → `Número de processo ausente ou incorreto`
- `desercao_funjus_2pgto` → `Documentos não localizados (N/D)`
- `desercao_intempestivo` → `Comprovante de pagamento juntado fora do prazo recursal`
- `desercao_decreto` → `Decreto + complementação (§2º) - permaneceu inerte`
- `desercao_decreto` → `Decreto + dobro (§4º) - permaneceu inerte`
- `desercao_gru` → `Agendamento não efetivado`
- `desercao_gru` → `Valor divergente (insuficiente)`
- `desercao_gru` → `Sem número de processo / número incorreto`
- `desercao_gru` → `Não localizada / não disponível (N/D)`
- `desercao_gru` → `Guia pertencente a outro processo`
- `desercao_ambas` → `Agendamentos não efetivados`
- `desercao_ambas` → `Valores divergentes`
- `desercao_ambas` → `Sem número de processo / número incorreto`
- `desercao_ambas` → `Não localizadas / não disponíveis (N/D)`
- `desercao_funjus` → `Agendamento não efetivado`
- `desercao_funjus` → `Valor divergente (insuficiente)`
- `desercao_funjus` → `Sem número de processo / número incorreto`
- `desercao_funjus` → `Não localizada / não disponível (N/D)`
- `desercao_funjus` → `Justaposição de guia FUNJUS`
