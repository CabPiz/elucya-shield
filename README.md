# Elucya Shield 🛡️

**Digital scam and fraud detector for any messaging channel**

Kairos Labs · Hackathon Burning Token 2026

🌐 [Português](./README.pt.md) · [Español](./README.es.md)

---

## What It Does

Paste a suspicious message (email, Discord, WhatsApp...) and Elucya Shield:

1. **Classifies** the risk with AI and returns a score from 0 to 100
2. **Researches** the mentioned entities (company, domain, GitHub repo) via Linkup
3. **Reclassifies** with the research context for a more accurate final score
4. **Displays** a complete dossier with alerts, evidence, and a clear recommendation
5. **Records** scam confirmations to warn future victims via collective intelligence

## Hackathon Tracks

| Track | Technology | Status |
|---|---|---|
| **DEEP RESEARCH** | Linkup SDK — deep web search for entity verification | ✅ Active |
| **SUBSCRIPTIONS** | RevenueCat — free tier (3 analyses/month) + Pro plan | ✅ Active |
| **APPLIED AI** | Google Gemini 2.5 Flash (OpenAI-compatible endpoint, free tier) | ✅ Active |

## How It Works — Analysis Pipeline

```
User message
     │
     ▼
[1] Gemini 2.5 Flash — initial classification
     • Risk score (0–100)
     • Danger level: safe / suspicious / danger
     • Scam flags with severity and evidence
     • Entity extraction (company, email domain, GitHub repo, URL, person)
     • Attack vector identification
     │
     ▼ (if Deep Research is enabled)
[2] Linkup — parallel entity research
     • researchCompany()     → Reddit, Glassdoor, scam reports
     • researchEmailDomain() → phishing lists, domain reputation
     • researchGitHubRepo()  → malware, stealer, wallet access
     │
     ▼
[3] Gemini 2.5 Flash — reclassification with research context
     • Final risk score adjusted by real-world evidence
     • Red flags updated with Linkup findings
     │
     ▼
[4] Zod output validation (guardrail)
     │
     ▼
RiskReport delivered to client
```

### Why Linkup Research Summaries Appear in English

Linkup performs deep web searches and returns the actual content found on the internet (Reddit threads, Glassdoor reviews, scam databases, security blogs). Because the web is predominantly in English, the raw research summaries returned by Linkup are in English regardless of the language selected by the user.

This is intentional and by design:

- **Red flag badges** are **fully localized** — they come from a curated translation table (`RF` constant in `src/lib/linkup/client.ts`) and are rendered in the user's selected language (EN / PT / ES).
- **Research summaries** are raw evidence text from the web — showing them unmodified preserves authenticity and traceability (sources are linked).
- **All UI strings** (labels, recommendations, attack vectors, scam flags from Gemini) are fully localized via the `lang` parameter passed through the entire pipeline.

In short: the *verdict* is localized; the *raw evidence* is shown as-is from the source.

## Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# Fill in your keys (see below)

# 3. Run in development
npm run dev
```

## Environment Variables

```
GEMINI_API_KEY=                    # Google AI Studio — free at aistudio.google.com
GEMINI_MODEL=                      # Default: gemini-2.5-flash (with cascade fallback)
LINKUP_API_KEY=                    # Linkup SDK API key
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_REVENUECAT_API_KEY=
REVENUECAT_SECRET_KEY=
```

## Stack

Next.js 15 · TypeScript strict · Tailwind v4 · Supabase · Linkup · RevenueCat · Google Gemini

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page (i18n: EN/PT/ES)
│   ├── analyze/page.tsx      # Analysis UI
│   └── api/analyze/route.ts  # Main pipeline (Gemini → Linkup → Gemini)
├── lib/
│   ├── nebius/classify.ts    # Gemini classifier (OpenAI-compatible)
│   └── linkup/client.ts      # Linkup entity research (EN/PT/ES)
├── components/
│   └── shield/               # PaywallModal, result cards
└── types/index.ts            # Zod schemas: AnalyzeRequest, RiskReport, EntityResearch
```

## See Also

- `CLAUDE.md` — full context for AI-assisted development
- `.env.example` — required environment variables
