/**
 * RevenueCat client — Track: SUBSCRIPTIONS
 *
 * Controla acesso às features por entitlement:
 * - basic_analysis: Free tier (3 análises/mês)
 * - deep_research: Shield/Pro (habilita Linkup deep research)
 * - unlimited: Pro (sem limite de análises)
 */

import type { Entitlement, UserPlan } from "@/types";

// RevenueCat Entitlement IDs (configurar no dashboard RevenueCat)
const ENTITLEMENTS = {
  BASIC: "basic_analysis" as Entitlement,
  DEEP_RESEARCH: "deep_research" as Entitlement,
  UNLIMITED: "unlimited" as Entitlement,
};

/**
 * Inicializa o RevenueCat SDK no browser.
 * Chame no layout.tsx (client component) com o user ID.
 */
export async function initRevenueCat(userId: string) {
  if (typeof window === "undefined") return;

  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
  if (!apiKey) {
    console.warn("[RevenueCat] API key not configured — running in free mode");
    return;
  }

  try {
    const { Purchases } = await import("@revenuecat/purchases-js");
    await Purchases.configure(apiKey, userId);
    console.log("[RevenueCat] Initialized for user:", userId);
  } catch (err) {
    console.error("[RevenueCat] Init failed:", err);
  }
}

/**
 * Retorna o plano atual do usuário baseado nos entitlements ativos
 */
export async function getUserPlan(): Promise<UserPlan> {
  if (typeof window === "undefined") {
    return { plan: "free", entitlements: [ENTITLEMENTS.BASIC], analysesRemaining: 3 };
  }

  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
  if (!apiKey) {
    // Desenvolvimento sem RevenueCat — retorna plano Pro para facilitar testes
    return {
      plan: "pro",
      entitlements: [ENTITLEMENTS.BASIC, ENTITLEMENTS.DEEP_RESEARCH, ENTITLEMENTS.UNLIMITED],
      analysesRemaining: "unlimited",
    };
  }

  try {
    const { Purchases } = await import("@revenuecat/purchases-js");
    const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
    const activeEntitlements = customerInfo.entitlements.active;

    const hasUnlimited = ENTITLEMENTS.UNLIMITED in activeEntitlements;
    const hasDeepResearch = ENTITLEMENTS.DEEP_RESEARCH in activeEntitlements;

    if (hasUnlimited) {
      return {
        plan: "pro",
        entitlements: [ENTITLEMENTS.BASIC, ENTITLEMENTS.DEEP_RESEARCH, ENTITLEMENTS.UNLIMITED],
        analysesRemaining: "unlimited",
      };
    }

    if (hasDeepResearch) {
      return {
        plan: "shield",
        entitlements: [ENTITLEMENTS.BASIC, ENTITLEMENTS.DEEP_RESEARCH],
        analysesRemaining: 50, // TODO: implementar contador no Supabase
      };
    }

    return {
      plan: "free",
      entitlements: [ENTITLEMENTS.BASIC],
      analysesRemaining: 3, // TODO: implementar contador no Supabase
    };
  } catch (err) {
    console.error("[RevenueCat] Failed to get customer info:", err);
    return { plan: "free", entitlements: [ENTITLEMENTS.BASIC], analysesRemaining: 3 };
  }
}

/**
 * Verifica se o usuário tem acesso a um entitlement específico
 */
export async function hasEntitlement(entitlement: Entitlement): Promise<boolean> {
  const plan = await getUserPlan();
  return plan.entitlements.includes(entitlement);
}

/**
 * Inicia o fluxo de compra do RevenueCat para o plano selecionado.
 * Tenta usar o package correto do offering atual; faz fallback para
 * o primeiro package disponível, e por último abre o dashboard RC.
 *
 * @param planId - "shield" (padrão) ou "pro"
 * @returns CustomerInfo após compra bem-sucedida, ou undefined se cancelado/falhou
 */
export async function purchasePlan(planId: "shield" | "pro" = "shield") {
  if (typeof window === "undefined") return;

  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
  if (!apiKey) {
    window.open("https://www.revenuecat.com", "_blank");
    return;
  }

  try {
    const { Purchases } = await import("@revenuecat/purchases-js");
    const offerings = await Purchases.getSharedInstance().getOfferings();

    // Try current offering first, fallback to "web" offering (RC Billing)
    const offering = offerings.current ?? offerings.all["web"];
    if (!offering || offering.availablePackages.length === 0) {
      console.warn("[RevenueCat] No packages available — redirecting to dashboard");
      window.open("https://app.revenuecat.com", "_blank");
      return;
    }

    const packages = offering.availablePackages;

    // Tenta encontrar o package pelo nome do plano; fallback para o primeiro disponível
    const targetPackage =
      packages.find((p) =>
        planId === "pro"
          ? p.identifier.toLowerCase().includes("pro") || p.identifier === "$rc_annual"
          : p.identifier.toLowerCase().includes("shield") || p.identifier === "$rc_monthly"
      ) ?? packages[0];

    console.log("[RevenueCat] Purchasing package:", targetPackage.identifier);

    const { customerInfo } = await Purchases.getSharedInstance().purchase({
      rcPackage: targetPackage,
    });

    console.log("[RevenueCat] Purchase successful:", customerInfo);
    return customerInfo;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "userCancelled" in err &&
      (err as { userCancelled: boolean }).userCancelled
    ) {
      console.log("[RevenueCat] Purchase cancelled by user");
    } else {
      console.error("[RevenueCat] Purchase failed:", err);
    }
  }
}

/**
 * @deprecated Use purchasePlan() em vez disso.
 * Mantido por compatibilidade — redireciona para purchasePlan("shield").
 */
export async function openPaywall() {
  return purchasePlan("shield");
}
