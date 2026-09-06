-- Elucya Shield — Schema inicial
-- Migration: 001_initial.sql

-- ── agent_runs: observabilidade de chamadas a LLM ──────────────────────────
CREATE TABLE IF NOT EXISTS agent_runs (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  model           text NOT NULL,
  provider        text NOT NULL CHECK (provider IN ('nebius', 'anthropic')),
  prompt_tokens   integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  latency_ms      integer NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(10, 8) NOT NULL DEFAULT 0,
  success         boolean NOT NULL DEFAULT true,
  error           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── analyses: histórico de análises (para V2 com autenticação) ─────────────
CREATE TABLE IF NOT EXISTS analyses (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id      text,             -- identificador anônimo de sessão
  user_id         uuid,             -- null no MVP (sem auth)
  message_hash    text NOT NULL,    -- SHA256 da mensagem (privacidade)
  message_context text CHECK (message_context IN ('email','discord','whatsapp','telegram','other')),
  score           integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  level           text NOT NULL CHECK (level IN ('safe','suspicious','danger')),
  flags_count     integer NOT NULL DEFAULT 0,
  entities_count  integer NOT NULL DEFAULT 0,
  deep_research   boolean NOT NULL DEFAULT false,
  processing_ms   integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Índices ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON agent_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_provider ON agent_runs(provider);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_level ON analyses(level);

-- ── RLS: agent_runs e analyses são privadas (service role only) ────────────
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Nenhum acesso público — apenas service role pode inserir/ler
CREATE POLICY "Service role only" ON agent_runs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role only" ON analyses
  FOR ALL TO service_role USING (true) WITH CHECK (true);
