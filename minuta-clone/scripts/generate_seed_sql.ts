import { minutaCatalog } from '../src/data/minutaCatalog';
import { writeFileSync } from 'fs';

const SEM_REF = 'AINDA SEM REFERENCIA DE MINUTAS';

interface Row {
  step_key: string;
  option_text: string;
  title: string;
  template_text: string;
  source_files: string[];
}

function categoryLabel(stepKey: string): string {
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
}

function escSql(s: string): string {
  return s.replace(/'/g, "''");
}

function generateTemplate(stepKey: string, optionText: string, isResp: boolean): string {
  if (!isResp) return SEM_REF;

  const guia = optionText.includes('GRU') ? 'GRU' : optionText.includes('FUNJUS') ? 'FUNJUS' : 'ambas';
  const step = stepKey;

  if (step === 'intempestivo') {
    if (optionText.includes('Pagamento realizado')) {
      return `Trata-se de recurso especial cujo preparo foi efetuado após o término do prazo recursal, nos termos do artigo 1.003, § 5º, c/c o artigo 219, ambos do Código de Processo Civil.

Não se conhece do recurso, porquanto o recolhimento das custas recursais ocorreu fora do prazo legal, o que impede a comprovação tempestiva do preparo, nos termos da jurisprudência desta Corte (AgInt no AREsp nº 2.039.729/RS, relator Ministro Antonio Carlos Ferreira, Quarta Turma, julgado em 27/06/2023, DJe de 30/06/2023).

Em razão disso, NEGO PROVIMENTO ao agravo interno.

Publique-se.

Intimem-se.`;
    } else {
      return `Trata-se de recurso especial cujo comprovante de pagamento das custas recursais foi juntado aos autos após o término do prazo recursal, nos termos do artigo 1.003, § 5º, c/c o artigo 219, ambos do Código de Processo Civil.

A jurisprudência do Superior Tribunal de Justiça é firme no sentido de que a comprovação do preparo recursal deve ser feita no prazo legal, sendo intempestiva a juntada posterior ao transcurso do prazo, o que implica inadmissibilidade do recurso (AgInt no AREsp nº 2.039.729/RS, relator Ministro Antonio Carlos Ferreira, Quarta Turma, julgado em 27/06/2023, DJe de 30/06/2023).

Em razão disso, NEGO PROVIMENTO ao agravo interno.

Publique-se.

Intimem-se.`;
    }
  }

  if (step === 'desistencia_jg') {
    if (optionText.includes('GRU e FUNJUS')) {
      return `Declarada a desistência da Justiça Gratuita, as custas processuais são exigidas em dobro, nos termos do artigo 1.007, § 4º, do Código de Processo Civil.

Intime-se a parte recorrente para, no prazo de 5 (cinco) dias, comprovar o recolhimento em dobro do preparo recursal, sob pena de deserção.

Valores devidos:
- R$ 540,24 (GRU em dobro) — custas devidas ao Superior Tribunal de Justiça, conforme Tabela "B" da INSTRUÇÃO NORMATIVA STJ/GP Nº 13/2026;
- R$ 600,00 (FUNJUS em dobro) — custas devidas ao Tribunal de Justiça do Estado do Paraná, conforme Lei Estadual nº 22.956/2025.

O recolhimento da GRU deverá ser efetuado por meio da Guia de Recolhimento da União (GRU-Cobrança), disponível no sítio do STJ. O recolhimento da FUNJUS deverá ser efetuado por meio de guia gerada no sítio deste Tribunal: https://www.tjpr.jus.br/preparo-de-recurso-2o-grau.

Insta salientar que a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível, são imprescindíveis para fins de comprovação do efetivo recolhimento do preparo.`;
    }
    const guiaLabel = optionText.includes('GRU') ? 'GRU' : 'FUNJUS';
    const valor = guiaLabel === 'GRU' ? 'R$ 270,12' : 'R$ 300,00';
    const orgao = guiaLabel === 'GRU' ? 'Superior Tribunal de Justiça, conforme Tabela "B" da INSTRUÇÃO NORMATIVA STJ/GP Nº 13/2026' : 'Tribunal de Justiça do Estado do Paraná, conforme Lei Estadual nº 22.956/2025';
    const guiaTipo = guiaLabel === 'GRU' ? 'Guia de Recolhimento da União (GRU-Cobrança), disponível no sítio do STJ' : 'guia gerada no sítio deste Tribunal: https://www.tjpr.jus.br/preparo-de-recurso-2o-grau';
    return `Declarada a desistência da Justiça Gratuita, as custas processuais referentes à ${guiaLabel} são exigidas em dobro, nos termos do artigo 1.007, § 4º, do Código de Processo Civil.

Intime-se a parte recorrente para, no prazo de 5 (cinco) dias, comprovar o recolhimento em dobro do preparo recursal referente à ${guiaLabel}, sob pena de deserção.

Valor devido: ${valor} em dobro — custas devidas ao ${orgao}.

O recolhimento deverá ser efetuado por meio da ${guiaTipo}.

Insta salientar que a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível, são imprescindíveis para fins de comprovação do efetivo recolhimento do preparo.`;
  }

  if (step === 'apos_indeferimento_jg') {
    const motivo = optionText.includes('Inércia') ? 'não se manifestou' : optionText.includes('Renúncia') ? 'renunciou ao prazo' : 'decorreu o prazo';
    return `Após o indeferimento do pedido de Justiça Gratuita e a intimação para comprovação do preparo recursal, a parte ${motivo}, não regularizando o recolhimento das custas no prazo assinado.

Trata-se, portanto, de hipótese de deserção, nos termos do artigo 1.007, §§ 4º e 5º, do Código de Processo Civil, c/c a Súmula 187 do Superior Tribunal de Justiça.

Declaro a deserção do recurso.

Publique-se.

Intimem-se.`;
  }

  if (step.startsWith('comp_')) {
    const isGRU = step === 'comp_gru';
    const guiaNome = isGRU ? 'GRU' : 'FUNJUS';
    const artigo = optionText.includes('agendamento') || optionText.includes('divergente') || optionText.includes('insuficiente') || optionText.includes('N/D') || optionText.includes('não localizado') ? 'art. 1.007, § 2º' : 'art. 1.007, § 7º';
    const valorBase = isGRU ? 'R$ 270,12' : 'R$ 300,00';
    const fundoDestino = isGRU ? 'Superior Tribunal de Justiça, conforme Tabela "B" da INSTRUÇÃO NORMATIVA STJ/GP Nº 13/2026' : 'Tribunal de Justiça do Estado do Paraná, conforme Lei Estadual nº 22.956/2025';
    const guiaRef = isGRU ? 'guia GRU-COBRANÇA' : 'guia gerada no próprio sítio deste Tribunal de Justiça, no link https://www.tjpr.jus.br/preparo-de-recurso-2o-grau';

    let corpo = `O recurso não foi devidamente preparado, visto que o recolhimento das custas recursais devidas ${isGRU ? 'ao Superior Tribunal de Justiça' : 'a este Tribunal de Justiça'} apresenta irregularidade.

`;

    if (optionText.includes('agendamento bancário')) {
      corpo += `O comprovante apresentado para a ${guiaNome} é um agendamento bancário, não constituindo prova de recolhimento efetivo (AgInt nos EAREsp n. 940.673/SP, relator Ministro João Otávio de Noronha, Corte Especial, julgado em 8/4/2025, DJEN de 14/4/2025).

`;
    } else if (optionText.includes('divergência de código de barras') || optionText.includes('sem código de barras')) {
      corpo += `O comprovante da ${guiaNome} não permite a verificação do recolhimento, pois ${optionText.includes('divergência') ? 'o código de barras não corresponde ao da guia de recolhimento' : 'não apresenta o código de barras de forma visível e legível'}, nos termos da jurisprudência: "(...) a falta de correspondência entre o código de barras(...) implica pena de deserção" (AgInt no AREsp n. 1.894.595/RJ, relator Ministro Raul Araújo, Quarta Turma, julgado em 22/11/2021).

`;
    } else if (optionText.includes('outro processo')) {
      corpo += `A guia ${guiaNome} apresentada pertence a outro processo ou recurso, não sendo imputável ao presente feito.

`;
    } else if (optionText.includes('valor divergente') || optionText.includes('insuficiente')) {
      corpo += `O valor recolhido na ${guiaNome} é divergente ou insuficiente em relação ao montante exigido.

`;
    } else if (optionText.includes('Número único')) {
      corpo += `O número único de referência constante no documento não corresponde ao número do processo nem à árvore processual.

`;
    } else if (optionText.includes('não apresentada') || optionText.includes('nunca juntada')) {
      corpo += `A parte foi intimada para juntar a guia ${guiaNome} correspondente e não atendeu à determinação no prazo assinado.

`;
    }

    corpo += `Intime-se a parte recorrente, nos termos do ${artigo} do Código de Processo Civil, para, no prazo de 5 (cinco) dias, complementar o preparo recursal, sob pena de deserção.

Para tanto, a parte deverá ${optionText.includes('agendamento') || optionText.includes('N/D') || optionText.includes('não localizado') ? 'apresentar o comprovante de pagamento definitivo referente à guia já juntada ou, caso não seja possível, realizar novo recolhimento' : 'regularizar a irregularidade apontada'};

`;

    if (optionText.includes('não apresentada') || optionText.includes('nunca juntada') || optionText.includes('sem comprovante') || optionText.includes('sem a guia')) {
      corpo += `Valor a ser recolhido: ${valorBase}, referente ${isGRU ? 'às custas devidas ao ' + fundoDestino : 'às custas devidas ao ' + fundoDestino};

O recolhimento deverá ser efetuado por meio da ${guiaRef}.`;
    } else {
      corpo += `Caso não seja possível a regularização, a parte deverá realizar novo recolhimento da importância de ${valorBase}, ${isGRU ? 'ao Fundo Especial do STJ' : 'ao Fundo da Justiça – FUNJUS'}, referente ${isGRU ? 'às custas do Superior Tribunal de Justiça' : 'às custas locais'}, ${isGRU ? 'conforme Tabela "B" da INSTRUÇÃO NORMATIVA STJ/GP Nº 13/2026' : 'conforme Lei Estadual nº 22.956/2025'}.

O recolhimento deverá ser efetuado por meio da ${guiaRef}.`;
    }

    corpo += `

Insta salientar que a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível, são imprescindíveis para fins de comprovação do efetivo recolhimento do preparo.`;

    return corpo;
  }

  if (step === 'dobro' || step === 'dobro_nd') {
    return `Verifica-se que a parte recorrente não comprovou o recolhimento do preparo no ato da interposição do recurso, nos termos do artigo 1.007, § 4º, do Código de Processo Civil.

Intime-se a parte recorrente para que comprove, no prazo de 5 (cinco) dias, sob pena de deserção, o recolhimento em dobro do preparo.

Para tanto, a parte deverá comprovar o recolhimento dos seguintes valores:
- R$ 540,24 (GRU em dobro) — custas devidas ao Superior Tribunal de Justiça, conforme Tabela "B" da INSTRUÇÃO NORMATIVA STJ/GP Nº 13/2026, por meio da guia GRU-COBRANÇA;
- R$ 600,00 (FUNJUS em dobro) — custas devidas ao Tribunal de Justiça do Estado do Paraná, conforme Lei Estadual nº 22.956/2025, por meio de guia gerada no sítio https://www.tjpr.jus.br/preparo-de-recurso-2o-grau.

Insta salientar que a juntada da guia e do respectivo comprovante de pagamento, no qual conste o código de barras de forma visível e legível, são imprescindíveis para fins de comprovação do efetivo recolhimento do preparo. No caso do pagamento ter sido realizado por meio da plataforma digital PagTesouro, da Secretaria do Tesouro Nacional, a parte deverá apresentar o recibo enviado pelo STJ por e-mail.`;
  }

  if (step.startsWith('desercao')) {
    const isGRU = step.includes('gru');
    const isFUNJUS = step.includes('funjus');
    const isND = step.includes('nd_');
    const is2pgto = step.includes('2pgto');
    const is1pgto = step.includes('1pgto');
    const artBase = is2pgto ? 'art. 1.007, §§ 4º e 5º, do Código de Processo Civil' : 'art. 1.007, §§ 4º e 5º, do Código de Processo Civil';
    const guiaLabel = isND ? 'ambas as guias' : isGRU ? 'guia GRU' : 'guia FUNJUS';

    let corpo = `Verificada a irregularidade insanável no preparo recursal referente ${isND ? 'às guias GRU e FUNJUS' : isGRU ? 'à guia GRU' : 'à guia FUNJUS'}, não regularizada no prazo assinado.

Trata-se de hipótese de deserção, nos termos do ${artBase}, c/c a Súmula 187 do Superior Tribunal de Justiça.

`;

    if (optionText.includes('simples (em vez de dobro)')) {
      corpo += `A parte foi intimada para recolher o preparo em dobro e comprovou o pagamento em valor simples, não atendendo à determinação judicial.

`;
    } else if (optionText.includes('não apresentada após intimação') || optionText.includes('nunca juntada')) {
      corpo += `A parte foi intimada para juntar a ${guiaLabel} correspondente e não atendeu à determinação no prazo assinado.

`;
    } else if (optionText.includes('Ausência de manifestação')) {
      corpo += `A parte foi intimada e não se manifestou.

`;
    } else if (optionText.includes('Renúncia de prazo')) {
      corpo += `A parte renunciou ao prazo para regularização.

`;
    } else if (optionText.includes('Decurso de prazo')) {
      corpo += `Decorrido o prazo para regularização sem manifestação da parte.

`;
    }

    corpo += `Declaro a deserção do recurso.

Publique-se.

Intimem-se.`;

    return corpo;
  }

  return SEM_REF;
}

const rows: Row[] = [];

const respPaths = minutaCatalog.filter(e => e.selections[0]?.optionText === 'Recurso Especial (REsp)');

respPaths.forEach(entry => {
  const last = entry.selections[entry.selections.length - 1];
  const title = `${categoryLabel(last.stepKey)} — ${last.optionText.substring(0, 80)} (REsp)`;
  const template_text = generateTemplate(last.stepKey, last.optionText, true);
  const sourceFiles: string[] = [];
  rows.push({
    step_key: last.stepKey,
    option_text: last.optionText,
    title,
    template_text,
    source_files: sourceFiles
  });
});

let sql = `-- =============================================================================
-- Gerador de Minutas — Seed Completo: todos os templates de minuta
-- Execute APÓS o schema.sql no SQL Editor do Supabase.
-- Gerado automaticamente pelo script scripts/generate_seed_sql.ts
--
-- VALORES ATUALIZADOS (Sprint 4):
--   GRU (REsp): R$ 270,12 — IN STJ/GP nº 13/2026, vigência 02/02/2026
--   FUNJUS: R$ 300,00 / R$ 600,00 (dobro) — Lei Estadual 22.956/2025, vigência 18/03/2026
--   RE: valores STF (usar [VALOR_STF] como placeholder)
-- =============================================================================

-- Remover template obsoleto (removido do fluxo — S0-T6: só 1 guia → complementação, não dobro)
DELETE FROM minuta_templates WHERE option_text = '1 guia certa (GRU ou FUNJUS) + comprovante ausente/inválido';

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
console.log(`Generated ${rows.length} rows (REsp only — RE returns SEM_REFERENCIA at app level)`);
console.log(`Written to supabase/seed_minutas_completo.sql`);