# Elucya Shield

**Elucya Shield** is a digital scam detector built for developers and tech professionals. Paste any suspicious message — fake job offer, phishing email, unknown link — and receive a complete risk dossier in seconds: risk score, danger flags, entity research, and clear recommendations.

> Built for **Hackathon Burning Token 2026 / NERDCONF** by César Brito, Kairos Labs.

---

## Hackathon Tracks

| Track | Technology | Status |
|---|---|---|
| **DEEP RESEARCH** | Linkup SDK — deep web search for entity verification | ✅ Active |
| **SUBSCRIPTIONS** | RevenueCat — free tier (3 analyses/month) + Pro plan | ✅ Active |
| **APPLIED AI** | Google Gemini 2.5 Flash (OpenAI-compatible endpoint) | ✅ Active |

---

## How It Works

### Analysis Pipeline

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

- **Red flag badges** (e.g., "Mentioned in scam reports", "Domain associated with phishing") are **fully localized** — they come from a curated translation table (`RF` constant in `src/lib/linkup/client.ts`) and are rendered in the user's selected language (EN / PT / ES).
- **Research summaries** are the raw evidence text from the web — showing them unmodified preserves authenticity and traceability (sources are linked). Translating them would require an additional LLM call, adding latency and cost.
- **All UI strings** (labels, recommendations, attack vectors, scam flags from Gemini) are fully localized via the `T` translation object and the `lang` parameter passed through the entire pipeline.

In short: the *verdict* is localized; the *raw evidence* is shown as-is from the source.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript strict mode) |
| AI Classifier | Google Gemini 2.5 Flash via AI Studio (free tier, OpenAI-compatible endpoint) |
| Deep Research | Linkup SDK (deep web search) |
| Subscriptions | RevenueCat (free: 3/month · Pro: unlimited) |
| Database | Supabase (observability, scam confirmations) |
| Deployment | Render Web Service (auto-deploy from GitHub) |
| Validation | Zod (input and output schemas) |

---

## Key Features

**Smart Detection** — Gemini analyzes scam patterns specific to developers: fake job offers that ask you to clone and run a repository, technical assessments with malicious npm packages, crypto wallet theft via seed phrase requests, and typosquatting domains.

**Deep Research** — Linkup verifies companies, email domains, and GitHub repositories in real time against scam reports, phishing databases, and security disclosures. You see the evidence, not just a score.

**Multilingual** — Full EN / PT / ES support with localStorage persistence. The language setting flows from the UI through the Gemini prompt and Linkup research functions so flags and recommendations are always in the user's language.

**Retry on Overload** — When the AI service returns 503/429 (high demand), the UI shows a friendly "try again" button instead of a raw error message.

**Scam Confirmation** — Users can confirm an analysis as a real scam. Confirmations are stored in Supabase and surface a counter ("you helped N people stay safe"), turning individual analyses into a crowdsourced threat signal.

---

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

---

## Running Locally

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Build check (runs ESLint + TypeScript + Next.js compilation):

```bash
npm run build
```

---

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

---

*Elucya Shield · Kairos Labs · Hackathon Burning Token 2026*
