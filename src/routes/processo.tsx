import { createFileRoute, Link } from "@tanstack/react-router";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { Search, PenTool, Code2, Rocket, LifeBuoy, Clock } from "lucide-react";

export const Route = createFileRoute("/processo")({
  head: () => ({
    meta: [
      { title: "Como eu trabalho — processo em 5 etapas | Diamante.dev" },
      {
        name: "description",
        content:
          "Do briefing ao lançamento: descoberta, design, desenvolvimento, deploy e suporte. Prazos claros e zero surpresa.",
      },
      { property: "og:title", content: "Como eu trabalho — processo em 5 etapas" },
      {
        property: "og:description",
        content:
          "Descoberta, design, desenvolvimento, deploy e suporte — prazos claros e comunicação direta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Processo,
});

const steps = [
  {
    icon: Search,
    title: "1 · Descoberta",
    time: "1-2 dias",
    desc: "Entendo seu negócio, público e objetivo. Defino escopo, referências e métricas de sucesso.",
  },
  {
    icon: PenTool,
    title: "2 · Design",
    time: "3-6 dias",
    desc: "Protótipo navegável com identidade visual, tipografia e microinterações aprovadas por você.",
  },
  {
    icon: Code2,
    title: "3 · Desenvolvimento",
    time: "5-20 dias",
    desc: "Código TypeScript limpo, responsivo em celular/tablet/PC/TV, SEO técnico e acessibilidade.",
  },
  {
    icon: Rocket,
    title: "4 · Lançamento",
    time: "1 dia",
    desc: "Deploy, domínio, analytics, testes de performance e checklist de qualidade antes do ar.",
  },
  {
    icon: LifeBuoy,
    title: "5 · Suporte",
    time: "30-90 dias",
    desc: "Ajustes, monitoramento e melhorias contínuas. Você nunca fica sozinho depois da entrega.",
  },
];

const garantias = [
  { t: "Prazo combinado é prazo cumprido", d: "Cronograma por escrito antes de começar." },
  { t: "Você aprova antes de eu codar", d: "Nada é desenvolvido sem seu OK no design." },
  { t: "Código é seu", d: "Entrego repositório e acessos completos." },
  { t: "Resposta em até 24h", d: "Comunicação direta comigo, sem intermediários." },
];

function Processo() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="pt-8 pb-14 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/90">
            <Clock className="h-3.5 w-3.5 text-accent" /> Processo transparente · Sem surpresas
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05]">
            Do briefing ao <span className="text-gradient">no ar</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-white/70">
            Um método simples, previsível e testado em mais de 120 projetos.
          </p>
        </Reveal>
      </section>

      <section className="pb-8">
        <ol className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ icon: Icon, title, time, desc }, i) => (
            <Reveal as="li" key={title} delay={i * 80} className="list-none">
              <div className="glass-panel p-7 h-full hover-lift">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 animate-gradient-x">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="rounded-full glass px-3 py-1 text-[11px] font-semibold text-white/80">
                    {time}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-bold text-white">{title}</h2>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="py-16">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-black text-white text-center">
            Minhas <span className="text-gradient">garantias</span>
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {garantias.map((g, i) => (
            <Reveal key={g.t} delay={i * 70} variant={i % 2 ? "right" : "left"}>
              <div className="glass-panel p-6 h-full">
                <h3 className="font-bold text-white">{g.t}</h3>
                <p className="mt-1.5 text-sm text-white/70">{g.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 text-center">
          <Link
            to="/faq"
            className="inline-flex rounded-full glass px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5"
          >
            Ainda tem dúvidas? Veja o FAQ →
          </Link>
        </Reveal>
      </section>

      <section className="pb-20 grid gap-8 lg:grid-cols-2 items-center">
        <Reveal variant="left">
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Vamos começar sua <span className="text-gradient">descoberta</span>.
          </h2>
          <p className="mt-3 text-white/70 max-w-lg">
            Primeira conversa é gratuita e sem compromisso.
          </p>
        </Reveal>
        <Reveal variant="right" delay={80}>
          <ContactForm />
        </Reveal>
      </section>
    </div>
  );
}
