# Elucya Shield 🛡️

**Detector de golpes e fraudes em comunicações digitais**

Kairos Labs · Hackathon Burning Token 2026

🌐 [English](./README.md) · [Español](./README.es.md)

---

## O que faz

Cole uma mensagem suspeita (e-mail, Discord, WhatsApp...) e o Elucya Shield:

1. **Pesquisa** as entidades mencionadas (empresa, domínio, e-mail) via Linkup
2. **Classifica** o risco com IA e retorna um score de 0 a 100
3. **Exibe** um dossier completo com alertas, evidências e recomendação
4. **Registra** confirmações de golpe para alertar futuras vítimas via inteligência coletiva

## Setup rápido

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencher com suas chaves (Linkup, RevenueCat, Supabase)

# 3. Rodar em desenvolvimento
pnpm dev
```

## Tracks do hackathon

- **DEEP RESEARCH** (Linkup) — pesquisa profunda de entidades em cada mensagem analisada
- **SUBSCRIPTIONS** (RevenueCat) — controle de acesso por planos *(implementação pendente)*

> **Nota:** A track APPLIED AI (Nebius) não foi incluída pois o cadastro de cartão de crédito
> na plataforma Nebius foi recusado, impossibilitando a geração de API key.

## Stack

Next.js 15 · TypeScript · Tailwind v4 · Supabase · Linkup · RevenueCat

## Leia também

- `CLAUDE.md` — contexto completo para desenvolvimento com IA
- `.env.example` — variáveis de ambiente necessárias
