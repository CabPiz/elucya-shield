/**
 * POST /api/analyze
 *
 * Pipeline principal do Elucya Shield:
 * 1. Valida input (Zod)
 * 2. Classifica com Nebius (APPLIED AI track)
 * 3. Se deep_research ativo: pesquisa entidades com Linkup (DEEP RESEARCH track)
 * 4. Reclassifica com contexto da pesquisa
 * 5. Retorna RiskReport completo
 */

import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequest, RiskReport } from "@/types";
import { classifyWithNebius } from "@/lib/nebius/classify";
import { researchCompany, researchEmailDomain, researchGitHubRepo } from "@/lib/linkup/client";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();

    // Validação com Zod
    const parsed = AnalyzeRequest.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Input inválido", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, context: messageContext, includeDeepResearch, lang } = parsed.data;

    // Sanitização básica: limitar tamanho do contexto enviado ao LLM
    const sanitizedMessage = message.slice(0, 8000);

    // ── Passo 1: Classificação inicial com Nebius ────────────────────────────
    let report = await classifyWithNebius(sanitizedMessage, undefined, lang);

    // ── Passo 2: Deep Research com Linkup (se habilitado) ───────────────────
    if (includeDeepResearch && report.entities.length > 0) {
      const researchResults = await Promise.allSettled(
        report.entities.map(async (entity) => {
          switch (entity.type) {
            case "company":
              return researchCompany(entity.entity);
            case "email_domain":
              return researchEmailDomain(entity.entity);
            case "github_repo":
              return researchGitHubRepo(entity.entity);
            default:
              return entity; // Retorna original para tipos não suportados ainda
          }
        })
      );

      // Atualizar entidades com resultado da pesquisa
      report.entities = researchResults.map((result, idx) => {
        if (result.status === "fulfilled") return result.value;
        console.error(`[Linkup] Research failed for entity ${idx}:`, result.reason);
        return report.entities[idx]; // Fallback para resultado original
      });

      // Construir contexto da pesquisa para reclassificação
      const researchContext = report.entities
        .map((e) => `${e.entity} (${e.type}): legitimidade ${e.legitimacy}/100. ${e.redFlags.join(", ")}`)
        .join("\n");

      // ── Passo 3: Reclassificação com contexto da pesquisa ─────────────────
      report = await classifyWithNebius(sanitizedMessage, researchContext, lang);

      // Restaurar entidades pesquisadas (a reclassificação substitui apenas o score/flags)
      report.entities = researchResults.map((result, idx) => {
        if (result.status === "fulfilled") return result.value;
        return report.entities[idx];
      });
    }

    // ── Passo 4: Montar RiskReport final ────────────────────────────────────
    const finalReport: RiskReport = {
      ...report,
      analyzedAt: new Date().toISOString(),
      processingMs: Date.now() - startTime,
    };

    // Validar output com Zod antes de retornar (guardrail)
    const validated = RiskReport.safeParse(finalReport);
    if (!validated.success) {
      console.error("[Guardrail] Output validation failed:", validated.error.flatten());
      return NextResponse.json(
        { error: "Erro interno na validação do relatório" },
        { status: 500 }
      );
    }

    return NextResponse.json(validated.data);
  } catch (err) {
    const error = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[/api/analyze] Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
