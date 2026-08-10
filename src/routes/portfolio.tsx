import { createFileRoute, Link } from "@tanstack/react-router";
import showcase1 from "@/assets/showcase-1.jpg";
import showcase2 from "@/assets/showcase-2.jpg";
import showcase3 from "@/assets/showcase-3.jpg";
import heroImg from "@/assets/hero.jpg";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight, Gauge, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfólio — projetos que geram resultado | Diamante.dev" },
      { name: "description", content: "Cases reais de landing pages, sites institucionais e e-commerces: métricas de performance, conversão e design premium." },
      { property: "og:title", content: "Portfólio — projetos que geram resultado" },
      { property: "og:description", content: "Cases de landing pages, institucionais e e-commerces com métricas reais de performance e conversão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

const cases = [
  {
    img: showcase1,
    title: "Nova Studio",
    type: "Landing Page",
    result: "+184% de leads em 60 dias",
    speed: "99 PageSpeed",
    desc: "Landing de alta conversão com formulário direto no WhatsApp e prova social animada.",
  },
  {
    img: showcase2,
    title: "Grupo Atlas",
    type: "Site Institucional",
    result: "+3x tempo de sessão",
    speed: "97 PageSpeed",
    desc: "Institucional multi-seção com blog, área de imprensa e SEO técnico completo.",
  },
  {
    img: showcase3,
    title: "Lumen Store",
    type: "E-commerce",
    result: "+62% de receita online",
    speed: "95 PageSpeed",
    desc: "Loja completa com checkout otimizado, cupons, frete e painel administrativo.",
  },
  {
    img: heroImg,
    title: "Vértice Premium",
    type: "Projeto Premium",
    result: "Prêmio de design regional",
    speed: "94 PageSpeed",
    desc: "Experiência com shaders WebGL, transições líquidas e identidade 100% autoral.",
  },
];

function Portfolio() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="pt-8 pb-14 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/90">
            <TrendingUp className="h-3.5 w-3.5 text-accent" /> Resultados reais · Métricas verificadas
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05]">
            Projetos que <span className="text-gradient">viram receita</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-white/70">
            Cada projeto nasce de um objetivo de negócio. Aqui estão alguns dos resultados que entreguei.
          </p>
        </Reveal>
      </section>

      <section className="pb-10 grid gap-6 sm:grid-cols-2">
        {cases.map((c, i) => (
          <Reveal key={c.title} delay={i * 90} variant="zoom">
            <article className="group glass-panel overflow-hidden hover-lift h-full">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={c.img} alt={`Projeto ${c.title} — ${c.type}`} loading="lazy"
                     className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
                <span className="absolute left-4 top-4 rounded-full glass px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                  {c.type}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{c.title}</h2>
                  <ArrowUpRight className="h-5 w-5 text-white/50 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{c.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-semibold text-white">
                    <TrendingUp className="h-3.5 w-3.5 text-accent" /> {c.result}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-semibold text-white">
                    <Gauge className="h-3.5 w-3.5 text-accent" /> {c.speed}
                  </span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="py-16">
        <Reveal className="glass-panel p-8 sm:p-10 text-center">
          <h2 className="text-2xl sm:text-4xl font-black text-white">Seu projeto pode ser o próximo case.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">Me conta a ideia — devolvo um plano com escopo, prazo e preço em até 24h.</p>
          <Link to="/vendas" className="mt-6 inline-flex rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-6 py-3.5 font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition hover:bg-[position:100%_0]">
            Ver pacotes e preços
          </Link>
        </Reveal>
      </section>

      <section className="pb-20 grid gap-8 lg:grid-cols-2 items-center">
        <Reveal variant="left">
          <h2 className="text-3xl md:text-4xl font-black text-white">Quer um orçamento <span className="text-gradient">agora</span>?</h2>
          <p className="mt-3 text-white/70 max-w-lg">Preencha e cai direto no meu WhatsApp.</p>
        </Reveal>
        <Reveal variant="right" delay={80}><ContactForm /></Reveal>
      </section>
    </div>
  );
}
