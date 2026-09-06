# Elucya Shield 🛡️

**Detector de golpes e fraudes em comunicações digitais**

Kairos Labs · Hackathon Burning Token 2026

🌐 [English](./README.md) · [Español](./README.es.md)

---

## O que faz

Cole uma mensagem suspeita (e-mail, Discord, WhatsApp...) e o Elucya Shield:

1. **Classifica** o risco com IA e retorna um score de 0 a 100
2. **Pesquisa** as entidades mencionadas (empresa, domínio, repositório GitHub) via Linkup
3. **Reclassifica** com o contexto da pesquisa para um score final mais preciso
4. **Exibe** um dossier completo com alertas, evidências e recomendação clara
5. **Registra** confirmações de golpe para alertar futuras vítimas via inteligência coletiva

## Tracks do hackathon

| Track | Tecnologia | Status |
|---|---|---|
| **DEEP RESEARCH** | Linkup SDK — pesquisa profunda de entidades | ✅ Ativo |
| **SUBSCRIPTIONS** | RevenueCat — tier gratuito (3 análises/mês) + plano Pro | ✅ Ativo |
| **APPLIED AI** | Google Gemini 2.5 Flash (endpoint OpenAI-compatível, tier gratuito) | ✅ Ativo |

## Como funciona — Pipeline de análise

```
Mensagem do usuário
     │
     ▼
[1] Gemini 2.5 Flash — classificação inicial
     • Score de risco (0–100)
     • Nível: safe / suspicious / danger
     • Flags de golpe com severidade e evidências
     • Extração de entidades (empresa, domínio, GitHub, URL, pessoa)
     • Identificação do vetor de ataque
     │
     ▼ (se Pesquisa profunda estiver ativa)
[2] Linkup — pesquisa paralela de entidades
     • researchCompany()     → Reddit, Glassdoor, relatos de golpe
     • researchEmailDomain() → listas de phishing, reputação do domínio
     • researchGitHubRepo()  → malware, stealer, acesso a wallets
     │
     ▼
[3] Gemini 2.5 Flash — reclassificação com contexto da pesquisa
     • Score final ajustado por evidências reais
     • Flags atualizadas com achados do Linkup
     │
     ▼
[4] Validação de output com Zod (guardrail)
     │
     ▼
RiskReport entregue ao cliente
```

### Por que os resumos de pesquisa do Linkup aparecem em inglês

O Linkup realiza pesquisas profundas na web e retorna o conteúdo real encontrado na internet (threads do Reddit, reviews do Glassdoor, bancos de dados de golpes, blogs de segurança). Como a web é predominantemente em inglês, os resumos brutos retornados pelo Linkup são em inglês independentemente do idioma selecionado pelo usuário.

Isso é intencional e por design:

- **Badges de red flags** são **totalmente localizados** — vêm de uma tabela de tradução curada (constante `RF` em `src/lib/linkup/client.ts`) e são exibidos no idioma do usuário (EN / PT / ES).
- **Resumos de pesquisa** são o texto bruto de evidências da web — exibi-los sem modificação preserva autenticidade e rastreabilidade (fontes são linkadas).
- **Todas as strings de UI** (labels, recomendações, vetores de ataque, flags do Gemini) são totalmente localizadas via parâmetro `lang` passado por todo o pipeline.

Resumindo: o *veredicto* é localizado; a *evidência bruta* é exibida como veio da fonte.

## Setup rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher com suas chaves (veja abaixo)

# 3. Rodar em desenvolvimento
npm run dev
```

## Variáveis de ambiente

```
GEMINI_API_KEY=                    # Google AI Studio — gratuito em aistudio.google.com
GEMINI_MODEL=                      # Padrão: gemini-2.5-flash (com fallback em cascata)
LINKUP_API_KEY=                    # Chave de API do Linkup SDK
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_REVENUECAT_API_KEY=
REVENUECAT_SECRET_KEY=
```

## Stack

Next.js 15 · TypeScript strict · Tailwind v4 · Supabase · Linkup · RevenueCat · Google Gemini

## Leia também

- `CLAUDE.md` — contexto completo para desenvolvimento com IA
- `.env.example` — variáveis de ambiente necessárias
