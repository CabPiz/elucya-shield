import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elucya Shield — Detector de Golpes Digitais",
  description:
    "Analise mensagens suspeitas antes de agir. Elucya Shield usa IA para detectar golpes, phishing e fraudes em e-mails, mensagens e ofertas de emprego.",
  keywords: ["golpe", "fraude", "phishing", "detector", "segurança digital", "crypto scam"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
