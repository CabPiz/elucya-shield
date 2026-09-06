import Link from "next/link";
import { Shield, AlertTriangle, Search, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 flex items-center justify-center">
          <div className="relative">
            <Shield className="w-20 h-20 text-blue-500" strokeWidth={1.5} />
            <div className="absolute inset-0 bg-blue-500 opacity-10 blur-xl rounded-full" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold mb-4 tracking-tight">
          Elucya{" "}
          <span className="text-blue-500">Shield</span>
        </h1>

        <p className="text-xl sm:text-2xl text-zinc-400 mb-4 max-w-2xl">
          Detecte golpes digitais antes de agir
        </p>

        <p className="text-zinc-500 max-w-xl mb-10">
          Cole qualquer mensagem suspeita — e-mail de &ldquo;vaga de emprego&rdquo;, oferta financeira,
          link desconhecido — e receba em segundos um dossier completo com score de risco,
          flags de perigo e recomendações claras.
        </p>

        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
        >
          <Shield className="w-5 h-5" />
          Analisar mensagem agora
        </Link>

        <p className="mt-4 text-sm text-zinc-600">
          Grátis · 3 análises por mês · Sem cadastro
        </p>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800 py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Detecção Inteligente</h3>
            <p className="text-zinc-500 text-sm">
              IA analisa padrões de golpe: falsas vagas, phishing, engenharia social,
              repositórios maliciosos e roubo de cripto.
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Search className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Pesquisa Profunda</h3>
            <p className="text-zinc-500 text-sm">
              Verifica empresa, domínio de e-mail e repositório GitHub em tempo real.
              Você vê as evidências, não apenas o score.
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Resultado em Segundos</h3>
            <p className="text-zinc-500 text-sm">
              Análise rápida com Nebius AI. Dossier completo com Linkup.
              Decida com informação, não com pânico.
            </p>
          </div>
        </div>
      </section>

      {/* Real story */}
      <section className="border-t border-zinc-800 py-12 px-4 bg-zinc-900/30">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-zinc-400 italic text-lg leading-relaxed">
            &ldquo;Quase caí num golpe por e-mail — uma &lsquo;vaga de emprego&rsquo; que me faria rodar
            código malicioso para roubar minha wallet de cripto. Criei o Elucya Shield
            para que nenhum programador passe pelo mesmo susto.&rdquo;
          </p>
          <p className="mt-4 text-zinc-600 text-sm">— César Brito, fundador da Kairos Labs</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 px-4 text-center text-zinc-600 text-sm">
        <p>
          Elucya Shield · Kairos Labs · Hackathon Burning Token 2026
        </p>
      </footer>
    </main>
  );
}
