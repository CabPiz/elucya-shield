/**
 * Linkup SDK wrapper — Track: DEEP RESEARCH
 *
 * Linkup realiza pesquisa profunda na web para verificar entidades mencionadas
 * em mensagens suspeitas: empresas, domínios, repositórios GitHub, etc.
 */

import type { EntityResearch } from "@/types";

type Lang = "pt" | "en" | "es";

// ─── Localized red flag strings ───────────────────────────────────────────────

const RF = {
  company: {
    pt: {
      scam: "Mencionado em relatos de golpe",
      fake: "Suspeita de empresa falsa",
      noInfo: "Nenhuma informação encontrada online",
    },
    en: {
      scam: "Mentioned in scam reports",
      fake: "Suspected fake company",
      noInfo: "No information found online",
    },
    es: {
      scam: "Mencionado en reportes de estafa",
      fake: "Sospecha de empresa falsa",
      noInfo: "Sin información encontrada en línea",
    },
  },
  emailDomain: {
    pt: {
      phishing: "Domínio associado a phishing",
      scam: "Domínio em lista de golpistas",
      noHistory: "Domínio sem histórico verificável",
      alerts: (n: number) => `Domínio com ${n} alerta(s)`,
      clean: "Domínio sem alertas detectados",
    },
    en: {
      phishing: "Domain associated with phishing",
      scam: "Domain on scammer lists",
      noHistory: "Domain with no verifiable history",
      alerts: (n: number) => `Domain with ${n} alert(s)`,
      clean: "No alerts detected for this domain",
    },
    es: {
      phishing: "Dominio asociado a phishing",
      scam: "Dominio en lista de estafadores",
      noHistory: "Dominio sin historial verificable",
      alerts: (n: number) => `Dominio con ${n} alerta(s)`,
      clean: "Sin alertas detectadas para este dominio",
    },
  },
  github: {
    pt: {
      stealer: "Repositório associado a malware stealer",
      privateKey: "Código acessa chaves privadas de wallet",
      malware: "Identificado como malware",
      danger: (n: number) => `⚠️ PERIGO: Repositório com ${n} flag(s) crítica(s)`,
      clean: "Repositório sem alertas detectados na pesquisa",
    },
    en: {
      stealer: "Repository associated with stealer malware",
      privateKey: "Code accesses wallet private keys",
      malware: "Identified as malware",
      danger: (n: number) => `⚠️ DANGER: Repository with ${n} critical flag(s)`,
      clean: "No alerts detected for this repository",
    },
    es: {
      stealer: "Repositorio asociado a malware stealer",
      privateKey: "El código accede a claves privadas de wallets",
      malware: "Identificado como malware",
      danger: (n: number) => `⚠️ PELIGRO: Repositorio con ${n} flag(s) crítica(s)`,
      clean: "Sin alertas detectadas para este repositorio",
    },
  },
} as const;

// ─── SDK setup ────────────────────────────────────────────────────────────────

interface LinkupSource {
  name?: string;
  url: string;
  snippet?: string;
  content?: string;
}

interface LinkupSourcedAnswer {
  answer: string;
  sources: LinkupSource[];
}

interface LinkupSearchResults {
  results: Array<{
    name?: string;
    title?: string;
    url: string;
    content: string;
  }>;
}

type LinkupSearchResult = LinkupSourcedAnswer | LinkupSearchResults;

interface LinkupClient {
  search(params: {
    query: string;
    depth?: "standard" | "deep";
    outputType: "searchResults" | "sourcedAnswer";
  }): Promise<LinkupSearchResult>;
}

function getLinkupClient(): LinkupClient {
  const apiKey = process.env.LINKUP_API_KEY;
  if (!apiKey) throw new Error("LINKUP_API_KEY not configured");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { LinkupClient } = require("linkup-sdk");
  return new LinkupClient({ apiKey });
}

/** Extrai texto e URLs de qualquer formato de resposta Linkup */
function extractFromResult(result: LinkupSearchResult): {
  content: string;
  sources: string[];
  found: boolean;
  firstText: string;
} {
  if ("answer" in result) {
    const sources = (result.sources || []).map((s) => s.url).filter(Boolean) as string[];
    const snippets = (result.sources || []).map((s) => s.snippet || s.content || "").join(" ");
    return {
      content: (result.answer + " " + snippets).toLowerCase(),
      sources: sources.slice(0, 3),
      found: !!(result.answer || sources.length > 0),
      firstText: result.answer?.slice(0, 300) || "",
    };
  }
  if ("results" in result) {
    const sources = result.results.slice(0, 3).map((r) => r.url).filter(Boolean) as string[];
    const content = result.results.map((r) => r.content).join(" ").toLowerCase();
    return {
      content,
      sources,
      found: result.results.length > 0,
      firstText: result.results[0]?.content?.slice(0, 300) || "",
    };
  }
  return { content: "", sources: [], found: false, firstText: "" };
}

// ─── Public research functions ────────────────────────────────────────────────

export async function researchCompany(companyName: string, lang: Lang = "en"): Promise<EntityResearch> {
  const client = getLinkupClient();
  const rf = RF.company[lang];

  const result = await client.search({
    query: `"${companyName}" site:reddit.com OR site:glassdoor.com OR "scam" OR "fraud" OR "fake" company review`,
    depth: "deep",
    outputType: "sourcedAnswer",
  });

  const { content, sources, found, firstText } = extractFromResult(result);
  const redFlags: string[] = [];

  if (content.includes("scam") || content.includes("fraude")) redFlags.push(rf.scam);
  if (content.includes("fake") || content.includes("falso")) redFlags.push(rf.fake);
  if (!found) redFlags.push(rf.noInfo);

  const legitimacy = redFlags.length === 0 ? 70 : Math.max(0, 50 - redFlags.length * 20);

  return {
    entity: companyName,
    type: "company",
    found,
    legitimacy,
    redFlags,
    summary: firstText || rf.noInfo,
    sources,
  };
}

export async function researchEmailDomain(domain: string, lang: Lang = "en"): Promise<EntityResearch> {
  const client = getLinkupClient();
  const rf = RF.emailDomain[lang];

  const result = await client.search({
    query: `"${domain}" email domain scam phishing fraud report`,
    depth: "standard",
    outputType: "sourcedAnswer",
  });

  const { content, sources, found } = extractFromResult(result);
  const redFlags: string[] = [];

  if (content.includes("phishing")) redFlags.push(rf.phishing);
  if (content.includes("scam")) redFlags.push(rf.scam);
  if (!found) redFlags.push(rf.noHistory);

  const isLikelyLegit = !content.includes("scam") && !content.includes("phishing");

  return {
    entity: domain,
    type: "email_domain",
    found,
    legitimacy: isLikelyLegit ? 80 : Math.max(0, 40 - redFlags.length * 20),
    redFlags,
    summary: redFlags.length > 0 ? rf.alerts(redFlags.length) : rf.clean,
    sources,
  };
}

export async function researchGitHubRepo(repoUrl: string, lang: Lang = "en"): Promise<EntityResearch> {
  const client = getLinkupClient();
  const rf = RF.github[lang];

  const result = await client.search({
    query: `site:github.com "${repoUrl}" OR "${repoUrl}" malware crypto stealer wallet`,
    depth: "deep",
    outputType: "sourcedAnswer",
  });

  const { content, sources, found } = extractFromResult(result);
  const redFlags: string[] = [];

  if (content.includes("stealer")) redFlags.push(rf.stealer);
  if (content.includes("wallet") && content.includes("private key")) redFlags.push(rf.privateKey);
  if (content.includes("malware")) redFlags.push(rf.malware);

  return {
    entity: repoUrl,
    type: "github_repo",
    found,
    legitimacy: redFlags.length > 0 ? 5 : 60,
    redFlags,
    summary: redFlags.length > 0 ? rf.danger(redFlags.length) : rf.clean,
    sources,
  };
}
