import { createFileRoute, Link } from "@tanstack/react-router";
import { ContactForm } from "@/components/ContactForm";
import { Check, Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Pacotes e Preços — Diamante.dev" },
      { name: "description", content: "Landing Page, Institucional, E-commerce, Premium e Corporativo. Tabela clara de preços e o que inclui." },
      { property: "og:title", content: "Pacotes e Preços — Diamante.dev" },
      { property: "og:description", content: "Escolha o site ideal para o seu negócio: da landing rápida ao e-commerce completo." },
    ],
  }),
  component: Vendas,
});

const pacotes = [
  {
    name: "Landing Page",
    price: "R$ 1.500 – 2.000",
    desc: "Página única, moderna e responsiva.",
    features: ["Design sob medida", "Otimizada para conversão", "Formulário integrado", "SEO técnico", "Entrega em 5-7 dias"],
    tag: null,
  },
  {
    name: "Institucional",
    price: "R$ 5.000 – 10.000",
    desc: "Site para empresas pequenas/médias.",
    features: ["Até 8 páginas", "CMS opcional", "Blog incluso", "Painel de contato", "Analytics + SEO"],
    tag: "Popular",
  },
  {
    name: "E-commerce",
    price: "R$ 25.000 – 50.000",
    desc: "Loja virtual completa com carrinho e checkout.",
    features: ["Catálogo ilimitado", "Pagamentos integrados", "Painel admin", "Gestão de estoque", "Frete + cupons"],
    tag: "Premium",
  },
  {
    name: "Projeto Premium",
    price: "R$ 50.000 – 100.000",
    desc: "Sites exclusivos, com shaders e animações agressivas.",
    features: ["Design 100% autoral", "Shaders customizados", "Animações WebGL", "Performance obsessiva", "Suporte prioritário"],
    tag: "Signature",
  },
  {
    name: "Grandes Empresas",
    price: "R$ 1.000.000+",
    desc: "Projetos corporativos de alta complexidade.",
    features: ["Arquitetura escalável", "Multi-idioma", "Integrações ERP/CRM", "SLA dedicado", "Equipe dedicada"],
    tag: "Enterprise",
  },
];

function Vendas() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="pt-8 pb-16 text-center">
        <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/90">
          <Star className="h-3.5 w-3.5 text-accent" /> Pacotes claros · Sem letra miúda
        </span>
        <h1 className="mt-5 text-4xl md:text-6xl font-black text-white">
          Escolha o site <span className="text-gradient">ideal</span>.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-white/70">
          Do landing rápido ao corporativo. Todos os pacotes incluem design sob medida, código próprio e responsividade total.
        </p>
        </Reveal>
      </section>

      <section className="pb-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {pacotes.map((p, i) => (
          <Reveal key={p.name} delay={i * 70} variant="zoom" className="h-full">
          <div className={`glass-panel relative p-7 flex flex-col h-full hover-lift ${p.tag === "Popular" ? "ring-2 ring-primary/60 animate-pulse-glow" : ""}`}>
            {p.tag && (
              <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/40">
                {p.tag}
              </span>
            )}
            <h3 className="text-2xl font-black text-white">{p.name}</h3>
            <p className="mt-1 text-sm text-white/60">{p.desc}</p>
            <div className="mt-5 text-3xl font-black text-gradient">{p.price}</div>
            <ul className="mt-6 space-y-2.5 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                  <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/contato"
                  className="mt-6 text-center rounded-full bg-white/10 border border-white/20 hover:bg-white/20 px-5 py-3 font-semibold text-white transition">
              Solicitar orçamento
            </Link>
          </div>
          </Reveal>
        ))}
      </section>

      {/* TABLE COMPARATIVA */}
      <section className="pb-16">
        <Reveal><h2 className="text-2xl md:text-3xl font-black text-white text-center mb-8">Comparativo rápido</h2></Reveal>
        <Reveal delay={80} className="glass-panel overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10 text-white/70">
                <th className="text-left p-4 font-semibold">Pacote</th>
                <th className="text-left p-4 font-semibold">Ideal para</th>
                <th className="text-left p-4 font-semibold">Prazo</th>
                <th className="text-right p-4 font-semibold">A partir de</th>
              </tr>
            </thead>
            <tbody className="text-white/85">
              {[
                ["Landing Page", "Divulgar um produto", "5-7 dias", "R$ 1.500"],
                ["Institucional", "Empresas PME", "3-5 semanas", "R$ 5.000"],
                ["E-commerce", "Vender online", "6-10 semanas", "R$ 25.000"],
                ["Premium", "Marcas exclusivas", "8-12 semanas", "R$ 50.000"],
                ["Corporativo", "Grandes empresas", "3-6 meses", "R$ 1.000.000"],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                  {row.map((c, i) => (
                    <td key={i} className={`p-4 ${i === 3 ? "text-right font-semibold text-gradient" : ""}`}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <section className="pb-16">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <Reveal variant="left">
            <h2 className="text-3xl md:text-4xl font-black text-white">Pronto pra começar?</h2>
            <p className="mt-3 text-white/70 max-w-lg">
              Me conta sua ideia e escolha o canal preferido. Envio direto no meu WhatsApp e respondo em horas.
            </p>
          </Reveal>
          <Reveal variant="right" delay={80}><ContactForm /></Reveal>
        </div>
      </section>
    </div>
  );
}
