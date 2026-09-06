# Elucya Shield 🛡️

**Digital scam and fraud detector for any messaging channel**

Kairos Labs · Burning Token Hackathon 2026

🌐 [Português](./README.pt.md) · [Español](./README.es.md)

---

## What it does

Paste any suspicious message (email, Discord, WhatsApp...) and Elucya Shield will:

1. **Research** mentioned entities (company, domain, email) via Linkup deep search
2. **Classify** the risk with AI and return a score from 0 to 100
3. **Display** a full dossier with flags, evidence and a recommendation
4. **Record** scam confirmations to warn future victims through collective intelligence

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Set environment variables
cp .env.example .env
# Fill in your keys (Linkup, RevenueCat, Supabase)

# 3. Run in development
pnpm dev
```

## Hackathon tracks

- **DEEP RESEARCH** (Linkup) — deep entity research on every analyzed message
- **SUBSCRIPTIONS** (RevenueCat) — plan-based access control *(implementation pending)*

> **Note:** The APPLIED AI track (Nebius) was not included because the credit card
> registration on the Nebius platform was refused, making it impossible to generate an API key.

## Stack

Next.js 15 · TypeScript · Tailwind v4 · Supabase · Linkup · RevenueCat

## See also

- `CLAUDE.md` — full context for AI-assisted development
- `.env.example` — all required environment variables
