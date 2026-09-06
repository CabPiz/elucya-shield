# Elucya Shield 🛡️

**Detector de estafas y fraudes en comunicaciones digitales**

Kairos Labs · Hackathon Burning Token 2026

🌐 [English](./README.md) · [Português](./README.pt.md)

---

## Qué hace

Pega un mensaje sospechoso (correo, Discord, WhatsApp...) y Elucya Shield:

1. **Investiga** las entidades mencionadas (empresa, dominio, correo) vía Linkup
2. **Clasifica** el riesgo con IA y devuelve una puntuación de 0 a 100
3. **Muestra** un dossier completo con alertas, evidencias y recomendación
4. **Registra** confirmaciones de estafa para alertar a futuras víctimas mediante inteligencia colectiva

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Completar con tus claves (Linkup, RevenueCat, Supabase)

# 3. Ejecutar en desarrollo
pnpm dev
```

## Tracks del hackathon

- **DEEP RESEARCH** (Linkup) — investigación profunda de entidades en cada mensaje analizado
- **SUBSCRIPTIONS** (RevenueCat) — control de acceso por planes *(implementación pendiente)*

> **Nota:** El track APPLIED AI (Nebius) no fue incluido porque el registro de tarjeta de crédito
> en la plataforma Nebius fue rechazado, imposibilitando la generación de una API key.

## Stack

Next.js 15 · TypeScript · Tailwind v4 · Supabase · Linkup · RevenueCat

## Ver también

- `CLAUDE.md` — contexto completo para desarrollo asistido por IA
- `.env.example` — variables de entorno necesarias
