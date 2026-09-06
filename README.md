# Elucya Shield 🛡️

**Detector de golpes e fraudes em comunicações digitais**

Produto Kairos Labs · Hackathon Burning Token 2026

---

## O que faz

Cola uma mensagem suspeita (e-mail, Discord, WhatsApp...) e o Elucya Shield:

1. **Pesquisa** as entidades mencionadas (empresa, domínio, e-mail) via Linkup
2. **Classifica** o risco com IA (via API compatível com OpenAI)
3. **Exibe** um dossier completo com score 0–100, alertas e recomendação
4. **Registra** confirmações de golpe para alertar outras pessoas

## Setup rápido

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas chaves (Linkup, RevenueCat, Supabase)

# 3. Rodar em desenvolvimento
pnpm dev
```

## Tracks do hackathon

- **DEEP RESEARCH** (Linkup) — pesquisa profunda de entidades mencionadas na mensagem
- **SUBSCRIPTIONS** (RevenueCat) — controle de planos e entitlements *(implementação pendente)*

> **Nota:** A track APPLIED AI (Nebius) não foi incluída pois o cadastro de cartão de crédito
> na plataforma Nebius foi recusado, impossibilitando a geração de API key.

## Stack

Next.js 15 · TypeScript · Tailwind v4 · Supabase · Linkup · RevenueCat

## Leia também

- `CLAUDE.md` — contexto completo para desenvolvimento com IA
- `.env.example` — variáveis de ambiente necessárias
