"use client";

/**
 * PaywallModal — exibido quando o usuário tenta usar um recurso premium
 * sem o entitlement necessário.
 *
 * Track: SUBSCRIPTIONS (RevenueCat)
 */

import { useState } from "react";
import { X, Zap, Shield, Infinity } from "lucide-react";
import { purchasePlan } from "@/lib/revenuecat/client";

interface PaywallModalProps {
  onClose: () => void;
  lang?: "pt" | "en" | "es";
}

type PlanId = "free" | "shield" | "pro";

const copy = {
  pt: {
    title: "Recurso Premium",
    subtitle: "A pesquisa profunda (Linkup) analisa empresas, domínios e e-mails em tempo real para um dossier completo. Disponível nos planos Shield e Pro.",
    plans: [
      { id: "free" as PlanId, name: "Free", price: "R$ 0", analyses: "3 análises/mês", deep: false, icon: Zap },
      { id: "shield" as PlanId, name: "Shield", price: "R$ 19/mês", analyses: "50 análises/mês", deep: true, icon: Shield, highlight: true },
      { id: "pro" as PlanId, name: "Pro", price: "R$ 49/mês", analyses: "Ilimitado", deep: true, icon: Infinity },
    ],
    upgrade: "Fazer upgrade",
    upgrading: "Processando...",
    cancel: "Continuar no Free",
  },
  en: {
    title: "Premium Feature",
    subtitle: "Deep research (Linkup) analyzes companies, domains and emails in real time for a complete dossier. Available on Shield and Pro plans.",
    plans: [
      { id: "free" as PlanId, name: "Free", price: "$0", analyses: "3 analyses/month", deep: false, icon: Zap },
      { id: "shield" as PlanId, name: "Shield", price: "$4/month", analyses: "50 analyses/month", deep: true, icon: Shield, highlight: true },
      { id: "pro" as PlanId, name: "Pro", price: "$10/month", analyses: "Unlimited", deep: true, icon: Infinity },
    ],
    upgrade: "Upgrade now",
    upgrading: "Processing...",
    cancel: "Stay on Free",
  },
  es: {
    title: "Función Premium",
    subtitle: "La investigación profunda (Linkup) analiza empresas, dominios y correos en tiempo real para un dossier completo. Disponible en los planes Shield y Pro.",
    plans: [
      { id: "free" as PlanId, name: "Free", price: "$0", analyses: "3 análisis/mes", deep: false, icon: Zap },
      { id: "shield" as PlanId, name: "Shield", price: "$4/mes", analyses: "50 análisis/mes", deep: true, icon: Shield, highlight: true },
      { id: "pro" as PlanId, name: "Pro", price: "$10/mes", analyses: "Ilimitado", deep: true, icon: Infinity },
    ],
    upgrade: "Actualizar ahora",
    upgrading: "Procesando...",
    cancel: "Continuar en Free",
  },
};

export function PaywallModal({ onClose, lang = "pt" }: PaywallModalProps) {
  const t = copy[lang];
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("shield");
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (selectedPlan === "free") {
      onClose();
      return;
    }
    setLoading(true);
    try {
      const customerInfo = await purchasePlan(selectedPlan as "shield" | "pro");
      if (customerInfo) {
        // Compra bem-sucedida — recarrega a página para atualizar entitlements
        window.location.reload();
      }
    } finally {
      setLoading(false);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">{t.title}</h2>
          </div>
          <p className="text-sm text-zinc-400">{t.subtitle}</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {t.plans.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPlan === p.id;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setSelectedPlan(p.id)}
                className={`rounded-xl p-3 border text-center transition-all cursor-pointer outline-none ${
                  isSelected
                    ? "ring-2 ring-blue-500 bg-blue-500/15 border-blue-500/60"
                    : p.highlight
                    ? "bg-blue-500/10 border-blue-500/40 hover:border-blue-400"
                    : "bg-zinc-800 border-zinc-700 hover:border-zinc-500"
                }`}
              >
                <Icon className={`w-4 h-4 mx-auto mb-1 ${isSelected || p.highlight ? "text-blue-400" : "text-zinc-400"}`} />
                <div className={`text-sm font-bold ${isSelected || p.highlight ? "text-blue-300" : "text-white"}`}>
                  {p.name}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">{p.price}</div>
                <div className="text-xs text-zinc-500 mt-1">{p.analyses}</div>
                <div className="mt-2 text-xs">
                  {p.deep ? (
                    <span className="text-green-400">✓ Deep research</span>
                  ) : (
                    <span className="text-zinc-600">✗ Deep research</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {loading ? t.upgrading : t.upgrade}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 text-zinc-400 hover:text-white disabled:opacity-40 text-sm transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
