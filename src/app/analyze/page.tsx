"use client";

import { useState, useEffect, useRef } from "react";
import { usePlan } from "@/components/providers/revenuecat-provider";
import { PaywallModal } from "@/components/shield/paywall-modal";
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Search, FlaskConical, Globe, ExternalLink, Flag } from "lucide-react";
import type { RiskReport } from "@/types";
import Link from "next/link";

// ─── i18n ────────────────────────────────────────────────────────────────────

type Lang = "pt" | "en" | "es";

const T = {
  pt: {
    subtitle: "Análise de mensagem suspeita",
    channel: "Canal",
    deepResearch: "Pesquisa profunda (Linkup)",
    fillTest: "Preencher com caso de teste real",
    from: "De (remetente)",
    subject: "Assunto",
    emailBody: "Corpo do e-mail",
    suspiciousMsg: "Mensagem suspeita",
    emailPlaceholder: "Cole aqui o corpo do e-mail suspeito...",
    msgPlaceholder: "Cole aqui a mensagem ou oferta que você quer verificar...",
    analyze: "Analisar mensagem",
    analyzing: "Analisando...",
    researching: "Pesquisando e analisando...",
    recommendation: "Recomendação",
    flagsTitle: "Alertas detectados",
    entitiesTitle: "Entidades verificadas",
    pendingResearch: "Pesquisa pendente",
    vector: "Vetor",
    processedIn: "Análise concluída em",
    disclaimer:
      "Este relatório é gerado por IA e não substitui análise de segurança profissional. Use como suporte à decisão, não como conclusão definitiva.",
    levels: {
      safe: "Sem riscos identificados",
      suspicious: "Suspeito — verifique com atenção",
      danger: "PERIGO — não prossiga",
    },
    channels: { email: "E-mail", discord: "Discord", whatsapp: "WhatsApp", telegram: "Telegram", other: "Outro" },
    errorAnalysis: "Erro ao analisar mensagem",
    errorNetwork: "Falha na comunicação com o servidor",
    emailFromLabel: "De",
    emailSubjectLabel: "Assunto",
    linkupHint: "Para pesquisar as entidades, marque 'Pesquisa profunda (Linkup)' antes de analisar.",
    notSupportedByLinkup: "Tipo de entidade não analisado pelo Linkup.",
    certLabel: "Denunciar ao CERT.br",
    certUrl: "https://www.cert.br/reportar/",
    confirmScam: "Confirmar como golpe",
    confirmScamLoading: "Registrando...",
    confirmScamDone: (n: number) => `✓ Confirmado — você ajudou ${n} ${n === 1 ? "pessoa" : "pessoas"} a ficarem seguras`,
  },
  en: {
    subtitle: "Suspicious message analysis",
    channel: "Channel",
    deepResearch: "Deep research (Linkup)",
    fillTest: "Fill with real scam test case",
    from: "From (sender)",
    subject: "Subject",
    emailBody: "Email body",
    suspiciousMsg: "Suspicious message",
    emailPlaceholder: "Paste the suspicious email body here...",
    msgPlaceholder: "Paste the message or offer you want to verify here...",
    analyze: "Analyze message",
    analyzing: "Analyzing...",
    researching: "Researching and analyzing...",
    recommendation: "Recommendation",
    flagsTitle: "Detected alerts",
    entitiesTitle: "Verified entities",
    pendingResearch: "Research pending",
    vector: "Vector",
    processedIn: "Analysis completed in",
    disclaimer:
      "This report is AI-generated and does not replace professional security analysis. Use it as decision support, not as a definitive conclusion.",
    levels: {
      safe: "No risks identified",
      suspicious: "Suspicious — verify carefully",
      danger: "DANGER — do not proceed",
    },
    channels: { email: "Email", discord: "Discord", whatsapp: "WhatsApp", telegram: "Telegram", other: "Other" },
    errorAnalysis: "Error analyzing message",
    errorNetwork: "Server communication failure",
    emailFromLabel: "From",
    emailSubjectLabel: "Subject",
    linkupHint: "To research entities, check 'Deep research (Linkup)' before analyzing.",
    notSupportedByLinkup: "Entity type not analyzed by Linkup.",
    certLabel: "Report to FBI IC3",
    certUrl: "https://www.ic3.gov/",
    confirmScam: "Confirm as scam",
    confirmScamLoading: "Submitting...",
    confirmScamDone: (n: number) => `✓ Confirmed — you helped ${n} ${n === 1 ? "person" : "people"} stay safe`,
  },
  es: {
    subtitle: "Análisis de mensaje sospechoso",
    channel: "Canal",
    deepResearch: "Investigación profunda (Linkup)",
    fillTest: "Rellenar con caso de prueba real",
    from: "De (remitente)",
    subject: "Asunto",
    emailBody: "Cuerpo del correo",
    suspiciousMsg: "Mensaje sospechoso",
    emailPlaceholder: "Pega aquí el cuerpo del correo sospechoso...",
    msgPlaceholder: "Pega aquí el mensaje u oferta que quieres verificar...",
    analyze: "Analizar mensaje",
    analyzing: "Analizando...",
    researching: "Investigando y analizando...",
    recommendation: "Recomendación",
    flagsTitle: "Alertas detectadas",
    entitiesTitle: "Entidades verificadas",
    pendingResearch: "Investigación pendiente",
    vector: "Vector",
    processedIn: "Análisis completado en",
    disclaimer:
      "Este informe es generado por IA y no reemplaza el análisis de seguridad profesional. Úselo como apoyo a la decisión, no como conclusión definitiva.",
    levels: {
      safe: "Sin riesgos identificados",
      suspicious: "Sospechoso — verifique con atención",
      danger: "PELIGRO — no proceda",
    },
    channels: { email: "Correo", discord: "Discord", whatsapp: "WhatsApp", telegram: "Telegram", other: "Otro" },
    errorAnalysis: "Error al analizar el mensaje",
    errorNetwork: "Error de comunicación con el servidor",
    emailFromLabel: "De",
    emailSubjectLabel: "Asunto",
    linkupHint: "Para investigar las entidades, marque 'Investigación profunda (Linkup)' antes de analizar.",
    notSupportedByLinkup: "Tipo de entidad no analizado por Linkup.",
    certLabel: "Reportar a Interpol",
    certUrl: "https://www.interpol.int/es/Delitos/Ciberdelincuencia",
    confirmScam: "Confirmar como estafa",
    confirmScamLoading: "Registrando...",
    confirmScamDone: (n: number) => `✓ Confirmado — ayudaste a ${n} ${n === 1 ? "persona" : "personas"} a estar seguras`,
  },
} as const;

// ─── Test case ────────────────────────────────────────────────────────────────

const TEST_CASE = {
  context: "email" as const,
  emailFrom: "contact@metaspaceschain.com",
  emailSubject: "Exciting Career Opportunity at MetaSpace — Senior Blockchain Developer",
  message: `Dear Developer,

I hope this message finds you well. My name is Jessica Lee, and I am the Talent Acquisition Lead at MetaSpace, a rapidly growing blockchain gaming company headquartered in Dubai, UAE, licensed under RAK-DAO. We are partners with leading blockchain projects, including Binance, OKX, and Animoca Brands.

We came across your impressive portfolio and believe you would be an excellent fit for our Senior Blockchain Developer position.

Compensation package: $8,000–$12,000/month USD, plus equity and a $2,000 signing bonus paid in USDT.

We have only 2 positions remaining and are closing applications by end of this week.

To apply, please fill out our candidate form: https://docs.google.com/forms/d/1xYZ-metaspace-candidate-form

If selected, the next step is a short technical assessment where you'll clone our private repository and run a local environment to showcase your skills.

Looking forward to hearing from you!

Best regards,
Jessica Lee
Talent Acquisition | MetaSpace
contact@metaspaceschain.com
https://metaspaceschain.com`,
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTEXT_OPTIONS = ["email", "discord", "whatsapp", "telegram", "other"] as const;
type MessageContext = (typeof CONTEXT_OPTIONS)[number];

const getLevelConfig = (t: (typeof T)[Lang]) => ({
  safe: {
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    icon: <CheckCircle className="w-6 h-6 text-green-400" />,
    label: t.levels.safe,
  },
  suspicious: {
    color: "text-yellow-300",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    icon: <AlertTriangle className="w-6 h-6 text-yellow-300" />,
    label: t.levels.suspicious,
  },
  danger: {
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    icon: <XCircle className="w-6 h-6 text-red-400" />,
    label: t.levels.danger,
  },
});

const SEVERITY_COLORS = {
  low: "bg-zinc-600 text-zinc-100",
  medium: "bg-yellow-500/30 text-yellow-200",
  high: "bg-orange-500/30 text-orange-200",
  critical: "bg-red-500/30 text-red-200",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];
  const { plan } = usePlan();
  const [showPaywall, setShowPaywall] = useState(false);

  const [message, setMessage] = useState("");
  const [context, setContext] = useState<MessageContext>("email");
  const [emailFrom, setEmailFrom] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [deepResearch, setDeepResearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<RiskReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<"idle" | "loading" | "confirmed">("idle");
  const [similarCount, setSimilarCount] = useState<number>(0);
  const isConfirming = useRef(false);

  // Sync language with home page preference stored in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("elucya_lang") as Lang | null;
      if (stored && (["en", "pt", "es"] as Lang[]).includes(stored)) setLang(stored);
    } catch {
      // localStorage unavailable — keep default
    }
  }, []);

  // Reset analysis whenever the user switches language
  useEffect(() => {
    setReport(null);
    setError(null);
    setConfirmState("idle");
    setSimilarCount(0);
    isConfirming.current = false;
  }, [lang]);

  function fillTestCase() {
    setContext(TEST_CASE.context);
    setEmailFrom(TEST_CASE.emailFrom);
    setEmailSubject(TEST_CASE.emailSubject);
    setMessage(TEST_CASE.message);
    setReport(null);
    setError(null);
  }

  async function handleAnalyze() {
    if (!message.trim() || message.length < 10) return;

    setLoading(true);
    setReport(null);
    setError(null);
    setConfirmState("idle");
    setSimilarCount(0);
    isConfirming.current = false;

    let fullMessage = message;
    if (context === "email") {
      const prefix: string[] = [];
      if (emailFrom.trim()) prefix.push(`${t.emailFromLabel}: ${emailFrom.trim()}`);
      if (emailSubject.trim()) prefix.push(`${t.emailSubjectLabel}: ${emailSubject.trim()}`);
      if (prefix.length > 0) fullMessage = prefix.join("\n") + "\n\n" + message;
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: fullMessage, context, includeDeepResearch: deepResearch, lang }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.errorAnalysis);
        return;
      }
      setReport(data as RiskReport);
    } catch {
      setError(t.errorNetwork);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmScam() {
    if (!report || confirmState !== "idle" || isConfirming.current) return;
    isConfirming.current = true;
    setConfirmState("loading");

    const entityDomains = report.entities
      .filter((e) => e.type === "email_domain" || e.type === "company")
      .map((e) => e.entity);

    try {
      const res = await fetch("/api/confirm-scam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: report.score,
          level: report.level,
          attackVector: report.attackVector,
          entityDomains,
          entityCount: report.entities.length,
          flagsCount: report.flags.length,
          lang,
          channel: context,
          analyzedAt: report.analyzedAt,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSimilarCount(data.similarCount ?? 0);
        setConfirmState("confirmed");
        isConfirming.current = false;
      } else {
        setConfirmState("idle");
        isConfirming.current = false;
      }
    } catch {
      setConfirmState("idle");
      isConfirming.current = false;
    }
  }

  const levelConfig = report ? getLevelConfig(t)[report.level] : null;
  const gaugeOffset = report ? 251 - (report.score / 100) * 251 : 251;

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            <Shield className="w-8 h-8" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Elucya Shield</h1>
            <p className="text-zinc-400 text-sm">{t.subtitle}</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg p-1">
          <Globe className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          {(["en", "pt", "es"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLang(l);
                try { localStorage.setItem("elucya_lang", l); } catch { /* ignore */ }
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors uppercase ${
                lang === l
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="space-y-4 mb-6">
        {/* Channel + deep research + test case */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">{t.channel}</label>
            <select
              value={context}
              onChange={(e) => {
                setContext(e.target.value as MessageContext);
                setEmailFrom("");
                setEmailSubject("");
              }}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {CONTEXT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t.channels[opt]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pb-0.5">
            <input
              type="checkbox"
              checked={deepResearch}
              onChange={(e) => {
                if (e.target.checked && !plan?.entitlements.includes("deep_research")) {
                  setShowPaywall(true);
                } else {
                  setDeepResearch(e.target.checked);
                }
              }}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-zinc-300 flex items-center gap-1">
              <Search className="w-3 h-3" />
              {t.deepResearch}
            </span>
          </label>

          <button
            onClick={fillTestCase}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-xs text-zinc-200 transition-colors"
            title={t.fillTest}
          >
            <FlaskConical className="w-3.5 h-3.5 text-zinc-300" />
            {t.fillTest}
          </button>
        </div>

        {/* Email-specific fields */}
        {context === "email" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t.from}</label>
              <input
                type="text"
                value={emailFrom}
                onChange={(e) => setEmailFrom(e.target.value)}
                placeholder="ex: contact@metaspaceschain.com"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t.subject}</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="ex: Job Opportunity - Senior Developer"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>
          </div>
        )}

        {/* Message body */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            {context === "email" ? t.emailBody : t.suspiciousMsg}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={context === "email" ? t.emailPlaceholder : t.msgPlaceholder}
            className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-blue-500 transition-colors text-sm"
            maxLength={10000}
          />
          <span className="text-xs text-zinc-500 mt-1 block">{message.length}/10000</span>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || message.length < 10}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {deepResearch ? t.researching : t.analyzing}
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              {t.analyze}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Report */}
      {report && levelConfig && (
        <div className="space-y-4">
          {/* Score card */}
          <div className={`p-6 border rounded-xl ${levelConfig.bg}`}>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <svg width="80" height="80" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle
                    cx="45" cy="45" r="40" fill="none"
                    stroke={report.level === "danger" ? "#ef4444" : report.level === "suspicious" ? "#f59e0b" : "#22c55e"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="251"
                    strokeDashoffset={gaugeOffset}
                    transform="rotate(-90 45 45)"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                  <text x="45" y="50" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                    {report.score}
                  </text>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {levelConfig.icon}
                  <span className={`font-bold text-lg ${levelConfig.color}`}>{levelConfig.label}</span>
                </div>
                <p className="text-zinc-200 text-sm">{report.summary}</p>
                {report.attackVector && (
                  <p className="text-zinc-400 text-xs mt-1">{t.vector}: {report.attackVector}</p>
                )}
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-xl">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{t.recommendation}</p>
            <p className="text-white">{report.recommendation}</p>
          </div>

          {/* Flags */}
          {report.flags.length > 0 && (
            <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-xl">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                {t.flagsTitle} ({report.flags.length})
              </p>
              <div className="space-y-3">
                {report.flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold flex-shrink-0 mt-0.5 ${SEVERITY_COLORS[flag.severity]}`}>
                      {flag.severity.toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{flag.label}</p>
                      <p className="text-xs text-zinc-300 mt-0.5">{flag.description}</p>
                      {flag.evidence && (
                        <p className="text-xs text-zinc-400 mt-1 italic">&ldquo;{flag.evidence}&rdquo;</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entities */}
          {report.entities.length > 0 && (
            <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-xl">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                {t.entitiesTitle} ({report.entities.length})
              </p>
              {!deepResearch && (
                <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1">
                  <Search className="w-3 h-3 shrink-0" />
                  {t.linkupHint}
                </p>
              )}
              <div className="space-y-3">
                {report.entities.map((entity, i) => (
                  <div key={i} className="border border-zinc-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{entity.entity}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">{entity.type}</span>
                        <span className={`text-xs font-bold ${
                          entity.legitimacy >= 60 ? "text-green-400" :
                          entity.legitimacy >= 30 ? "text-yellow-300" : "text-red-400"
                        }`}>
                          {entity.legitimacy}/100
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300">
                      {/pendente|pending|pendiente/i.test(entity.summary ?? "")
                        ? deepResearch
                          ? t.notSupportedByLinkup
                          : t.linkupHint
                        : entity.summary}
                    </p>
                    {entity.redFlags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entity.redFlags.map((flag, j) => (
                          <span key={j} className="text-xs bg-red-500/15 text-red-300 px-2 py-0.5 rounded">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions: CERT report + Confirm scam */}
          {report.level !== "safe" && (
            <div className="flex flex-wrap items-center gap-3">
              {/* CERT agency button */}
              <a
                href={t.certUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-sm text-zinc-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                {t.certLabel}
              </a>

              {/* Confirm scam button */}
              {confirmState === "confirmed" ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-300">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {t.confirmScamDone(similarCount)}
                </div>
              ) : (
                <button
                  onClick={handleConfirmScam}
                  disabled={confirmState === "loading"}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {confirmState === "loading" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  ) : (
                    <Flag className="w-3.5 h-3.5 shrink-0" />
                  )}
                  {confirmState === "loading" ? t.confirmScamLoading : t.confirmScam}
                </button>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="text-xs text-zinc-500 text-center">
            {t.processedIn} {report.processingMs}ms · {new Date(report.analyzedAt).toLocaleString("pt-BR")}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
        <p className="text-xs text-zinc-400 text-center">{t.disclaimer}</p>
      </div>

      {/* Paywall modal */}
      {showPaywall && (
        <PaywallModal
          lang={lang}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </main>
  );
}
