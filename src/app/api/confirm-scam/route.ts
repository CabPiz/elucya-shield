/**
 * POST /api/confirm-scam
 *
 * Registra uma confirmação de golpe na tabela scam_reports e retorna
 * quantos relatórios similares existem (mesmo domínio ou vetor de ataque).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

const ConfirmScamRequest = z.object({
  score: z.number().int().min(0).max(100),
  level: z.enum(["safe", "suspicious", "danger"]),
  attackVector: z.string().optional(),
  entityDomains: z.array(z.string()).default([]),
  entityCount: z.number().int().default(0),
  flagsCount: z.number().int().default(0),
  lang: z.enum(["pt", "en", "es"]).default("pt"),
  channel: z.string().optional(),
  analyzedAt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ConfirmScamRequest.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Input inválido", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      score,
      level,
      attackVector,
      entityDomains,
      entityCount,
      flagsCount,
      lang,
      channel,
      analyzedAt,
    } = parsed.data;

    // ── Inserir confirmação ──────────────────────────────────────────────────
    const { error: insertError } = await supabaseAdmin
      .from("scam_reports")
      .insert({
        score,
        level,
        attack_vector: attackVector ?? null,
        entity_domains: entityDomains,
        entity_count: entityCount,
        flags_count: flagsCount,
        lang,
        channel: channel ?? null,
        analyzed_at: analyzedAt ?? null,
      });

    if (insertError) {
      console.error("[confirm-scam] Insert error:", insertError.message);
      return NextResponse.json({ error: "Erro ao registrar confirmação" }, { status: 500 });
    }

    // ── Contar relatórios similares (mesmo domínio OU mesmo vetor) ───────────
    let similarCount = 0;

    if (entityDomains.length > 0) {
      // Busca relatórios que compartilham ao menos um dos domínios (GIN index)
      const { count, error: countError } = await supabaseAdmin
        .from("scam_reports")
        .select("*", { count: "exact", head: true })
        .overlaps("entity_domains", entityDomains);

      if (!countError && count !== null) {
        similarCount = count;
      }
    } else if (attackVector) {
      // Fallback: mesmo vetor de ataque
      const { count, error: countError } = await supabaseAdmin
        .from("scam_reports")
        .select("*", { count: "exact", head: true })
        .eq("attack_vector", attackVector);

      if (!countError && count !== null) {
        similarCount = count;
      }
    } else {
      // Total de relatórios do mesmo nível como fallback
      const { count, error: countError } = await supabaseAdmin
        .from("scam_reports")
        .select("*", { count: "exact", head: true })
        .eq("level", level);

      if (!countError && count !== null) {
        similarCount = count;
      }
    }

    return NextResponse.json({ success: true, similarCount });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[/api/confirm-scam] Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
