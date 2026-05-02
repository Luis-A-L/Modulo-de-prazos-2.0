export type PdfTemplateEntry = {
  step_key: string;
  option_text: string;
  template_text: string;
  source_files: string[];
};

export const pdfTemplateMap: Record<string, PdfTemplateEntry> = {
  // =====================================================================
  // COMPLEMENTAÇÃO — GRU (art. 1.007, §2º)
  // =====================================================================

  'comp_gru:Juntou só a guia GRU (sem comprovante de pagamento)': {
    step_key: 'comp_gru',
    option_text: 'Juntou só a guia GRU (sem comprovante de pagamento)',
    template_text:
`Verifica-se que o recurso não foi devidamente preparado, pois a parte não comprovou o efetivo recolhimento das custas devidas ao Superior Tribunal de Justiça, uma vez que juntou tão somente a guia de recolhimento ([MOVIMENTO]), sem o respectivo comprovante de pagamento.

Sendo assim, nos termos do artigo 1.007, § 2º, do Código de Processo Civil, intime-se a parte recorrente para que apresente, no prazo de 5 (cinco) dias, sob pena de deserção, comprovante de pagamento referente à guia de recolhimento de [MOVIMENTO], no qual conste o código de barras de forma visível e legível, "para que não haja dúvida acerca da validade do documento e do seu efetivo recolhimento." (AREsp 2062229-SP/RS, Rel. Ministro HUMBERTO MARTINS, QUARTA TURMA, julgado em 21/03/2022, DJe 22/03/2022).

Caso não seja possível apresentar referido documento, a parte deverá realizar o recolhimento da importância de R$ 270,12 (duzentos e setenta reais e doze centavos), por meio de guia GRU-COBRANÇA, referente às custas do Superior Tribunal de Justiça, conforme Tabela "B", do Anexo da INSTRUÇÃO NORMATIVA STJ/GP N. 13 DE 27 DE JANEIRO DE 2026, cujo novo valor passou a vigorar a partir de 02/02/2026.

Cumpre esclarecer que para comprovação do efetivo recolhimento do preparo, a parte deverá providenciar a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível. No caso do pagamento ter sido realizado por meio da plataforma digital PagTesouro, da Secretaria do Tesouro Nacional (ferramenta disponibilizada pela Corte Superior), a parte deverá apresentar o recibo enviado pelo STJ por e-mail, que conterá todas as informações do pagamento, inclusive com os dados de identificação do contribuinte, número único do processo, bem como o Número de Referência, código que identifica o recolhimento.`,
    source_files: ['670588'],
  },

  'comp_gru:Juntou só o comprovante GRU (sem a guia de recolhimento)': {
    step_key: 'comp_gru',
    option_text: 'Juntou só o comprovante GRU (sem a guia de recolhimento)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'comp_gru:Guia GRU juntada + comprovante de agendamento bancário': {
    step_key: 'comp_gru',
    option_text: 'Guia GRU juntada + comprovante de agendamento bancário',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'comp_gru:Guia GRU juntada + divergência de código de barras': {
    step_key: 'comp_gru',
    option_text: 'Guia GRU juntada + divergência de código de barras',
    template_text:
`O presente recurso não foi devidamente preparado, visto que o recolhimento ao Superior Tribunal de Justiça não restou comprovado, já que não há correspondência entre o código de barras constante na guia de recolhimento de [MOVIMENTO] e o do comprovante de pagamento de [MOVIMENTO].

A jurisprudência do Superior Tribunal de Justiça é firme no sentido de que "A falta de correspondência entre o código de barras da guia de recolhimento e o comprovante de pagamento impede a aferição da regularidade do preparo, tornando o recurso deserto." (AgInt nos EDcl no AREsp n. 2.664.415/SP, relatora Ministra Daniela Teixeira, Terceira Turma, julgado em 5/5/2025, DJEN de 8/5/2025.).

Assim sendo, nos termos do artigo 1.007, § 2º, do Código de Processo Civil, intime-se a parte recorrente para que, no prazo de 5 (cinco) dias, junte aos autos o comprovante de pagamento referente à guia de recolhimento de [MOVIMENTO].

Caso não seja possível a apresentação do comprovante de pagamento, realizar novo recolhimento da importância de R$ 270,12 (duzentos e setenta reais e doze centavos), por meio de guia GRU-COBRANÇA, referente às custas do Superior Tribunal de Justiça, conforme Tabela "B", do Anexo da INSTRUÇÃO NORMATIVA STJ/GP N. 13 DE 27 DE JANEIRO DE 2026.

Cumpre esclarecer que para comprovação do efetivo recolhimento do preparo, a parte deverá providenciar a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível. No caso do pagamento ter sido realizado por meio da plataforma digital PagTesouro, da Secretaria do Tesouro Nacional (ferramenta disponibilizada pela Corte Superior), a parte deverá apresentar o recibo enviado pelo STJ por e-mail, que conterá todas as informações do pagamento, inclusive com os dados de identificação do contribuinte, número único do processo, bem como o Número de Referência, código que identifica o recolhimento.`,
    source_files: ['628802'],
  },

  'comp_gru:Guia GRU juntada + comprovante sem código de barras legível': {
    step_key: 'comp_gru',
    option_text: 'Guia GRU juntada + comprovante sem código de barras legível',
    template_text:
`O presente recurso não foi devidamente preparado, visto que no comprovante de pagamento juntado no [MOVIMENTO] não consta o código de barras.

A jurisprudência do Superior Tribunal de Justiça é firme no sentido de que "Documento sem a sequência numérica do código de barras ou com o código de barras ilegível não é apto para comprovar o pagamento das custas devidas ao STJ, tendo em vista a impossibilidade de comparação com os dados constantes da guia de recolhimento apresentada." (AgInt no AREsp n. 2.558.214/RS, relatora Ministra Maria Isabel Gallotti, Quarta Turma, julgado em 14/10/2024, DJe de 23/10/2024).

Assim sendo, nos termos do artigo 1.007, § 2º, do Código de Processo Civil, intime-se a parte recorrente, para que, no prazo de 5 (cinco) dias, comprove nos autos a complementação do preparo do recurso, sob pena de deserção.

Para tanto, a parte deverá juntar aos autos o comprovante de pagamento referente à guia de recolhimento de [MOVIMENTO], em que conste o respectivo código de barras.

Caso não seja possível apresentação do referido documento, deverá ser realizado novo recolhimento da importância de R$ 270,12 (duzentos e setenta reais e doze centavos), por meio de guia GRU-COBRANÇA, referente às custas do Superior Tribunal de Justiça, conforme Tabela "B", do Anexo da INSTRUÇÃO NORMATIVA STJ/GP N. 13 DE 27 DE JANEIRO DE 2026, cujo novo valor passou a vigorar a partir de 02/02/2026.

Cumpre esclarecer que para comprovação do efetivo recolhimento do preparo, a parte deverá providenciar a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível. No caso do pagamento ter sido realizado por meio da plataforma digital PagTesouro, da Secretaria do Tesouro Nacional (ferramenta disponibilizada pela Corte Superior), a parte deverá apresentar o recibo enviado pelo STJ por e-mail, que conterá todas as informações do pagamento, inclusive com os dados de identificação do contribuinte e número único do processo.`,
    source_files: ['596798'],
  },

  'comp_gru:Guia GRU juntada + número de processo ausente ou incorreto': {
    step_key: 'comp_gru',
    option_text: 'Guia GRU juntada + número de processo ausente ou incorreto',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'comp_gru:Número único não corresponde ao processo': {
    step_key: 'comp_gru',
    option_text: 'Número único não corresponde ao processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'comp_gru:Guia GRU juntada + comprovante não localizado (N/D)': {
    step_key: 'comp_gru',
    option_text: 'Guia GRU juntada + comprovante não localizado (N/D)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'comp_gru:Guia GRU pertencente a outro processo': {
    step_key: 'comp_gru',
    option_text: 'Guia GRU pertencente a outro processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'comp_gru:Guia GRU juntada + valor divergente ou insuficiente': {
    step_key: 'comp_gru',
    option_text: 'Guia GRU juntada + valor divergente ou insuficiente',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  // =====================================================================
  // COMPLEMENTAÇÃO — FUNJUS (art. 1.007, §2º)
  // =====================================================================

  'comp_funjus:Juntou só a guia FUNJUS (sem comprovante de pagamento)': {
    step_key: 'comp_funjus',
    option_text: 'Juntou só a guia FUNJUS (sem comprovante de pagamento)',
    template_text:
`O recurso não foi devidamente preparado, visto que o recolhimento das custas recursais devidas a este Tribunal de Justiça não restou comprovado, visto que juntou a guia de recolhimento de [MOVIMENTO], sem o respectivo comprovante de pagamento.

Sendo assim, intime-se a parte Recorrente, nos termos do artigo 1.007, § 2º, do Código de Processo Civil, para, no prazo de 5 (cinco) dias, complementar o preparo recursal, sob pena de deserção.

Para tanto, deverá apresentar o comprovante de pagamento referente à guia juntada no [MOVIMENTO], no qual conste o código de barras de forma visível e legível, "para que não haja dúvida acerca da validade do documento e do seu efetivo recolhimento." (AREsp 2062229-SP/RS, Rel. Ministro HUMBERTO MARTINS, QUARTA TURMA, julgado em 21/03/2022, DJe 22/03/2022).

Caso não seja possível apresentar referido documento, deverá ser realizado o recolhimento da importância de R$ 300,00 (trezentos reais) ao Fundo da Justiça – FUNJUS, referente às custas locais, previstas na Lei Estadual nº 22.956/2025.

Diligências necessárias.`,
    source_files: ['596361'],
  },

  'comp_funjus:Juntou só o comprovante FUNJUS (sem a guia de recolhimento)': {
    step_key: 'comp_funjus',
    option_text: 'Juntou só o comprovante FUNJUS (sem a guia de recolhimento)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'comp_funjus:Guia FUNJUS juntada + comprovante de agendamento bancário': {
    step_key: 'comp_funjus',
    option_text: 'Guia FUNJUS juntada + comprovante de agendamento bancário',
    template_text:
`O recurso não foi devidamente preparado, visto que o recolhimento das custas recursais devidas a este Tribunal de Justiça não restou comprovado, já que o comprovante de agendamento bancário juntado no [MOVIMENTO] não é documento apto a comprovar o efetivo recolhimento das custas (AgInt nos EAREsp n. 940.673/SP, relator Ministro João Otávio de Noronha, Corte Especial, julgado em 8/4/2025, DJEN de 14/4/2025.).

Sendo assim, intime-se a parte Recorrente, nos termos do artigo 1.007, § 2º, do Código de Processo Civil, para, no prazo de 5 (cinco) dias, complementar o preparo recursal, sob pena de deserção.

Para tanto, deverá apresentar o comprovante de pagamento referente à guia juntada no [MOVIMENTO], no qual conste o código de barras de forma visível e legível, "para que não haja dúvida acerca da validade do documento e do seu efetivo recolhimento." (AREsp 2062229-SP/RS, Rel. Ministro HUMBERTO MARTINS, QUARTA TURMA, julgado em 21/03/2022, DJe 22/03/2022).

Caso não seja possível apresentar referido documento, deverá ser realizado novo recolhimento da importância de R$ 300,00 (trezentos reais) ao Fundo da Justiça – FUNJUS, referente às custas locais, previstas na Lei Estadual nº 22.956/2025.

Insta salientar que a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível, são imprescindíveis para fins de comprovação do efetivo recolhimento do preparo.`,
    source_files: ['nao_tem_comprovante_de_agendamento'],
  },

  'comp_funjus:Guia FUNJUS juntada + divergência de código de barras': {
    step_key: 'comp_funjus',
    option_text: 'Guia FUNJUS juntada + divergência de código de barras',
    template_text:
`O presente recurso não foi devidamente preparado, visto que o recolhimento das custas devidas a este Tribunal de Justiça não restou comprovado, pois não há correspondência entre o código de barras constante na guia de recolhimento e o do comprovante de pagamento ([MOVIMENTO]).

A jurisprudência do Superior Tribunal de Justiça é firme no sentido de que "(...) a falta de correspondência entre o código de barras constante do comprovante de pagamento e o da guia de recolhimento do preparo implica pena de deserção, ante a irregularidade no pagamento." (AgInt no AREsp n. 1.894.595/RJ, relator Ministro Raul Araújo, Quarta Turma, julgado em 22/11/2021, DJe de 2/12/2021.).

Assim sendo, nos termos do artigo 1.007, § 2º, do Código de Processo Civil, intime-se a parte recorrente, para que, no prazo de 5 (cinco) dias, comprove nos autos a complementação do preparo do recurso, sob pena de deserção.

Para tanto, a parte deverá juntar aos autos o comprovante de pagamento referente à guia de recolhimento de [MOVIMENTO].

Caso não seja possível apresentação do referido documento, deverá ser realizado o recolhimento da importância de R$ 300,00 (trezentos reais) ao Fundo da Justiça – FUNJUS, referente às custas locais, previstas na Lei Estadual nº 22.956/2025.

Insta salientar que a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível, são imprescindíveis para fins de comprovação do efetivo recolhimento do preparo.`,
    source_files: ['596347'],
  },

  'comp_funjus:Guia FUNJUS juntada + comprovante sem código de barras legível': {
    step_key: 'comp_funjus',
    option_text: 'Guia FUNJUS juntada + comprovante sem código de barras legível',
    template_text:
`O presente recurso não foi devidamente preparado, visto que no documento juntado no [MOVIMENTO] como comprovante de pagamento não consta o código de barras.

A jurisprudência do Superior Tribunal de Justiça é firme no sentido de que "Documento sem a sequência numérica do código de barras ou com o código de barras ilegível não é apto para comprovar o pagamento das custas devidas ao STJ, tendo em vista a impossibilidade de comparação com os dados constantes da guia de recolhimento apresentada." (AgInt no AREsp n. 2.558.214/RS, relatora Ministra Maria Isabel Gallotti, Quarta Turma, julgado em 14/10/2024, DJe de 23/10/2024).

Assim sendo, nos termos do artigo 1.007, § 2º, do Código de Processo Civil, intime-se a parte recorrente, para que, no prazo de 5 (cinco) dias, comprove nos autos a complementação do preparo do recurso, sob pena de deserção.

Para tanto, a parte deverá juntar aos autos o comprovante de pagamento referente à guia de recolhimento de [MOVIMENTO], em que conste o respectivo código de barras.

Caso não seja possível apresentação do referido documento, deverá ser realizado o recolhimento da importância de R$ 300,00 (trezentos reais) ao Fundo da Justiça – FUNJUS, referente às custas locais, previstas na Lei Estadual nº 22.956/2025.

Insta salientar que a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível, são imprescindíveis para fins de comprovação do efetivo recolhimento do preparo.`,
    source_files: ['596757'],
  },

  'comp_funjus:Guia FUNJUS juntada + número de processo ausente ou incorreto': {
    step_key: 'comp_funjus',
    option_text: 'Guia FUNJUS juntada + número de processo ausente ou incorreto',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'comp_funjus:Número único não corresponde ao processo': {
    step_key: 'comp_funjus',
    option_text: 'Número único não corresponde ao processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'comp_funjus:Guia FUNJUS juntada + comprovante não localizado (N/D)': {
    step_key: 'comp_funjus',
    option_text: 'Guia FUNJUS juntada + comprovante não localizado (N/D)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'comp_funjus:Guia FUNJUS pertencente a outro processo': {
    step_key: 'comp_funjus',
    option_text: 'Guia FUNJUS pertencente a outro processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'comp_funjus:Guia FUNJUS juntada + valor divergente ou insuficiente': {
    step_key: 'comp_funjus',
    option_text: 'Guia FUNJUS juntada + valor divergente ou insuficiente',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  // =====================================================================
  // PAGAMENTO EM DOBRO (art. 1.007, §4º)
  // =====================================================================

  'dobro:Juntou só as guias GRU e FUNJUS (sem comprovantes de pagamento)': {
    step_key: 'dobro',
    option_text: 'Juntou só as guias GRU e FUNJUS (sem comprovantes de pagamento)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'dobro:Juntou só os comprovantes GRU e FUNJUS (sem as guias de recolhimento)': {
    step_key: 'dobro',
    option_text: 'Juntou só os comprovantes GRU e FUNJUS (sem as guias de recolhimento)',
    template_text:
`Tendo em vista que a parte recorrente não comprovou o preparo no ato da interposição do recurso, visto que juntou os comprovantes de pagamento sem as respectivas guias, nos termos do artigo 1.007, § 4º, do Código de Processo Civil, intime-se a parte recorrente para que comprove, no prazo de 5 (cinco) dias, sob pena de deserção, o recolhimento em dobro do preparo recursal.

A jurisprudência do Superior Tribunal de Justiça é unânime no sentido de que "Para comprovação do preparo recursal não basta o pagamento das custas processuais, impõe-se a juntada dos respectivos comprovantes e guia de recolhimento, sob pena de deserção." (AgInt nos EAREsp n. 2.343.494/SP, relator Ministro Humberto Martins, Segunda Seção, julgado em 19/11/2024, DJe de 25/11/2024.)

Para tanto, a parte deverá:
1. apresentar as guias de recolhimento referentes aos comprovantes de pagamento de [MOVIMENTO];
2. realizar o recolhimento da importância de R$ 270,12 (duzentos e setenta reais e doze centavos), referente às custas do Superior Tribunal de Justiça, conforme Tabela "B", do Anexo da INSTRUÇÃO NORMATIVA STJ/GP N. 13 DE 27 DE JANEIRO DE 2026, totalizando o valor dobrado devido;
3. realizar novo recolhimento da importância de R$ 300,00 (trezentos reais) ao Fundo da Justiça – FUNJUS, referente às custas locais, previstas na Lei Estadual nº 22.956/2025, totalizando o valor dobrado devido.

Ressalta-se que, caso seja impossível apresentar os documentos mencionados no item 1, a parte deverá comprovar o recolhimento dos seguintes valores:
- R$ 540,24 (quinhentos e quarenta reais e vinte e quatro centavos), por meio da guia GRU-COBRANÇA, referente ao recolhimento em dobro das custas devidas ao Superior Tribunal de Justiça, conforme Tabela "B", do Anexo da INSTRUÇÃO NORMATIVA STJ/GP N. 13 DE 27 DE JANEIRO DE 2026.
- R$ 600,00 (seiscentos reais), ao Fundo da Justiça – FUNJUS, referente ao recolhimento em dobro das custas do Tribunal de Justiça do Estado do Paraná (Lei Estadual nº 22.956/2025).

Insta salientar, que para comprovação do efetivo recolhimento do preparo, a parte deverá providenciar a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível. No caso do pagamento ter sido realizado por meio da plataforma digital PagTesouro, da Secretaria do Tesouro Nacional (ferramenta disponibilizada pela Corte Superior), a parte deverá apresentar o recibo enviado pelo STJ por e-mail, que conterá todas as informações do pagamento, inclusive com os dados de identificação do contribuinte e número único do processo.`,
    source_files: ['677400'],
  },

  'dobro:Juntou guias com comprovante de agendamento bancário (ambos)': {
    step_key: 'dobro',
    option_text: 'Juntou guias com comprovante de agendamento bancário (ambos)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  // =====================================================================
  // DOBRO — N/D (ausentes ou inválidos)
  // =====================================================================

  'dobro_nd:2 agendamentos bancários como comprovante': {
    step_key: 'dobro_nd',
    option_text: '2 agendamentos bancários como comprovante',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'dobro_nd:2 comprovantes com divergência de código de barras': {
    step_key: 'dobro_nd',
    option_text: '2 comprovantes com divergência de código de barras',
    template_text:
`Verifica-se que a parte recorrente não comprovou o recolhimento do preparo, já que não há correspondência entre o código de barras constante na guia de recolhimento de [MOVIMENTO] e o dos comprovantes de pagamento de [MOVIMENTO].

A jurisprudência do Superior Tribunal de Justiça é firme no sentido de que "A falta de correspondência entre o código de barras da guia de recolhimento e o comprovante de pagamento impede a aferição da regularidade do preparo, tornando o recurso deserto." (AgInt nos EDcl no AREsp n. 2.664.415/SP, relatora Ministra Daniela Teixeira, Terceira Turma, julgado em 5/5/2025, DJEN de 8/5/2025.).

Assim sendo, diante da ausência de comprovação do pagamento das custas no ato da interposição do recurso, intime-se a parte recorrente para que comprove, no prazo de 5 (cinco) dias, sob pena de deserção, nos termos do artigo 1.007, § 4º, do Código de Processo Civil, o recolhimento em dobro do preparo.

Para tanto, a parte recorrente deverá:
1. apresentar os comprovantes de pagamento referentes às guias de recolhimento de [MOVIMENTO];
2. realizar o recolhimento da importância de R$ 270,12 (duzentos e setenta reais e doze centavos), referente às custas do Superior Tribunal de Justiça, conforme Tabela "B", do Anexo da INSTRUÇÃO NORMATIVA STJ/GP N. 13 DE 27 DE JANEIRO DE 2026, totalizando o valor dobrado devido;
3. realizar novo recolhimento da importância de R$ 300,00 (trezentos reais) ao Fundo da Justiça – FUNJUS, referente às custas locais, prevista na Lei Estadual nº 22.956/2025, totalizando o valor dobrado devido.

Ressalta-se que, caso seja impossível apresentar os comprovantes de pagamento mencionados no item 1, a parte deverá comprovar o recolhimento dos seguintes valores:
- R$ 540,24 (quinhentos e quarenta reais e vinte e quatro centavos), por meio da guia GRU-COBRANÇA, referente ao recolhimento em dobro das custas devidas ao Superior Tribunal de Justiça, conforme Tabela "B", do Anexo da INSTRUÇÃO NORMATIVA STJ/GP N. 13 DE 27 DE JANEIRO DE 2026.
- R$ 600,00 (seiscentos reais), ao Fundo da Justiça – FUNJUS, referente ao recolhimento em dobro das custas do Tribunal de Justiça do Estado do Paraná (Lei Estadual nº 22.956/2025).

Insta salientar, que para comprovação do efetivo recolhimento do preparo, a parte deverá providenciar a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível. No caso do pagamento ter sido realizado por meio da plataforma digital PagTesouro, da Secretaria do Tesouro Nacional (ferramenta disponibilizada pela Corte Superior), a parte deverá apresentar o recibo enviado pelo STJ por e-mail, que conterá todas as informações do pagamento, inclusive com os dados de identificação do contribuinte e número único do processo.`,
    source_files: ['670902'],
  },

  'dobro_nd:2 comprovantes sem código de barras legível': {
    step_key: 'dobro_nd',
    option_text: '2 comprovantes sem código de barras legível',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'dobro_nd:2 documentos não localizados (N/D)': {
    step_key: 'dobro_nd',
    option_text: '2 documentos não localizados (N/D)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'dobro_nd:2 valores divergentes ou insuficientes': {
    step_key: 'dobro_nd',
    option_text: '2 valores divergentes ou insuficientes',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'dobro_nd:2 guias pertencentes a outros processos': {
    step_key: 'dobro_nd',
    option_text: '2 guias pertencentes a outros processos',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'dobro_nd:Número único não corresponde ao processo': {
    step_key: 'dobro_nd',
    option_text: 'Número único não corresponde ao processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  // =====================================================================
  // DESERÇÃO — ambos (GRU + FUNJUS)
  // =====================================================================

  'desercao:Juntou só as guias GRU e FUNJUS (sem comprovantes)': {
    step_key: 'desercao',
    option_text: 'Juntou só as guias GRU e FUNJUS (sem comprovantes)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao:Juntou só os comprovantes GRU e FUNJUS (sem guias)': {
    step_key: 'desercao',
    option_text: 'Juntou só os comprovantes GRU e FUNJUS (sem guias)',
    template_text:
`O(A) Recorrente, devidamente intimado(a) para comprovar o recolhimento em dobro do preparo (despacho de [MOVIMENTO]), apresentou tão somente os comprovantes de pagamento ([MOVIMENTO]), deixando, portanto, de juntar as respectivas guias de recolhimento.

Cumpre esclarecer, que o Supremo Tribunal Federal consolidou o entendimento de que "(...) os recursos a si dirigidos devem estar acompanhados das guias de recolhimento devidamente preenchidas e dos respectivos comprovantes de pagamento, ambos de forma visível e legível, sob pena de deserção." (ARE 1.213.790/MG, Rel. Ministro DIAS TOFFOLI, julgado em 26/06/2019, DJe 24/06/2019).

Sendo assim, nos termos do artigo 1.007, § 4º, do Código de Processo Civil, declaro a deserção do recurso.

Diante do exposto, inadmito o recurso interposto.

Intime-se.`,
    source_files: ['596274', '596190'],
  },

  // =====================================================================
  // DESERÇÃO — N/D ambas as guias, intimação §2º
  // =====================================================================

  'desercao_nd_1pgto:Agendamento bancário': {
    step_key: 'desercao_nd_1pgto',
    option_text: 'Agendamento bancário',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_1pgto:Divergência de código de barras': {
    step_key: 'desercao_nd_1pgto',
    option_text: 'Divergência de código de barras',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_1pgto:Sem código de barras legível': {
    step_key: 'desercao_nd_1pgto',
    option_text: 'Sem código de barras legível',
    template_text:
`Declaro a deserção do recurso, nos termos do § 2º do artigo 1.007 do Código de Processo Civil, uma vez que a complementação do preparo não se deu validamente. Isso porque, não consta o número do código de barras no documento indicado como comprovante de pagamento ([MOVIMENTO]), inviabilizando a conferência com a guia de recolhimento apresentada ([MOVIMENTO]).

Nesse sentido:
"DIREITO PROCESSUAL CIVIL. EMBARGOS DE DECLARAÇÃO. PREPARO RECURSAL. AUSÊNCIA DE VÍCIO DE CONTRADIÇÃO. EMBARGOS REJEITADOS.
1. Embargos de declaração opostos contra acórdão que negou provimento a agravo interno no recurso especial, em razão da ausência do número de código de barras no comprovante de pagamento bancário, caracterizando irregularidade no preparo do recurso especial e tornando-o deserto.
2. A ausência do número de código de barras no comprovante de pagamento bancário caracteriza irregularidade no preparo do recurso especial, tornando-o deserto, conforme jurisprudência consolidada do STJ.
3. Não há contradição quando os fundamentos e a conclusão do julgado guardam coerência lógica entre si, sendo a contradição apta a ensejar embargos de declaração aquela interna ao corpo textual da decisão.
4. Os embargos de declaração não se prestam à rediscussão do mérito da causa ou à modificação do julgado, salvo para a supressão de vícios internos da decisão.
5. Embargos de declaração rejeitados."
(EDcl no AgInt no REsp n. 2.145.179/SP, relatora Ministra Daniela Teixeira, Terceira Turma, julgado em 5/5/2025, DJEN de 8/5/2025.)

Diante do exposto, inadmito o recurso interposto.

Intimem-se.`,
    source_files: ['596836'],
  },

  'desercao_nd_1pgto:Número de processo ausente ou incorreto': {
    step_key: 'desercao_nd_1pgto',
    option_text: 'Número de processo ausente ou incorreto',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_1pgto:Número único não corresponde ao processo': {
    step_key: 'desercao_nd_1pgto',
    option_text: 'Número único não corresponde ao processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_1pgto:Guia pertencente a outro processo': {
    step_key: 'desercao_nd_1pgto',
    option_text: 'Guia pertencente a outro processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_1pgto:Valores divergentes ou insuficientes (ambas as guias)': {
    step_key: 'desercao_nd_1pgto',
    option_text: 'Valores divergentes ou insuficientes (ambas as guias)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  // =====================================================================
  // DESERÇÃO — N/D ambas as guias, intimação §4º (dobro)
  // =====================================================================

  'desercao_nd_2pgto:Guia pertencente a outro processo': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Guia pertencente a outro processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_2pgto:Agendamento bancário': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Agendamento bancário',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_2pgto:Comprovou pagamento em valor simples (em vez de dobro)': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Comprovou pagamento em valor simples (em vez de dobro)',
    template_text:
`A Recorrente foi intimada para comprovar o pagamento em dobro do preparo recursal, conforme determinado no despacho de [MOVIMENTO].

Entretanto, não cumpriu a determinação, vez que, em que pese tenha comprovado o recolhimento em dobro das custas devidas ao Superior Tribunal de Justiça ([MOVIMENTO]), o fato é que realizou o recolhimento das custas destinadas a este Tribunal de Justiça na forma simples ([MOVIMENTO]).

Assim sendo, tendo em vista que a Recorrente, devidamente intimada, não comprovou o recolhimento em dobro do preparo recursal, nos termos do artigo 1.007, § 4º, do Código de Processo Civil, declaro a deserção do recurso interposto.

Nesse sentido, os seguintes precedentes:
"Direito Processual Civil. Agravo interno em recurso extraordinário com agravo. Recurso extraordinário. Ausência de comprovação do preparo no ato da interposição. Determinação de recolhimento em dobro não observada. Recurso deserto.
(...)
4. O recurso extraordinário não foi devidamente preparado. Determinado o recolhimento em dobro, na forma do art. 1.007, § 4º, do Código de Processo Civil, a parte recorrente realizou o preparo na forma simples. 5. A jurisprudência desta Corte é no sentido de que 'a comprovação do pagamento do preparo deve ocorrer no momento da interposição do recurso, sob pena de deserção.'" (ARE 1494440 AgR, Relator(a): EDSON FACHIN (Vice-Presidente), Tribunal Pleno, julgado em 27/11/2024).

Diante do exposto, inadmito o recurso interposto.

Intime-se.`,
    source_files: ['604326'],
  },

  'desercao_nd_2pgto:Divergência de código de barras': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Divergência de código de barras',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_2pgto:Sem código de barras legível': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Sem código de barras legível',
    template_text:
`Declaro a deserção do recurso, uma vez que após ser indeferido o pedido de justiça gratuita formulado na petição recursal ([DECISÃO]), a parte recorrente foi devidamente intimada para efetuar o preparo do recurso ([DESPACHO]), tendo se manifestado nos autos para apresentar as guias de recolhimento e os comprovantes de pagamento de [MOVIMENTO], os quais, contudo, não se revelam suficientes a comprovar o respectivo pagamento, na medida em que não consta o número do código de barras, inviabilizando assim a conferência com as guias de recolhimento juntadas ([MOVIMENTO]).

Ressalta-se que o despacho de [MOVIMENTO] mencionou que para comprovação do efetivo recolhimento do preparo a parte deveria providenciar a juntada da guia e do respectivo comprovante de pagamento, no qual constasse o código de barras de forma visível e legível.

A Corte Superior firmou entendimento no sentido de que "A ausência do número de código de barras no comprovante de pagamento bancário caracteriza irregularidade no preparo do recurso especial, tornando-se, portanto, deserto" (AgInt nos EDcl nos EREsp n. 1.563.122/RS, relatora Ministra Maria Isabel Gallotti, Corte Especial, julgado em 24/10/2023, DJe de 30/10/2023).

Diante do exposto, o recurso interposto é inadmitido.

Intimem-se.`,
    source_files: ['600045'],
  },

  'desercao_nd_2pgto:Número de processo ausente ou incorreto': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Número de processo ausente ou incorreto',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_2pgto:Número único não corresponde ao processo': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Número único não corresponde ao processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_2pgto:Documentos não localizados (N/D)': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Documentos não localizados (N/D)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_2pgto:Valores divergentes ou insuficientes (ambas as guias)': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Valores divergentes ou insuficientes (ambas as guias)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_nd_2pgto:Ausência de manifestação': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Ausência de manifestação',
    template_text:
`A parte recorrente, devidamente intimada para comprovar o recolhimento em dobro do preparo recursal (despacho de [MOVIMENTO]), não se manifestou (certidão de decurso de prazo de [MOVIMENTO]).

Sendo assim, nos termos do § 4º do artigo 1.007 do Código de Processo Civil, declaro a deserção do recurso.

Nesse sentido, o seguinte precedente:
"PROCESSUAL CIVIL. AGRAVO INTERNO NOS EMBARGOS DE DIVERGÊNCIA EM AGRAVO EM RECURSO ESPECIAL. PREPARO. COMPROVAÇÃO. AUSÊNCIA. INTIMAÇÃO. ART. 1.007, § 4º, DO CPC. JUNTADA DE DOCUMENTO. DESERÇÃO. DECISÃO MANTIDA.
1. O recurso deve ser declarado deserto se, depois da intimação nos termos do art. 1.007, § 4º, do CPC, a parte não comprovar o pagamento em dobro ou a prévia concessão de gratuidade de justiça no prazo assinalado na referida intimação.
2. Agravo interno a que se nega provimento."
(AgInt nos EAREsp n. 2.431.515/SP, relator Ministro Antonio Carlos Ferreira, Segunda Seção, julgado em 18/3/2025, DJEN de 25/3/2025.)

Diante do exposto, inadmito o recurso interposto.

Intime-se.`,
    source_files: ['596230'],
  },

  'desercao_nd_2pgto:Renúncia de prazo': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Renúncia de prazo',
    template_text:
`Declaro a deserção do recurso, uma vez que a parte recorrente devidamente intimada da decisão que indeferiu o pedido de justiça gratuita formulado na petição recursal e determinou o recolhimento do preparo ([MOVIMENTO]), renunciou ao prazo sem cumpri-lo ([MOVIMENTO]).

Nesse sentido:
"PROCESSUAL CIVIL. AGRAVO INTERNO NO AGRAVO EM RECURSO ESPECIAL. DECISÃO DO RELATOR NO TRIBUNAL DE ORIGEM QUE NEGOU SEGUIMENTO AO RECURSO DE APELAÇÃO. VIOLAÇÃO DOS ARTS. 489 E 1.022 DO CPC. NÃO OCORRÊNCIA. DENEGAÇÃO DO PEDIDO DE JUSTIÇA GRATUITA. AUSÊNCIA DE RECOLHIMENTO DO PREPARO NO PRAZO ASSINALADO. DESERÇÃO. DECISÃO MANTIDA. AGRAVO INTERNO NÃO PROVIDO.
(...)
3. Contudo, se mesmo após ter sido intimada na forma do dispositivo acima mencionado, a parte não efetuar o recolhimento do preparo recursal no prazo assinalado, a consequência é o reconhecimento da deserção do recurso, e não uma nova intimação a fim de possibilitar o recolhimento em dobro, na esteira do que dispõe o art. 1.007, § 4º, do CPC.
4. Agravo interno não provido".
(AgInt no AREsp n. 2.624.581/MS, relator Ministro Moura Ribeiro, Terceira Turma, julgado em 24/2/2025, DJEN de 28/2/2025.)

Diante do exposto, inadmito o recurso interposto.

Intimem-se.`,
    source_files: ['0002812', 'apos-indeferimento-de-jg-intimado-para-preparo-simples-e-nao-regularizou'],
  },

  'desercao_nd_2pgto:Decurso de prazo': {
    step_key: 'desercao_nd_2pgto',
    option_text: 'Decurso de prazo',
    template_text:
`Declaro a deserção do recurso, nos termos do § 4º do artigo 1.007 do Código de Processo Civil, uma vez que a parte recorrente não regularizou o preparo recursal, conforme determinado no despacho de [MOVIMENTO] (certidão de decurso de prazo de [MOVIMENTO]).

Nesse sentido, o seguinte precedente:
"RECURSO – DESERÇÃO – ARTIGO 1.007 DO CÓDIGO DE PROCESSO CIVIL DE 2015. Se o extraordinário foi interposto na vigência do Código de Processo Civil de 2015, a comprovação do recolhimento do preparo há de ser feita no prazo do recurso, ou naquele fixado para a respectiva regularização, sob pena de deserção." (ARE 1081517 AgR, Relator(a): Min. MARCO AURÉLIO, Primeira Turma, julgado em 13/03/2018.)

Diante do exposto, inadmito o recurso interposto.

Intime-se.`,
    source_files: ['596237'],
  },

  // =====================================================================
  // DESERÇÃO — GRU apenas, intimação §2º
  // =====================================================================

  'desercao_gru_1pgto:Agendamento bancário': {
    step_key: 'desercao_gru_1pgto',
    option_text: 'Agendamento bancário',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_1pgto:Divergência de código de barras': {
    step_key: 'desercao_gru_1pgto',
    option_text: 'Divergência de código de barras',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_1pgto:Sem código de barras legível': {
    step_key: 'desercao_gru_1pgto',
    option_text: 'Sem código de barras legível',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_1pgto:Número de processo ausente ou incorreto': {
    step_key: 'desercao_gru_1pgto',
    option_text: 'Número de processo ausente ou incorreto',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_1pgto:Número único não corresponde ao processo (GRU)': {
    step_key: 'desercao_gru_1pgto',
    option_text: 'Número único não corresponde ao processo (GRU)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_1pgto:Guia GRU não apresentada após intimação (nunca juntada)': {
    step_key: 'desercao_gru_1pgto',
    option_text: 'Guia GRU não apresentada após intimação (nunca juntada)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_1pgto:Guia GRU pertencente a outro processo': {
    step_key: 'desercao_gru_1pgto',
    option_text: 'Guia GRU pertencente a outro processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_1pgto:Valor divergente ou insuficiente (GRU)': {
    step_key: 'desercao_gru_1pgto',
    option_text: 'Valor divergente ou insuficiente (GRU)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  // =====================================================================
  // DESERÇÃO — GRU apenas, intimação §4º (dobro)
  // =====================================================================

  'desercao_gru_2pgto:Guia pertencente a outro processo': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Guia pertencente a outro processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Agendamento bancário': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Agendamento bancário',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Comprovou pagamento em valor simples (em vez de dobro)': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Comprovou pagamento em valor simples (em vez de dobro)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Divergência de código de barras': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Divergência de código de barras',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Sem código de barras legível': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Sem código de barras legível',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Número de processo ausente ou incorreto': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Número de processo ausente ou incorreto',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Número único não corresponde ao processo (GRU)': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Número único não corresponde ao processo (GRU)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Guia GRU não apresentada após intimação (nunca juntada)': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Guia GRU não apresentada após intimação (nunca juntada)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Documentos não localizados (N/D)': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Documentos não localizados (N/D)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Valor divergente ou insuficiente (GRU)': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Valor divergente ou insuficiente (GRU)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Ausência de manifestação': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Ausência de manifestação',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Renúncia de prazo': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Renúncia de prazo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_gru_2pgto:Decurso de prazo': {
    step_key: 'desercao_gru_2pgto',
    option_text: 'Decurso de prazo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  // =====================================================================
  // DESERÇÃO — FUNJUS apenas, intimação §2º
  // =====================================================================

  'desercao_funjus_1pgto:Agendamento bancário': {
    step_key: 'desercao_funjus_1pgto',
    option_text: 'Agendamento bancário',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_1pgto:Divergência de código de barras': {
    step_key: 'desercao_funjus_1pgto',
    option_text: 'Divergência de código de barras',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_1pgto:Sem código de barras legível': {
    step_key: 'desercao_funjus_1pgto',
    option_text: 'Sem código de barras legível',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_1pgto:Número de processo ausente ou incorreto': {
    step_key: 'desercao_funjus_1pgto',
    option_text: 'Número de processo ausente ou incorreto',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_1pgto:Número único não corresponde ao processo (FUNJUS)': {
    step_key: 'desercao_funjus_1pgto',
    option_text: 'Número único não corresponde ao processo (FUNJUS)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_1pgto:Guia FUNJUS não apresentada após intimação (nunca juntada)': {
    step_key: 'desercao_funjus_1pgto',
    option_text: 'Guia FUNJUS não apresentada após intimação (nunca juntada)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_1pgto:Guia pertencente a outro processo': {
    step_key: 'desercao_funjus_1pgto',
    option_text: 'Guia pertencente a outro processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_1pgto:Valor divergente ou insuficiente (FUNJUS)': {
    step_key: 'desercao_funjus_1pgto',
    option_text: 'Valor divergente ou insuficiente (FUNJUS)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  // =====================================================================
  // DESERÇÃO — FUNJUS apenas, intimação §4º (dobro)
  // =====================================================================

  'desercao_funjus_2pgto:Guia pertencente a outro processo': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Guia pertencente a outro processo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Agendamento bancário': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Agendamento bancário',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Comprovou pagamento em valor simples (em vez de dobro)': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Comprovou pagamento em valor simples (em vez de dobro)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Divergência de código de barras': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Divergência de código de barras',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Sem código de barras legível': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Sem código de barras legível',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Número de processo ausente ou incorreto': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Número de processo ausente ou incorreto',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Número único não corresponde ao processo (FUNJUS)': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Número único não corresponde ao processo (FUNJUS)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Guia FUNJUS não apresentada após intimação (nunca juntada)': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Guia FUNJUS não apresentada após intimação (nunca juntada)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Documentos não localizados (N/D)': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Documentos não localizados (N/D)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Valor divergente ou insuficiente (FUNJUS)': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Valor divergente ou insuficiente (FUNJUS)',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Ausência de manifestação': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Ausência de manifestação',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Renúncia de prazo': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Renúncia de prazo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desercao_funjus_2pgto:Decurso de prazo': {
    step_key: 'desercao_funjus_2pgto',
    option_text: 'Decurso de prazo',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  // =====================================================================
  // INTEMPESTIVO
  // =====================================================================

  'intempestivo:Pagamento realizado fora do prazo recursal': {
    step_key: 'intempestivo',
    option_text: 'Pagamento realizado fora do prazo recursal',
    template_text:
`A parte recorrente foi intimada para comprovar a complementação do preparo no prazo de 5 (cinco) dias, na forma do despacho de [MOVIMENTO].

Verifica-se que a leitura de intimação do referido despacho foi confirmada em [DATA], de modo que o prazo de 5 (cinco) dias concedido para regularização do preparo passou a fluir em [DATA] e findou em [DATA], sendo certificado o decurso do prazo em [DATA] ([MOVIMENTO]).

Sendo assim, e considerando que a regularização do preparo foi feita intempestivamente, na medida em que os documentos foram apresentados em [DATA] ([MOVIMENTO]), nos termos do § 2º do artigo 1.007 do Código de Processo Civil, declaro a deserção do recurso.

Nesse sentido, o seguinte precedente:
"TRIBUTÁRIO E PROCESSUAL CIVIL. AGRAVO INTERNO NO AGRAVO EM RECURSO ESPECIAL. RECURSO ESPECIAL. PREPARO INSUFICIENTE. INTIMAÇÃO PARA COMPLEMENTAÇÃO DO PREPARO, NO PRAZO DE 5 (CINCO) DIAS, PREVISTO NO ART. 1.007, § 2º, DO CPC/2015. NÃO ATENDIMENTO, NO PRAZO LEGAL. DESERÇÃO. SÚMULA 187/STJ. AGRAVO INTERNO IMPROVIDO. (...)
III. A extemporânea comprovação da complementação do preparo recursal inviabiliza o conhecimento do presente recurso, nos termos da Súmula 187 desta Corte."
(AgInt no AREsp n. 1.788.290/MS, relatora Ministra Assusete Magalhães, Segunda Turma, julgado em 29/3/2021, DJe de 6/4/2021.)

Diante do exposto, inadmito o recurso interposto.

Intime-se.`,
    source_files: ['607948'],
  },

  'intempestivo:Comprovante de pagamento juntado fora do prazo recursal': {
    step_key: 'intempestivo',
    option_text: 'Comprovante de pagamento juntado fora do prazo recursal',
    template_text:
`A parte recorrente foi intimada para comprovar a complementação do preparo no prazo de 5 (cinco) dias, na forma do despacho de [MOVIMENTO].

Verifica-se que a leitura de intimação do referido despacho foi confirmada em [DATA], de modo que o prazo de 5 (cinco) dias concedido para regularização do preparo passou a fluir em [DATA] e findou em [DATA], sendo certificado o decurso do prazo em [DATA] ([MOVIMENTO]).

Sendo assim, e considerando que a regularização do preparo foi feita intempestivamente, na medida em que os documentos foram apresentados em [DATA] ([MOVIMENTO]), nos termos do § 2º do artigo 1.007 do Código de Processo Civil, declaro a deserção do recurso.

Nesse sentido, o seguinte precedente:
"TRIBUTÁRIO E PROCESSUAL CIVIL. AGRAVO INTERNO NO AGRAVO EM RECURSO ESPECIAL. RECURSO ESPECIAL. PREPARO INSUFICIENTE. INTIMAÇÃO PARA COMPLEMENTAÇÃO DO PREPARO, NO PRAZO DE 5 (CINCO) DIAS, PREVISTO NO ART. 1.007, § 2º, DO CPC/2015. NÃO ATENDIMENTO, NO PRAZO LEGAL. DESERÇÃO. SÚMULA 187/STJ. AGRAVO INTERNO IMPROVIDO. (...)
III. A extemporânea comprovação da complementação do preparo recursal inviabiliza o conhecimento do presente recurso, nos termos da Súmula 187 desta Corte."
(AgInt no AREsp n. 1.788.290/MS, relatora Ministra Assusete Magalhães, Segunda Turma, julgado em 29/3/2021, DJe de 6/4/2021.)

Diante do exposto, inadmito o recurso interposto.

Intime-se.`,
    source_files: ['607948'],
  },

  // =====================================================================
  // DESISTÊNCIA DE JUSTIÇA GRATUITA — custas em dobro
  // =====================================================================

  'desistencia_jg:Custas em dobro — GRU': {
    step_key: 'desistencia_jg',
    option_text: 'Custas em dobro — GRU',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desistencia_jg:Custas em dobro — FUNJUS': {
    step_key: 'desistencia_jg',
    option_text: 'Custas em dobro — FUNJUS',
    template_text: 'AINDA SEM REFERENCIA DE MINUTAS',
    source_files: [],
  },

  'desistencia_jg:Custas em dobro — GRU e FUNJUS (ambas)': {
    step_key: 'desistencia_jg',
    option_text: 'Custas em dobro — GRU e FUNJUS (ambas)',
    template_text:
`A parte recorrente não comprovou o recolhimento do preparo no ato da interposição do recurso, em razão do pedido de gratuidade nele formulado.

Considerando que o pedido foi manifestado sem que fossem apresentados elementos a comprovar a necessidade do benefício, nos termos do art. 99, § 2º, CPC/2015, restou oportunizado ao recorrente a juntada de documentos, a fim de aferir adequadamente a sua condição financeira, na forma do despacho de [MOVIMENTO].

Todavia, a parte desistiu do pedido da gratuidade da Justiça ([MOVIMENTO]).

Daí que "nesse contexto, em que as custas não foram recolhidas no ato da interposição do recurso especial, bem como a renúncia ao pedido de gratuidade, imperiosa a observância do art. 1.007, § 4º do CPC, com o recolhimento em dobro" (STJ. AREsp n. 2.403.697, Ministra Maria Thereza de Assis Moura, DJe de 14/08/2023.).

Assim, nos termos do artigo 1.007, § 4º, do Código de Processo Civil, intime-se o Recorrente para que, no prazo de 5 (cinco) dias, efetue o pagamento das custas em dobro, sob pena de deserção.

Para tanto, deve ser comprovado o recolhimento dos seguintes valores:
- R$ 600,00 (seiscentos reais) ao Fundo da Justiça – FUNJUS, referente ao recolhimento em dobro das custas locais (Lei Estadual nº 2.956/2025), por meio de guia gerada no próprio sítio deste Tribunal de Justiça, no link https://www.tjpr.jus.br/preparo-de-recurso-2o-grau;
- R$ 540,24 (quinhentos e quarenta reais e vinte e quatro centavos), por meio da guia GRU-COBRANÇA, referente ao recolhimento em dobro das custas devidas ao Superior Tribunal de Justiça, conforme Tabela "B", do Anexo da INSTRUÇÃO NORMATIVA STJ/GP N. 13 DE 27 DE JANEIRO DE 2026.

Cumpre esclarecer que para comprovação do efetivo recolhimento do preparo, a parte deverá providenciar a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível. No caso do pagamento ter sido realizado por meio da plataforma digital PagTesouro, da Secretaria do Tesouro Nacional (ferramenta disponibilizada pela Corte Superior), a parte deverá apresentar o recibo enviado pelo STJ por e-mail, que conterá todas as informações do pagamento, inclusive com os dados de identificação do contribuinte e número único do processo.`,
    source_files: ['0015914'],
  },

  // =====================================================================
  // APÓS INDEFERIMENTO DE J.G. — intimação para preparo e inércia/renúncia
  // =====================================================================

  'apos_indeferimento_jg:Inércia — não manifestação após intimação': {
    step_key: 'apos_indeferimento_jg',
    option_text: 'Inércia — não manifestação após intimação',
    template_text:
`Declaro a deserção do recurso, uma vez que a parte recorrente devidamente intimada da decisão que indeferiu o pedido de justiça gratuita formulado na petição recursal e determinou o recolhimento do preparo ([MOVIMENTO]), permaneceu inerte ([MOVIMENTO]).

Nesse sentido:
"PROCESSUAL CIVIL. AGRAVO INTERNO NO AGRAVO EM RECURSO ESPECIAL. DECISÃO DO RELATOR NO TRIBUNAL DE ORIGEM QUE NEGOU SEGUIMENTO AO RECURSO DE APELAÇÃO. VIOLAÇÃO DOS ARTS. 489 E 1.022 DO CPC. NÃO OCORRÊNCIA. DENEGAÇÃO DO PEDIDO DE JUSTIÇA GRATUITA. AUSÊNCIA DE RECOLHIMENTO DO PREPARO NO PRAZO ASSINALADO. DESERÇÃO. DECISÃO MANTIDA. AGRAVO INTERNO NÃO PROVIDO.
(...)
3. Contudo, se mesmo após ter sido intimada na forma do dispositivo acima mencionado, a parte não efetuar o recolhimento do preparo recursal no prazo assinalado, a consequência é o reconhecimento da deserção do recurso, e não uma nova intimação a fim de possibilitar o recolhimento em dobro, na esteira do que dispõe o art. 1.007, § 4º, do CPC.
4. Agravo interno não provido".
(AgInt no AREsp n. 2.624.581/MS, relator Ministro Moura Ribeiro, Terceira Turma, julgado em 24/2/2025, DJEN de 28/2/2025.)

Diante do exposto, inadmito o recurso interposto.

Intimem-se.`,
    source_files: ['606190', '672340'],
  },

  'apos_indeferimento_jg:Renúncia ao prazo': {
    step_key: 'apos_indeferimento_jg',
    option_text: 'Renúncia ao prazo',
    template_text:
`Declaro a deserção do recurso, uma vez que a parte recorrente devidamente intimada da decisão que indeferiu o pedido de justiça gratuita formulado na petição recursal e determinou o recolhimento do preparo ([MOVIMENTO]), renunciou ao prazo sem cumpri-lo ([MOVIMENTO]).

Nesse sentido:
"PROCESSUAL CIVIL. AGRAVO INTERNO NO AGRAVO EM RECURSO ESPECIAL. DECISÃO DO RELATOR NO TRIBUNAL DE ORIGEM QUE NEGOU SEGUIMENTO AO RECURSO DE APELAÇÃO. VIOLAÇÃO DOS ARTS. 489 E 1.022 DO CPC. NÃO OCORRÊNCIA. DENEGAÇÃO DO PEDIDO DE JUSTIÇA GRATUITA. AUSÊNCIA DE RECOLHIMENTO DO PREPARO NO PRAZO ASSINALADO. DESERÇÃO. DECISÃO MANTIDA. AGRAVO INTERNO NÃO PROVIDO.
(...)
3. Contudo, se mesmo após ter sido intimada na forma do dispositivo acima mencionado, a parte não efetuar o recolhimento do preparo recursal no prazo assinalado, a consequência é o reconhecimento da deserção do recurso, e não uma nova intimação a fim de possibilitar o recolhimento em dobro, na esteira do que dispõe o art. 1.007, § 4º, do CPC.
4. Agravo interno não provido".
(AgInt no AREsp n. 2.624.581/MS, relator Ministro Moura Ribeiro, Terceira Turma, julgado em 24/2/2025, DJEN de 28/2/2025.)

Diante do exposto, inadmito o recurso interposto.

Intimem-se.`,
    source_files: ['0002812', 'apos-indeferimento-de-jg-intimado-para-preparo-simples-e-nao-regularizou'],
  },

  'apos_indeferimento_jg:Decurso de prazo': {
    step_key: 'apos_indeferimento_jg',
    option_text: 'Decurso de prazo',
    template_text:
`Declaro a deserção do recurso, uma vez que a parte recorrente devidamente intimada da decisão que indeferiu o pedido de justiça gratuita formulado na petição recursal e determinou o recolhimento do preparo ([MOVIMENTO]), não se manifestou (certidão de decurso de prazo de [MOVIMENTO]).

Nesse sentido:
"PROCESSUAL CIVIL. AGRAVO INTERNO NO AGRAVO EM RECURSO ESPECIAL. DECISÃO DO RELATOR NO TRIBUNAL DE ORIGEM QUE NEGOU SEGUIMENTO AO RECURSO DE APELAÇÃO. VIOLAÇÃO DOS ARTS. 489 E 1.022 DO CPC. NÃO OCORRÊNCIA. DENEGAÇÃO DO PEDIDO DE JUSTIÇA GRATUITA. AUSÊNCIA DE RECOLHIMENTO DO PREPARO NO PRAZO ASSINALADO. DESERÇÃO. DECISÃO MANTIDA. AGRAVO INTERNO NÃO PROVIDO.
(...)
3. Contudo, se mesmo após ter sido intimada na forma do dispositivo acima mencionado, a parte não efetuar o recolhimento do preparo recursal no prazo assinalado, a consequência é o reconhecimento da deserção do recurso, e não uma nova intimação a fim de possibilitar o recolhimento em dobro, na esteira do que dispõe o art. 1.007, § 4º, do CPC.
4. Agravo interno não provido".
(AgInt no AREsp n. 2.624.581/MS, relator Ministro Moura Ribeiro, Terceira Turma, julgado em 24/2/2025, DJEN de 28/2/2025.)

Diante do exposto, inadmito o recurso interposto.

Intimem-se.`,
    source_files: ['606190', '672340'],
  },
};