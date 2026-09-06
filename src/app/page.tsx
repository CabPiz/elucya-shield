"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, Search, Zap } from "lucide-react";

type Lang = "en" | "pt" | "es";

const T = {
  en: {
    subtitle: "Detect digital scams before you act",
    description:
      "Paste any suspicious message — fake job offer, financial proposal, unknown link — and get a complete dossier in seconds with a risk score, danger flags, and clear recommendations.",
    cta: "Analyze message now",
    ctaNote: "Free · 3 analyses per month · No registration",
    f1Title: "Smart Detection",
    f1Desc:
      "AI analyzes scam patterns: fake job offers, phishing, social engineering, malicious repositories, and crypto theft.",
    f2Title: "Deep Research",
    f2Desc:
      "Verifies company, email domain, and GitHub repository in real time. You see the evidence, not just the score.",
    f3Title: "Results in Seconds",
    f3Desc:
      "Fast analysis powered by AI. Full dossier with Linkup. Make decisions with information, not panic.",
    quote:
      "I almost fell for an email scam — a fake job offer that would have made me run malicious code to steal my crypto wallet. I built Elucya Shield so no developer has to go through the same scare.",
    quoteAuthor: "— César Brito, founder of Kairos Labs",
    footer: "Elucya Shield · Kairos Labs · Hackathon Burning Token 2026",
  },
  pt: {
    subtitle: "Detecte golpes digitais antes de agir",
    description:
      "Cole qualquer mensagem suspeita — e-mail de vaga de emprego, oferta financeira, link desconhecido — e receba em segundos um dossier completo com score de risco, flags de perigo e recomendações claras.",
    cta: "Analisar mensagem agora",
    ctaNote: "Grátis · 3 análises por mês · Sem cadastro",
    f1Title: "Detecção Inteligente",
    f1Desc:
      "IA analisa padrões de golpe: falsas vagas, phishing, engenharia social, repositórios maliciosos e roubo de cripto.",
    f2Title: "Pesquisa Profunda",
    f2Desc:
      "Verifica empresa, domínio de e-mail e repositório GitHub em tempo real. Você vê as evidências, não apenas o score.",
    f3Title: "Resultado em Segundos",
    f3Desc:
      "Análise rápida com IA. Dossier completo com Linkup. Decida com informação, não com pânico.",
    quote:
      "Quase caí num golpe por e-mail — uma vaga de emprego que me faria rodar código malicioso para roubar minha wallet de cripto. Criei o Elucya Shield para que nenhum programador passe pelo mesmo susto.",
    quoteAuthor: "— César Brito, fundador da Kairos Labs",
    footer: "Elucya Shield · Kairos Labs · Hackathon Burning Token 2026",
  },
  es: {
    subtitle: "Detecta estafas digitales antes de actuar",
    description:
      "Pega cualquier mensaje sospechoso — oferta de trabajo falsa, propuesta financiera, enlace desconocido — y recibe en segundos un dossier completo con puntaje de riesgo, alertas de peligro y recomendaciones claras.",
    cta: "Analizar mensaje ahora",
    ctaNote: "Gratis · 3 análisis por mes · Sin registro",
    f1Title: "Detección Inteligente",
    f1Desc:
      "La IA analiza patrones de estafa: falsas ofertas de trabajo, phishing, ingeniería social, repositorios maliciosos y robo de cripto.",
    f2Title: "Investigación Profunda",
    f2Desc:
      "Verifica empresa, dominio de correo y repositorio GitHub en tiempo real. Ves las evidencias, no solo el puntaje.",
    f3Title: "Resultados en Segundos",
    f3Desc:
      "Análisis rápido con IA. Dossier completo con Linkup. Decide con información, no con pánico.",
    quote:
      "Casi caí en una estafa por correo — una oferta de trabajo que me habría hecho ejecutar código malicioso para robar mi wallet de cripto. Creé Elucya Shield para que ningún desarrollador pase por el mismo susto.",
    quoteAuthor: "— César Brito, fundador de Kairos Labs",
    footer: "Elucya Shield · Kairos Labs · Hackathon Burning Token 2026",
  },
};

const LANG_LABELS: Record<Lang, string> = { en: "EN", pt: "PT", es: "ES" };
const LS_KEY = "elucya_lang";

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY) as Lang | null;
      if (stored && stored in T) setLang(stored);
    } catch {
      // localStorage unavailable — keep default
    }
  }, []);

  function switchLang(l: Lang) {
    setLang(l);
    try {
      localStorage.setItem(LS_KEY, l);
    } catch {
      // ignore
    }
  }

  const t = T[lang];

  return (
    <main className="min-h-screen flex flex-col">
      {/* Language selector */}
      <div className="flex justify-end px-6 pt-4">
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
          {(["en", "pt", "es"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => switchLang(l)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                lang === l
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 flex items-center justify-center">
          <div className="relative">
            <Shield className="w-20 h-20 text-blue-500" strokeWidth={1.5} />
            <div className="absolute inset-0 bg-blue-500 opacity-10 blur-xl rounded-full" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold mb-4 tracking-tight">
          Elucya <span className="text-blue-500">Shield</span>
        </h1>

        <p className="text-xl sm:text-2xl text-zinc-400 mb-4 max-w-2xl">
          {t.subtitle}
        </p>

        <p className="text-zinc-500 max-w-xl mb-10">{t.description}</p>

        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
        >
          <Shield className="w-5 h-5" />
          {t.cta}
        </Link>

        <p className="mt-4 text-sm text-zinc-600">{t.ctaNote}</p>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800 py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t.f1Title}</h3>
            <p className="text-zinc-500 text-sm">{t.f1Desc}</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Search className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t.f2Title}</h3>
            <p className="text-zinc-500 text-sm">{t.f2Desc}</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t.f3Title}</h3>
            <p className="text-zinc-500 text-sm">{t.f3Desc}</p>
          </div>
        </div>
      </section>

      {/* Real story */}
      <section className="border-t border-zinc-800 py-12 px-4 bg-zinc-900/30">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-zinc-400 italic text-lg leading-relaxed">
            &ldquo;{t.quote}&rdquo;
          </p>
          <p className="mt-4 text-zinc-600 text-sm">{t.quoteAuthor}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 px-4 text-center text-zinc-600 text-sm">
        <p>{t.footer}</p>
      </footer>
    </main>
  );
}
