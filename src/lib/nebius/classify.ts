/**
 * Google Gemini classifier
 *
 * Usa Gemini 2.0 Flash via Google AI Studio (gratuito, sem cartão).
 * Google oferece endpoint OpenAI-compatível — mesma estrutura de chamada.
 */

import { RiskReport, ScamFlag } from "@/types";
import { recordAgentRun } from "@/lib/supabase/server";

// Endpoint OpenAI-compatível do Gemini
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface APIResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const SYSTEM_PROMPT = `Você é o Elucya Shield, um especialista em detecção de golpes e fraudes digitais, com foco especial em ataques direcionados a desenvolvedores e profissionais de tecnologia.

Sua tarefa é analisar mensagens e identificar se são tentativas de golpe.

## Padrões de golpe que você conhece em profundidade:

### Golpes de vaga de emprego falsa para devs (alta prioridade):
- E-mails de recrutamento não solicitado pedindo para clonar/rodar repositório (rouba chaves/seeds)
- "Testes técnicos" que executam código malicioso na máquina do candidato
- Ofertas de salário exorbitante (>$5k/mês remoto sem entrevista prévia)
- Foco em blockchain/crypto/Web3/NFT/DeFi como isca para devs com wallets
- Formulários externos (Google Forms, Typeform) para coleta de dados pessoais
- Domínios typosquatting (ex: "metaspaceschain.com" fingindo ser "metaspacechain.com")
- Empresa de gaming/blockchain "baseada em Dubai/UAE/offshore" sem verificação

### Phishing e engenharia social:
- Urgência artificial ("apenas 2 vagas", "responda hoje")
- Autoridade falsa (empresa com licença RAK-DAO, parceiros famosos)
- Personalização com dados scrapeados (nome real, projeto real mencionado)
- Remetente diferente do domínio oficial do site linkado

### Outros vetores:
- Links maliciosos disfarçados de recursos legítimos
- Pedidos de wallet/seed phrase para "signing bonus" ou "teste de pagamento"
- NPM packages maliciosos em "testes técnicos"

## Você deve:
1. Verificar se o domínio do remetente bate com o site/empresa mencionada (typosquatting)
2. Identificar se há pedido implícito ou explícito de executar código externo
3. Avaliar o realismo da oferta (salário, processo, empresa)
4. Identificar entidades do REMETENTE (empresa dele, domínio, URLs, formulários, repos que pedem para clonar)
5. NÃO inclua como entidades projetos ou repositórios que PERTENCEM AO DESTINATÁRIO — se o e-mail menciona trabalhos anteriores da vítima para criar rapport, esses não são entidades suspeitas
6. Retornar um JSON estruturado com o relatório de risco

IMPORTANTE: Responda APENAS com JSON válido, sem texto adicional.

Schema esperado:
{
  "score": 0-100,
  "level": "safe" | "suspicious" | "danger",
  "flags": [{ "code": "string", "label": "string", "severity": "low"|"medium"|"high"|"critical", "description": "string", "evidence": "string" }],
  "entities": [{ "entity": "string", "type": "company"|"email_domain"|"github_repo"|"url"|"person"|"unknown" }],
  "recommendation": "string (ação clara para o usuário)",
  "summary": "string (resumo em linguagem simples)",
  "attackVector": "string (vetor de ataque se identificado)"
}`;

/**
 * Classifica uma mensagem usando Google Gemini 2.0 Flash (gratuito)
 */
const LANG_INSTRUCTION: Record<string, string> = {
  pt: "Responda todos os campos de texto (label, description, evidence, summary, recommendation, attackVector) em Português do Brasil.",
  en: "Answer all text fields (label, description, evidence, summary, recommendation, attackVector) in English.",
  es: "Responde todos los campos de texto (label, description, evidence, summary, recommendation, attackVector) en Español.",
};

export async function classifyWithNebius(
  message: string,
  researchContext?: string,
  lang: "pt" | "en" | "es" = "pt"
): Promise<Omit<RiskReport, "analyzedAt" | "processingMs">> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured — obtenha gratuitamente em aistudio.google.com");

  const langInstruction = LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.pt;

  // Append language instruction to system prompt so it overrides the PT bias
  // of the earlier sections — placing it only in the user prompt is insufficient
  // when the system prompt is long and entirely in Portuguese.
  const systemPromptWithLang = `${SYSTEM_PROMPT}\n\n${langInstruction}`;

  const userPrompt = researchContext
    ? `MENSAGEM PARA ANALISAR:\n${message}\n\nCONTEXTO DA PESQUISA (Linkup):\n${researchContext}`
    : `MENSAGEM PARA ANALISAR:\n${message}`;

  const messages: Message[] = [
    { role: "system", content: systemPromptWithLang },
    { role: "user", content: userPrompt },
  ];

  const startTime = Date.now();

  // Estratégia: tenta modelo primário → fallbacks em cascata
  // Só falha imediato em erro de autenticação (401/403)
  // 503/429 (sobrecarga) e 404 (modelo indisponível) → tenta próximo
  const ATTEMPTS = [
    { model: GEMINI_MODEL, delay: 0 },
    { model: "gemini-2.5-flash", delay: 1000 },
    { model: "gemini-2.0-flash", delay: 1000 },
    { model: "gemini-2.0-flash-lite", delay: 1000 },
  ];

  let response: Response | null = null;
  let lastError = "";
  let usedModel = GEMINI_MODEL;

  for (const { model, delay } of ATTEMPTS) {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));

    usedModel = model;
    response = await fetch(`${GEMINI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      }),
    });

    if (response.ok) break;

    // Erros de autenticação → falha imediata (não adianta tentar outros modelos)
    if (response.status === 401 || response.status === 403) {
      lastError = await response.text();
      throw new Error(`Gemini API auth error: ${response.status} — ${lastError}`);
    }

    // 503 (sobrecarga), 429 (rate limit), 404 (modelo indisponível) → tenta próximo
    lastError = await response.text();
    console.warn(`[${model}] ${response.status} — tentando próximo modelo...`);
  }

  if (!response || !response.ok) {
    throw new Error(`Gemini indisponível em todos os modelos: ${lastError}`);
  }

  const latencyMs = Date.now() - startTime;
  console.info(`[Elucya Shield] Análise concluída com modelo: ${usedModel} (${latencyMs}ms)`);

  const data: APIResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) throw new Error("Gemini returned empty response");

  // Parse seguro com tentativa de reparo se JSON vier truncado
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Tenta extrair o bloco JSON com regex (às vezes vem com texto extra)
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini retornou resposta não-JSON");
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      throw new Error(`JSON inválido na resposta Gemini: ${content.slice(0, 200)}`);
    }
  }

  // Registrar observabilidade
  await recordAgentRun({
    model: usedModel,
    provider: "nebius", // campo do schema — mantemos como provider genérico
    prompt_tokens: data.usage?.prompt_tokens || 0,
    completion_tokens: data.usage?.completion_tokens || 0,
    latency_ms: latencyMs,
    estimated_cost_usd: 0, // Gemini free tier
    success: true,
  });

  const pendingLabel: Record<string, string> = {
    pt: "Pesquisa pendente",
    en: "Research pending",
    es: "Investigación pendiente",
  };

  const entities = (parsed.entities || []).map(
    (e: { entity: string; type: string }) => ({
      entity: e.entity,
      type: e.type || "unknown",
      found: false,
      legitimacy: 50,
      redFlags: [],
      summary: pendingLabel[lang] || pendingLabel.pt,
    })
  );

  const flags: ScamFlag[] = (parsed.flags || []).map(
    (f: { code: string; label: string; severity: string; description: string; evidence?: string }) => ({
      code: f.code || "UNKNOWN",
      label: f.label || "Alerta",
      severity: (["low", "medium", "high", "critical"].includes(f.severity) ? f.severity : "medium") as ScamFlag["severity"],
      description: f.description || "",
      evidence: f.evidence,
    })
  );

  return {
    score: Math.min(100, Math.max(0, parsed.score || 0)),
    level: (["safe", "suspicious", "danger"].includes(parsed.level) ? parsed.level : "suspicious") as "safe" | "suspicious" | "danger",
    flags,
    entities,
    recommendation: parsed.recommendation || "Proceda com cautela.",
    summary: parsed.summary || "Análise concluída.",
    attackVector: parsed.attackVector,
  };
}
