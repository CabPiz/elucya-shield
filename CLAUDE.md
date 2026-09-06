# CLAUDE.md — Elucya Shield

## O que é este projeto

**Elucya Shield** é um detector de golpes e fraudes em comunicações digitais, desenvolvido para o hackathon **Burning Token** (NERDCONF, 5–12 set 2026).

É um produto da **Kairos Labs** (Cesar Brito, cab.pizarro@gmail.com) — o mesmo ecossistema do Elucya Talk, DevPrint e Ágora Global.

Após o hackathon, o Elucya Shield será migrado para o Turborepo do Elucya Talk como `apps/elucya-shield/`.

---

## Hackathon — Burning Token

- **Evento:** NERDCONF · Burning Token Hackathon
- **Período:** 5–12 setembro 2026
- **Deadline:** 12 set 2026, 23h59 SF time (13 set às 03h59 horário de Brasília)
- **Formato:** online + presencial SF, equipes de 1–3 pessoas
- **Registro:** https://lu.ma/burningtoken-online
- **Plataforma:** https://app.burningtoken.dev

### Tracks em disputa (3 simultâneas)

| Track | Sponsor | Prêmio | Requisito |
|---|---|---|---|
| DEEP RESEARCH | Linkup | $500 | Usar Linkup API para pesquisa profunda |
| APPLIED AI | Nebius | $500 | Usar Nebius para inferência de IA no fluxo principal |
| SUBSCRIPTIONS | RevenueCat | $500 | Integrar RevenueCat para controle de acesso por planos |

### MCP do Hackathon

```bash
# Configuração (já adicionada globalmente)
claude mcp add --transport sse burning-token https://app.burningtoken.dev/api/mcp
```

**Prompt para usar o MCP:**
> "Quando eu perguntar sobre o hackathon, chame sempre `ask_hackathon` com minha pergunta em `question`. Use os resultados para me responder em português."

---

## Conceito do Produto

### O problema (história real)
César quase caiu num golpe específico para programadores: uma "vaga de emprego" recebida por e-mail que o induziria a clonar e rodar um repositório com código malicioso. O objetivo do atacante era roubar chaves privadas e seed phrases de wallets de blockchain.

### A solução — Elucya Shield
Plataforma web + extensão Chrome que intercepta mensagens suspeitas em qualquer canal digital (Gmail, Discord, WhatsApp, Telegram, etc.) e:

1. **Detecta** mensagens com padrões de golpe
2. **Pesquisa** entidades mencionadas (empresa, domínio, e-mail, GitHub repo) via Linkup
3. **Classifica** risco via Nebius (LLM especializado)
4. **Alerta** o usuário com dossier completo **antes** de ele agir

### Tipos de golpe detectados (MVP)
- Falsas vagas de emprego para programadores (vetor de roubo de cripto)
- Phishing de credenciais
- Engenharia social (urgência artificial, autoridade falsa)
- Links/repositórios maliciosos
- Ofertas financeiras suspeitas

---

## Stack Técnica

| Camada | Tecnologia | Track |
|---|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind v4 | — |
| Pesquisa profunda | Linkup SDK | DEEP RESEARCH |
| Classificação IA | Nebius API (Llama-3.3-70B) | APPLIED AI |
| Controle de acesso | RevenueCat SDK | SUBSCRIPTIONS |
| Banco de dados | Supabase (PostgreSQL) | — |
| Deploy | Vercel Hobby | — |
| Schema validation | Zod | — |

---

## Estrutura do Projeto

```
elucya-shield/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + RevenueCat init
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Tailwind v4
│   │   ├── analyze/
│   │   │   └── page.tsx        # UI principal de análise
│   │   └── api/
│   │       ├── analyze/
│   │       │   └── route.ts    # Pipeline principal
│   │       └── research/
│   │           └── route.ts    # Linkup research endpoint
│   ├── lib/
│   │   ├── linkup/
│   │   │   └── client.ts       # Linkup SDK wrapper
│   │   ├── nebius/
│   │   │   └── classify.ts     # Nebius classification
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   └── server.ts       # Server client
│   │   └── revenuecat/
│   │       └── client.ts       # RevenueCat entitlements
│   ├── components/
│   │   ├── ui/                 # Componentes genéricos
│   │   └── shield/             # Componentes específicos do produto
│   └── types/
│       └── index.ts            # Tipos compartilhados
├── public/
├── CLAUDE.md                   # Este arquivo
├── .env.example
├── package.json
└── ...config files
```

---

## Fluxo Principal (MVP)

```
[Usuário cola mensagem suspeita]
         │
         ▼
[API /analyze - recebe texto]
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[Linkup:  [Nebius:
 pesquisa  pré-classifica
 entidades risco rápido]
 mencionadas]
    │         │
    └────┬────┘
         │
         ▼
[Nebius: classificação final
 com contexto da pesquisa]
         │
         ▼
[Retorna RiskReport {
  score: 0-100,
  level: 'safe'|'suspicious'|'danger',
  flags: string[],
  entities: EntityResearch[],
  recommendation: string,
  evidence: string[]
}]
         │
         ▼
[Dashboard exibe resultado
 com dossier visual]
```

---

## Planos e RevenueCat

| Plano | Análises/mês | Pesquisa Linkup | Preço |
|---|---|---|---|
| Free | 3 | ❌ (só análise básica) | R$ 0 |
| Shield | 50 | ✅ dossier completo | R$ 19/mês |
| Pro | ilimitado | ✅ + histórico | R$ 49/mês |

**Entitlements RevenueCat:**
- `basic_analysis` — Free tier
- `deep_research` — Shield/Pro (habilita Linkup)
- `unlimited` — Pro (sem limite de análises)

---

## Convenções de Código

- **Idioma dos commits:** português (Conventional Commits)
- **Idioma do código:** inglês (variáveis, funções, tipos)
- **Idioma da UI:** português brasileiro
- **Observabilidade:** toda chamada a LLM registra em `agent_runs` no Supabase
- **Guardrails:** todo output de LLM validado com Zod antes de usar
- **Human-in-the-Loop:** usuário sempre vê score + evidências antes de decisão

---

## Comandos Úteis

```bash
# Desenvolvimento
pnpm dev

# Instalar Linkup skills
npx skills add LinkupPlatform/skills

# Verificar MCP do hackathon
claude mcp list
```

---

## Contexto: Ecossistema Kairos Labs

- **Elucya Talk** — análise comportamental de linguagem (áudio/texto)
- **Elucya Shield** — detector de golpes (este projeto)
- **DevPrint** — currículo vivo baseado em commits GitHub
- **Ágora Global** — watchdog de contratos públicos (civic tech)

Após o hackathon: `elucya-shield` migra para `CabPiz/elucya-talk` como `apps/elucya-shield/`.
