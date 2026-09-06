import { createClient } from "@supabase/supabase-js";
import type { AgentRun } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

/**
 * Registra uma chamada a LLM na tabela agent_runs (observabilidade AI-First)
 */
export async function recordAgentRun(run: Omit<AgentRun, "id" | "created_at">) {
  const { error } = await supabaseAdmin.from("agent_runs").insert({
    ...run,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[agent_runs] Failed to record run:", error.message);
  }
}
