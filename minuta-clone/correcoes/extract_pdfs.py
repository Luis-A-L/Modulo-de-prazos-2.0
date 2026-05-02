import pdfplumber, os

minutas_dir = r"D:\CODE_TONI\gerador_minutas\minutas"

priority_pdfs = [
    "670588 - AR - TR - Complementação preparo - GRU (valor atualizado 02 fev - 2026) - somente guia sem comprovante de pagamento.pdf",
    "596798 - AR - TR - Complementação preparo - GRU - Ausência código de barras - Recurso Especial.pdf",
    "596361 - AR - TR - Complementação preparo - FUNJUS - somente guia sem comprovante de pagamento.pdf",
    "596757 - AR - TR - Complementação preparo - FUNJUS - Ausência código de barras - Recurso Especial.pdf",
    "596347 - AR - TR - Complementação preparo - FUNJUS - Códigos de barras não correspondem - Recurso Especial.pdf",
    "628802 - AR-TR- Complementação do preparo - guia GRU - divergência código de barras.pdf",
    "596212 - AR - TR - DOBRO - Recurso Extraordinário.pdf",
    "676940 - AR - TR - DOBRO - EM PROCESSO DE AUTENTICAÇÃO - VALOR 2026.pdf",
    "598979 - AR - TR - DOBRO - Preparo após interposição - Intimar para complementação - Recurso Especial.pdf",
    "646311 - AR - TR - JUNTAR DECRETO e DOBRO - RE.pdf",
    "615885 - AR- TR - JUNTAR DECRETO E DOBRO - REsp.pdf",
    "677400 - AR - TR - JUNTAR DECRETO E DOBRO - JUNTOU SOMENTE COMPROVANTES.pdf",
    "596249 - AR - TR - PROCURAÇÃO + Recolhimento em DOBRO - Resp.pdf",
    "596190 - AR - TR - DESERTO - 1.007 §2º - Juntou apenas o comprovante de pagamento - COMPLEMENTAÇÃO - Recurso Extraordinário.pdf",
    "596274 - AR - TR - DESERTO - 1.007 §4º - Juntou apenas o comprovante de pagamento - Recurso Extraordinário.pdf",
    "596260 - AR - TR - DESERTO - 1.007 §4º - Juntou apenas o comprovante de pagamento - Recurso Extraordinário.pdf",
    "596222 - AR - TR - DESERTO - 1.007 §2º - Recurso Especial - Ausência de complementação.pdf",
    "596237 - AR - TR - DESERTO - 1.007 §4º - Ausência de manifestação - Recurso Extraordinário.pdf",
    "670304 - AR - TR - INTEMPESTIVO E DESERTO (DOBRO) - DECURSO DE PRAZO - Recurso Especial.pdf",
    "627206 - AR - TR - INTEMPESTIVO E DESERTO (complementação) - DECURSO DE PRAZO - Recurso Especial.pdf",
    "670902 - AR - TR - DOBRO - DIVERGÊNCIA CÓDIGO DE BARRAS - NOVO VALOR 2026.pdf",
    "0002812-14.2025.8.16.0100 Pet - INADMISSÃO - DESERTO - J.G. INDEFERIDA - INTIMADO CUSTAS - RENUNCIOU O PRAZO.pdf",
    "0015914-78.2026.8.16.0000 Pet - DESISTENCIA J.G. - CUSTAS DOBRO - PEDIDO DE PARCELAMENTO - INDEFERIDO.pdf",
    "0148996-45.2025.8.16.0000 Pet - INTIMAÇÃO N. ÚNICO PROCESSO GUIA GRU DIVERGENTE + FUNJUS.pdf",
    "nao_tem_comprovante_de_agendamento.pdf",
    "apos-indeferimento-de-jg-intimado-para-preparo-simples-e-nao-regularizou.pdf",
    "596206 - AR - TR - DOBRO - Juntada de comprovante de pagamento do GRU - Recurso Especial.pdf",
    "597127 - AR - TR - DOBRO - J.G. NÃO LOCALIZADA - Recurso Especial.pdf",
    "600448 - AR - TR - DOBRO - recolhimento recurso originário - ato incompatível.pdf",
    "596227 - AR - TR - DESERTO - 1.007 §2º - Recurso Extraordinário - Ausência de complementação.pdf",
    "604597 - AR - TR - DESERTO - intimação regularização preparo - pedido JG.pdf",
    "606190 - AR - TR - DESERTO - indeferida a JG e prazo para recolher preparo - inércia - REsp.pdf",
    "645022 - AR - TR - DESERTO - 1.007 §2º - despacho procuração e preparo.pdf",
    "672340 - AR - TR - DESERTO - indeferida a JG e prazo para recolher preparo - RE.pdf",
    "676412 - AR - TR - DESERTO - INTIMAÇÃO RECOLHIMENTO DOBRO - PEDIDO JG - RE.pdf",
    "596230 - AR - TR - DESERTO - 1.007 §4º - Ausência de manifestação - Recurso Especial.pdf",
    "607948 - AR - TR - DESERTO - 1.007 §2º - Recurso Especial - Comprovação fora do prazo legal.pdf",
    "596836 - AR - TR - DESERTO - 1.007 §2º - ausência de código de barras na complementação- Recurso Especial.pdf",
    "604326 - AR - TR - DESERTO - dobro - comprovou FUNJUS forma simples - Recurso Extraordinário.pdf",
    "596255 - AR - TR - DESERTO - 1.007 §4º - Juntou apenas o comprovante de pagamento - Recurso Especial.pdf",
    "596214 - AR - TR - DESERTO - 1.007 §2º - recolhimento do valor de FUNJUS pela guia GRU - Recurso Especial - Valor a partir de 01.24.pdf",
    "599974 - AR - TR - DESERTO - 1.007 §2º - Divergência código barras - Recurso Especial.pdf",
    "608076 - AR - TR - DESERTO - 1.007 §2º - Recurso Especial - Recolhimento do valor de FUNJUS pela guia FUNREJUS.pdf",
    "600045 - AR - TR - DESERTO - Indeferimento JG - preparo irregular - sem código de barras.pdf",
]

for pdf_name in priority_pdfs:
    path = os.path.join(minutas_dir, pdf_name)
    if not os.path.exists(path):
        print(f"\n{'='*80}")
        print(f"PDF: {pdf_name}")
        print(f"STATUS: FILE_NOT_FOUND")
        continue
    try:
        text_parts = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
        full_text = "\n".join(text_parts)
        print(f"\n{'='*80}")
        print(f"PDF: {pdf_name}")
        print(f"{'='*80}")
        print(full_text[:4000] if len(full_text) > 4000 else full_text)
    except Exception as e:
        print(f"\n{'='*80}")
        print(f"PDF: {pdf_name}")
        print(f"ERROR: {e}")
