"use client";

/**
 * RevenueCat Provider — Track: SUBSCRIPTIONS
 *
 * Inicializa o SDK com um ID anônimo persistido em localStorage,
 * expõe o plano atual via contexto e disponibiliza o hook usePlan().
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { initRevenueCat, getUserPlan } from "@/lib/revenuecat/client";
import type { UserPlan } from "@/types";

interface PlanContextValue {
  plan: UserPlan | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const PlanContext = createContext<PlanContextValue>({
  plan: null,
  loading: true,
  refresh: async () => {},
});

export function usePlan() {
  return useContext(PlanContext);
}

function getOrCreateAnonymousId(): string {
  try {
    const key = "elucya_shield_uid";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = `anon_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(key, id);
    return id;
  } catch {
    return `anon_fallback_${Date.now()}`;
  }
}

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadPlan() {
    setLoading(true);
    try {
      const userId = getOrCreateAnonymousId();
      await initRevenueCat(userId);
      const p = await getUserPlan();
      setPlan(p);
    } catch {
      // Fallback silencioso — produto funciona em modo free sem RC
      setPlan({ plan: "free", entitlements: ["basic_analysis"], analysesRemaining: 3 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlan();
  }, []);

  return (
    <PlanContext.Provider value={{ plan, loading, refresh: loadPlan }}>
      {children}
    </PlanContext.Provider>
  );
}
