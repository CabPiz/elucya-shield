import { z } from "zod";

// ─── Risk Levels ─────────────────────────────────────────────────────────────

export const RiskLevel = z.enum(["safe", "suspicious", "danger"]);
export type RiskLevel = z.infer<typeof RiskLevel>;

// ─── Entity Research (via Linkup) ────────────────────────────────────────────

export const EntityResearch = z.object({
  entity: z.string(),
  type: z.enum(["company", "email_domain", "github_repo", "url", "person", "unknown"]),
  found: z.boolean(),
  legitimacy: z.number().min(0).max(100).describe("0=definitely fake, 100=definitely legit"),
  redFlags: z.array(z.string()),
  summary: z.string(),
  sources: z.array(z.string().url()).optional(),
});
export type EntityResearch = z.infer<typeof EntityResearch>;

// ─── Scam Flags ──────────────────────────────────────────────────────────────

export const ScamFlag = z.object({
  code: z.string(),
  label: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string(),
  evidence: z.string().optional(),
});
export type ScamFlag = z.infer<typeof ScamFlag>;

// ─── Risk Report (output do pipeline) ────────────────────────────────────────

export const RiskReport = z.object({
  score: z.number().min(0).max(100).describe("Risk score: 0=safe, 100=extreme danger"),
  level: RiskLevel,
  flags: z.array(ScamFlag),
  entities: z.array(EntityResearch),
  recommendation: z.string().describe("Clear action recommendation for the user"),
  summary: z.string().describe("Plain-language summary of findings"),
  attackVector: z.string().optional().describe("The likely attack method if identified"),
  analyzedAt: z.string().datetime(),
  processingMs: z.number().optional(),
});
export type RiskReport = z.infer<typeof RiskReport>;

// ─── Analysis Request ─────────────────────────────────────────────────────────

export const AnalyzeRequest = z.object({
  message: z.string().min(10).max(10000),
  context: z.enum(["email", "discord", "whatsapp", "telegram", "other"]).optional(),
  includeDeepResearch: z.boolean().default(false),
  lang: z.enum(["pt", "en", "es"]).default("pt"),
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequest>;

// ─── Agent Run (observabilidade) ─────────────────────────────────────────────

export const AgentRun = z.object({
  id: z.string().uuid().optional(),
  model: z.string(),
  provider: z.enum(["nebius", "anthropic"]),
  prompt_tokens: z.number().int(),
  completion_tokens: z.number().int(),
  latency_ms: z.number(),
  estimated_cost_usd: z.number(),
  success: z.boolean(),
  error: z.string().optional(),
  created_at: z.string().datetime().optional(),
});
export type AgentRun = z.infer<typeof AgentRun>;

// ─── RevenueCat Entitlements ──────────────────────────────────────────────────

export type Entitlement = "basic_analysis" | "deep_research" | "unlimited";

export interface UserPlan {
  plan: "free" | "shield" | "pro";
  entitlements: Entitlement[];
  analysesRemaining: number | "unlimited";
}
