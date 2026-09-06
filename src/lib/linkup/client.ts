/**
 * Linkup SDK wrapper — Track: DEEP RESEARCH
 *
 * Linkup realiza pesquisa profunda na web para verificar entidades mencionadas
 * em mensagens suspeitas: empresas, domínios, repositórios GitHub, etc.
 */

import type { EntityResearch } from "@/types";

// TODO: import { LinkupClient } from "linkup-sdk" quando a instalação estiver completa
// Por ora, tipagem manual

interface LinkupSearchResult {
  results: Array<{
    title: string;
    url: string;
    content: string;
  }>;
}

interface LinkupClient {
  search(params: { query: string; depth?: "standard" | "deep" }): Promise<LinkupSearchResult>;
}

function getLinkupClient(): LinkupClient {
  const apiKey = process.env.LINKUP_API_KEY;
  if (!apiKey) throw new Error("LINKUP_API_KEY not configured");

  // Lazy import para evitar erro em build sem a key
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { LinkupClient } = require("linkup-sdk");
  return new LinkupClient({ apiKey });
}

/**
 * Pesquisa uma empresa suspeita na web via Linkup
 */
export async function researchCompany(companyName: string): Promise<EntityResearch> {
  const client = getLinkupClient();

  const result = await client.search({
    query: `"${companyName}" site:reddit.com OR site:glassdoor.com OR "scam" OR "fraud" OR "fake" company review`,
    depth: "deep",
  });

  const redFlags: string[] = [];
  const content = result.results.map((r) => r.content).join(" ").toLowerCase();

  if (content.includes("scam") || content.includes("fraude")) redFlags.push("Mencionado em relatos de golpe");
  if (content.includes("fake") || content.includes("falso")) redFlags.push("Suspeita de empresa falsa");
  if (result.results.length === 0) redFlags.push("Nenhuma informação encontrada online");

  const legitimacy = redFlags.length === 0 ? 70 : Math.max(0, 50 - redFlags.length * 20);

  return {
    entity: companyName,
    type: "company",
    found: result.results.length > 0,
    legitimacy,
    redFlags,
    summary: result.results[0]?.content?.slice(0, 300) || "Sem informações encontradas",
    sources: result.results.slice(0, 3).map((r) => r.url).filter(Boolean) as string[],
  };
}

/**
 * Pesquisa um domínio de e-mail suspeito
 */
export async function researchEmailDomain(domain: string): Promise<EntityResearch> {
  const client = getLinkupClient();

  const result = await client.search({
    query: `"${domain}" email domain scam phishing fraud report`,
    depth: "standard",
  });

  const redFlags: string[] = [];
  const content = result.results.map((r) => r.content).join(" ").toLowerCase();

  if (content.includes("phishing")) redFlags.push("Domínio associado a phishing");
  if (content.includes("scam")) redFlags.push("Domínio em lista de golpistas");
  if (result.results.length === 0) redFlags.push("Domínio sem histórico verificável");

  // Domínios legítimos de empresas grandes raramente aparecem em buscas de scam
  const isLikelyLegit = result.results.every(
    (r) => !r.content.toLowerCase().includes("scam") && !r.content.toLowerCase().includes("phishing")
  );

  return {
    entity: domain,
    type: "email_domain",
    found: result.results.length > 0,
    legitimacy: isLikelyLegit ? 80 : Math.max(0, 40 - redFlags.length * 20),
    redFlags,
    summary: redFlags.length > 0 ? `Domínio com ${redFlags.length} alerta(s)` : "Domínio sem alertas detectados",
    sources: result.results.slice(0, 3).map((r) => r.url).filter(Boolean) as string[],
  };
}

/**
 * Pesquisa um repositório GitHub suspeito
 */
export async function researchGitHubRepo(repoUrl: string): Promise<EntityResearch> {
  const client = getLinkupClient();

  const result = await client.search({
    query: `site:github.com "${repoUrl}" OR "${repoUrl}" malware crypto stealer wallet`,
    depth: "deep",
  });

  const redFlags: string[] = [];
  const content = result.results.map((r) => r.content).join(" ").toLowerCase();

  if (content.includes("stealer")) redFlags.push("Repositório associado a malware stealer");
  if (content.includes("wallet") && content.includes("private key")) redFlags.push("Código acessa chaves privadas de wallet");
  if (content.includes("malware")) redFlags.push("Identificado como malware");

  return {
    entity: repoUrl,
    type: "github_repo",
    found: result.results.length > 0,
    legitimacy: redFlags.length > 0 ? 5 : 60,
    redFlags,
    summary: redFlags.length > 0
      ? `⚠️ PERIGO: Repositório com ${redFlags.length} flag(s) crítica(s)`
      : "Repositório sem alertas detectados na pesquisa",
    sources: result.results.slice(0, 3).map((r) => r.url).filter(Boolean) as string[],
  };
}
