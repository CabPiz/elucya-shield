# Elucya Shield 🛡️

**Detector de estafas y fraudes en comunicaciones digitales**

Kairos Labs · Hackathon Burning Token 2026

🌐 [English](./README.md) · [Português](./README.pt.md)

---

## Qué hace

Pega un mensaje sospechoso (correo, Discord, WhatsApp...) y Elucya Shield:

1. **Clasifica** el riesgo con IA y devuelve una puntuación de 0 a 100
2. **Investiga** las entidades mencionadas (empresa, dominio, repositorio GitHub) vía Linkup
3. **Reclasifica** con el contexto de la investigación para una puntuación final más precisa
4. **Muestra** un dossier completo con alertas, evidencias y recomendación clara
5. **Registra** confirmaciones de estafa para alertar a futuras víctimas mediante inteligencia colectiva

## Tracks del hackathon

| Track | Tecnología | Estado |
|---|---|---|
| **DEEP RESEARCH** | Linkup SDK — búsqueda profunda de entidades | ✅ Activo |
| **SUBSCRIPTIONS** | RevenueCat — tier gratuito (3 análisis/mes) + plan Pro | ✅ Activo |
| **APPLIED AI** | Google Gemini 2.5 Flash (endpoint compatible con OpenAI, tier gratuito) | ✅ Activo |

## Cómo funciona — Pipeline de análisis

```
Mensaje del usuario
     │
     ▼
[1] Gemini 2.5 Flash — clasificación inicial
     • Puntuación de riesgo (0–100)
     • Nivel: safe / suspicious / danger
     • Alertas de estafa con severidad y evidencias
     • Extracción de entidades (empresa, dominio, GitHub, URL, persona)
     • Identificación del vector de ataque
     │
     ▼ (si Investigación profunda está activa)
[2] Linkup — investigación paralela de entidades
     • researchCompany()     → Reddit, Glassdoor, reportes de estafa
     • researchEmailDomain() → listas de phishing, reputación del dominio
     • researchGitHubRepo()  → malware, stealer, acceso a wallets
     │
     ▼
[3] Gemini 2.5 Flash — reclasificación con contexto de investigación
     • Puntuación final ajustada por evidencias reales
     • Alertas actualizadas con hallazgos de Linkup
     │
     ▼
[4] Validación de output con Zod (guardrail)
     │
     ▼
RiskReport entregado al cliente
```

### Por qué los resúmenes de investigación de Linkup aparecen en inglés

Linkup realiza búsquedas profundas en la web y devuelve el contenido real encontrado en internet (hilos de Reddit, reseñas de Glassdoor, bases de datos de estafas, blogs de seguridad). Como la web es predominantemente en inglés, los resúmenes brutos devueltos por Linkup están en inglés independientemente del idioma seleccionado por el usuario.

Esto es intencional y por diseño:

- **Las insignias de red flags** están **completamente localizadas** — provienen de una tabla de traducción curada (constante `RF` en `src/lib/linkup/client.ts`) y se muestran en el idioma del usuario (EN / PT / ES).
- **Los resúmenes de investigación** son el texto bruto de evidencias de la web — mostrarlos sin modificar preserva la autenticidad y la trazabilidad (las fuentes están enlazadas).
- **Todas las cadenas de UI** (etiquetas, recomendaciones, vectores de ataque, alertas de Gemini) están completamente localizadas mediante el parámetro `lang` pasado por todo el pipeline.

En resumen: el *veredicto* está localizado; la *evidencia bruta* se muestra tal como viene de la fuente.

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Completar con tus claves (ver abajo)

# 3. Ejecutar en desarrollo
npm run dev
```

## Variables de entorno

```
GEMINI_API_KEY=                    # Google AI Studio — gratuito en aistudio.google.com
GEMINI_MODEL=                      # Por defecto: gemini-2.5-flash (con fallback en cascada)
LINKUP_API_KEY=                    # Clave de API del Linkup SDK
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_REVENUECAT_API_KEY=
REVENUECAT_SECRET_KEY=
```

## Stack

Next.js 15 · TypeScript strict · Tailwind v4 · Supabase · Linkup · RevenueCat · Google Gemini

## Ver también

- `CLAUDE.md` — contexto completo para desarrollo asistido por IA
- `.env.example` — variables de entorno necesarias
