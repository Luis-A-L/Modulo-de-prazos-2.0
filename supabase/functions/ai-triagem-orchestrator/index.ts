import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const API_KEY = Deno.env.get("API_KEY") || Deno.env.get("OPENCODE_API_KEY") || Deno.env.get("OPENCODE") || Deno.env.get("OPENROUTER_API_KEY") || "";
const AI_ENDPOINT = "https://opencode.ai/zen/v1/chat/completions";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-opencode-key',
  'Content-Type': 'application/json',
};

async function callAI(model: string, messages: any[], temperature = 0.3, maxTokens = 4000, customKey?: string) {
  const keyToUse = customKey || API_KEY;
  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${keyToUse}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `AI API error: ${response.status}`);
  return data?.choices?.[0]?.message?.content || "";
}


serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== 'POST') return new Response('Not allowed', { status: 405, headers: CORS_HEADERS });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const authHeader = req.headers.get('Authorization');
    const customKey = req.headers.get('x-opencode-key') || '';
    const supabase = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });


    const body = await req.json();
    const { action, analise_id, userId, resultado_final, resumo_executivo, agentes, texto_ocr, document_names, modelo_ia } = body;

    // ── Existing actions ──
    if (action === 'create_analise') {
      const { data, error } = await supabase.from('triagem_analises').insert({
        user_id: userId, document_names, texto_ocr, modelo_ia: modelo_ia || 'deepseek-v4-flash-free', status: 'processing'
      }).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS_HEADERS });
      return new Response(JSON.stringify({ ok: true, analise_id: data.id }), { headers: CORS_HEADERS });
    }

    if (action === 'save_agente') {
      const { data, error } = await supabase.from('triagem_resultados_agentes').insert({
        analise_id, agente_nome: agentes.nome, status: agentes.status,
        output_json: agentes.data, raw_response: agentes.raw || null,
        prompt_usado: agentes.prompt?.slice(0, 500) || null,
        tokens_estimados: agentes.tokens_estimados || 0,
        tempo_ms: agentes.tempo_ms || 0, error_message: agentes.error || null,
      }).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS_HEADERS });
      return new Response(JSON.stringify({ ok: true, id: data.id }), { headers: CORS_HEADERS });
    }

    if (action === 'complete_analise') {
      const { error } = await supabase.from('triagem_analises').update({
        status: 'completed', resultado_final, resumo_executivo, completed_at: new Date().toISOString()
      }).eq('id', analise_id).eq('user_id', userId);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS_HEADERS });
      return new Response(JSON.stringify({ ok: true }), { headers: CORS_HEADERS });
    }

    if (action === 'fail_analise') {
      const { error } = await supabase.from('triagem_analises').update({
        status: 'failed', error_message: body.error_message
      }).eq('id', analise_id).eq('user_id', userId);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS_HEADERS });
      return new Response(JSON.stringify({ ok: true }), { headers: CORS_HEADERS });
    }

    // ── Chat action ──
    if (action === 'chat') {
      const { conversa_id, mensagem, contexto_documento, analise_id: chatAnaliseId } = body;
      if (!mensagem) return new Response(JSON.stringify({ error: 'Mensagem obrigatoria' }), { status: 400, headers: CORS_HEADERS });

      // 1. Get or create conversation
      let convId = conversa_id;
      if (!convId) {
        const { data: conv, error: convErr } = await supabase.from('triagem_conversas').insert({
          analise_id: chatAnaliseId || null,
          usuario_id: userId || null,
          contexto: contexto_documento ? { documento: contexto_documento } : null,
        }).select().single();
        if (convErr) return new Response(JSON.stringify({ error: convErr.message }), { status: 500, headers: CORS_HEADERS });
        convId = conv.id;
      }

      // If init message, just return the conversation ID
      if (mensagem === '__init__') {
        return new Response(JSON.stringify({ ok: true, conversa_id: convId }), { headers: CORS_HEADERS });
      }

      // 2. Save user message
      try {
        await supabase.from('triagem_mensagens').insert({
          conversa_id: convId, papel: 'operador', conteudo: mensagem,
        });
      } catch (err) {
        console.error('Erro ao salvar mensagem do operador:', err);
      }

      // 3. Fetch conversation history (last 10 messages)
      const { data: historico } = await supabase.from('triagem_mensagens')
        .select('*').eq('conversa_id', convId).order('created_at', { ascending: false }).limit(10);
      const messages = (historico || []).reverse();

      // 4. Fetch orchestrator and sub-agents
      const { data: orquestrador } = await supabase.from('agentes_triagem')
        .select('*').is('agente_pai_id', null).eq('ativo', true).limit(1).single();
      if (!orquestrador) return new Response(JSON.stringify({ error: 'Nenhum orquestrador configurado' }), { status: 500, headers: CORS_HEADERS });

      const { data: subAgentes } = await supabase.from('agentes_triagem')
        .select('id, nome, descricao, modelo_ia, prompt, conhecimento_anexo, temperatura')
        .not('agente_pai_id', 'is', null).eq('ativo', true).order('ordem', { ascending: true });

      // 5. Call orchestrator to decide routing
      const subAgentesInfo = (subAgentes || []).map(a => ({
        id: a.id, nome: a.nome, descricao: a.descricao,
      }));
      const historicoTexto = messages.map(m =>
        `${m.papel === 'operador' ? 'Operador' : m.agente_id ? 'IA' : 'Sistema'}: ${m.conteudo}`
      ).join('\n');

      const orquestradorPrompt = orquestrador.prompt || '';
      const orquestradorMessages = [
        { role: 'system', content: orquestradorPrompt },
        ...(orquestrador.conhecimento_anexo ? [{ role: 'system', content: `Conhecimento:\n${orquestrador.conhecimento_anexo}` }] : []),
        { role: 'system', content: `Subagentes disponiveis:\n${JSON.stringify(subAgentesInfo, null, 2)}` },
        { role: 'system', content: contexto_documento ? `Contexto do documento:\n${contexto_documento}` : 'Nenhum documento carregado' },
        ...(historicoTexto ? [{ role: 'system', content: `Historico da conversa:\n${historicoTexto}` }] : []),
        { role: 'user', content: `Mensagem do operador: ${mensagem}\n\nDecida qual subagente deve responder ou responda voce mesmo. Responda APENAS com JSON: { "subagente": "nome_exato" | null, "resposta_direta": "texto ou null" }` },
      ];

      const decisaoRaw = await callAI(
        orquestrador.modelo_ia || 'deepseek-v4-flash-free',
        orquestradorMessages,
        orquestrador.temperatura ?? 0.3,
        1000,
        customKey
      );

      // 6. Parse orchestrator decision
      let decisao: { subagente?: string | null; resposta_direta?: string | null } = {};
      try {
        const cleaned = decisaoRaw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) decisao = JSON.parse(jsonMatch[0]);
      } catch {
        // If JSON parsing fails, treat as direct response
        decisao = { subagente: null, resposta_direta: decisaoRaw };
      }

      let respostaTexto = '';
      let agenteUsado = orquestrador.id || null;
      let nomeAgenteUsado = orquestrador.nome || 'Orquestrador';

      if (decisao.resposta_direta) {
        // Orchestrator responded directly
        respostaTexto = decisao.resposta_direta;
      } else if (decisao.subagente && subAgentes?.length) {
        // Find the selected sub-agent (try exact name match, then partial)
        const alvo = subAgentes.find(a =>
          a.nome.toLowerCase() === decisao.subagente?.toLowerCase()
        ) || subAgentes.find(a =>
          a.nome.toLowerCase().includes(decisao.subagente?.toLowerCase() || '')
        );
        if (alvo) {
          nomeAgenteUsado = alvo.nome;
          agenteUsado = alvo.id;
          const subPrompt = [
            { role: 'system', content: alvo.prompt || '' },
            ...(alvo.conhecimento_anexo ? [{ role: 'system', content: `Conhecimento:\n${alvo.conhecimento_anexo}` }] : []),
            ...(contexto_documento ? [{ role: 'system', content: `Documento:\n${contexto_documento}` }] : []),
            ...(historicoTexto ? [{ role: 'system', content: `Conversa:\n${historicoTexto}` }] : []),
            { role: 'user', content: mensagem },
          ];
          respostaTexto = await callAI(
            alvo.modelo_ia || 'deepseek-v4-flash-free',
            subPrompt,
            alvo.temperatura ?? 0.3,
            2000,
            customKey
          );
        } else {
          respostaTexto = `Nao encontrei o agente "${decisao.subagente}". Agentes disponiveis: ${subAgentes.map(a => a.nome).join(', ')}.`;
        }
      } else {
        respostaTexto = decisaoRaw;
      }

      // 7. Save assistant message
      try {
        await supabase.from('triagem_mensagens').insert({
          conversa_id: convId, papel: 'subagente', agente_id: agenteUsado, conteudo: respostaTexto,
          metadados: { nome_agente: nomeAgenteUsado },
        });
      } catch (err) {
        console.error('Erro ao salvar mensagem do assistente:', err);
      }

      return new Response(JSON.stringify({
        ok: true,
        conversa_id: convId,
        mensagem: respostaTexto,
        agente: nomeAgenteUsado,
        agente_id: agenteUsado,
      }), { headers: CORS_HEADERS });
    }

    // ── Get agents list ──
    if (action === 'get_agentes') {
      const { data, error } = await supabase.from('agentes_triagem')
        .select('*').eq('ativo', true).order('ordem', { ascending: true });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS_HEADERS });
      return new Response(JSON.stringify({ ok: true, agentes: data || [] }), { headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: 'Acao invalida: ' + action }), { status: 500, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
});
