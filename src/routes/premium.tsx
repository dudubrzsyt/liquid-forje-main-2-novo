import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Crown,
  Gem,
  Building2,
  Rocket,
  Check,
  Quote,
  ShieldCheck,
  Timer,
  ArrowRight,
} from "lucide-react";
import premiumHero from "@/assets/premium-hero.jpg";
import showcase1 from "@/assets/showcase-1.jpg";
import showcase2 from "@/assets/showcase-2.jpg";
import showcase3 from "@/assets/showcase-3.jpg";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Diferencial Premium — Diamante.dev" },
      {
        name: "description",
        content:
          "Projetos de alto valor: e-commerce, plataformas premium e ecossistemas corporativos de R$ 25 mil a R$ 1 milhão.",
      },
      { property: "og:title", content: "Diferencial Premium — Diamante.dev" },
      {
        property: "og:description",
        content: "Faixas de investimento, cases e garantias para projetos digitais de alto valor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PremiumPage,
});

const tiers = [
  {
    icon: Gem,
    range: "R$ 25.000 — 50.000",
    name: "E-commerce Elite",
    line: "Loja completa com operação afinada para vender no primeiro mês.",
    items: [
      "Catálogo e checkout otimizados",
      "Integrações de pagamento e frete",
      "Painel de métricas de venda",
      "3 meses de acompanhamento",
    ],
  },
  {
    icon: Crown,
    range: "R$ 50.000 — 100.000",
    name: "Assinatura Premium",
    line: "Identidade visual exclusiva, shaders proprietários e direção de arte dedicada.",
    items: [
      "Design 100% autoral, zero template",
      "Motion e shaders sob medida",
      "Testes A/B na primeira dobra",
      "6 meses de evolução contínua",
    ],
    highlight: true,
  },
  {
    icon: Building2,
    range: "R$ 100.000 — 500.000",
    name: "Plataforma Corporativa",
    line: "Produto digital com múltiplos perfis, integrações e governança.",
    items: [
      "Arquitetura multi-perfil",
      "Integrações com ERP/CRM",
      "SLA e ambiente de homologação",
      "Documentação e treinamento",
    ],
  },
  {
    icon: Rocket,
    range: "R$ 500.000 — 1.000.000+",
    name: "Ecossistema Sob Medida",
    line: "Vários produtos, squad dedicada e roadmap trimestral.",
    items: [
      "Squad alocada ao seu roadmap",
      "Design system proprietário",
      "Auditoria de segurança e carga",
      "Comitê mensal com diretoria",
    ],
  },
];

const cases = [
  {
    img: showcase1,
    tag: "Varejo de luxo",
    metric: "+312%",
    desc: "de receita online em 8 meses após a reconstrução completa da loja.",
  },
  {
    img: showcase2,
    tag: "Fintech",
    metric: "1,2s",
    desc: "de carregamento médio mesmo com dashboards pesados em tempo real.",
  },
  {
    img: showcase3,
    tag: "Indústria",
    metric: "R$ 4,7M",
    desc: "em pipeline gerado pelo novo portal corporativo no primeiro ano.",
  },
];

const testimonials = [
  {
    name: "Marina Vasques",
    role: "CMO · Rede de moda premium",
    text: "A entrega passou longe de site bonito: virou o principal canal de receita da marca. Cada detalhe tem intenção comercial.",
  },
  {
    name: "Rodrigo Salles",
    role: "CEO · Fintech B2B",
    text: "Foi o fornecedor mais organizado que já contratamos. Prazo, comunicação e uma execução técnica impecável.",
  },
  {
    name: "Cláudia Prado",
    role: "Diretora · Grupo industrial",
    text: "O portal elevou nossa percepção de marca perante clientes internacionais. Valeu cada centavo do investimento.",
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    t: "Contrato e escopo assinados",
    d: "Nada de surpresa: entregáveis, prazos e responsabilidades documentados.",
  },
  {
    icon: Timer,
    t: "Marcos quinzenais",
    d: "Você vê o projeto evoluindo a cada duas semanas, com ambiente de teste liberado.",
  },
  {
    icon: Crown,
    d: "Exclusividade de setor durante o projeto: não atendo concorrente direto no mesmo período.",
    t: "Exclusividade",
  },
];

function PremiumPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
      <section className="relative pt-8 pb-16 md:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/90">
              <Crown className="h-3.5 w-3.5 text-accent" /> Alto valor · Poucas vagas por trimestre
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] sm:text-5xl md:text-6xl text-white">
              O <span className="text-gradient">diferencial</span> de quem investe pesado.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/70">
              Projetos acima de R$ 25 mil recebem direção de arte exclusiva, engenharia dedicada e
              acompanhamento de resultado. Aqui a entrega é medida em receita, não em páginas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#faixas"
                className="rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-6 py-3.5 font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition hover:bg-[position:100%_0]"
              >
                Ver faixas de investimento
              </a>
              <Link
                to="/contato"
                className="rounded-full glass px-6 py-3.5 font-semibold text-white transition hover:bg-white/15"
              >
                Agendar conversa <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <Reveal variant="zoom" className="relative">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-tr from-primary/40 via-accent/25 to-transparent blur-3xl animate-aurora" />
            <div className="relative glass-panel overflow-hidden animate-float">
              <img
                src={premiumHero}
                alt="Projeto premium em tela ultrawide"
                width={1600}
                height={912}
                className="h-auto w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="faixas" className="py-16 scroll-mt-24">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white">
            Faixas de <span className="text-gradient">investimento</span>
          </h2>
          <p className="mt-4 text-white/70">
            Transparência total sobre o que muda a cada nível de complexidade.
          </p>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div
                className={`relative flex h-full flex-col rounded-3xl p-7 hover-lift ${t.highlight ? "glass-strong ring-2 ring-primary/40" : "glass-panel"}`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                    Mais escolhido
                  </span>
                )}
                <t.icon className="h-8 w-8 text-accent" />
                <p className="mt-5 text-sm font-semibold text-white/60">{t.range}</p>
                <h3 className="mt-1 text-xl font-black text-white">{t.name}</h3>
                <p className="mt-2 text-sm text-white/65">{t.line}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {t.items.map((it) => (
                    <li key={it} className="flex gap-2 text-sm text-white/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {it}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contato"
                  className="mt-6 inline-flex justify-center rounded-xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[position:100%_0]"
                >
                  Solicitar proposta
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-6 glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/60">
                  <th className="p-4 font-semibold">Comparativo</th>
                  <th className="p-4 font-semibold">25k–50k</th>
                  <th className="p-4 font-semibold">50k–100k</th>
                  <th className="p-4 font-semibold">100k–500k</th>
                  <th className="p-4 font-semibold">500k–1M+</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                {[
                  [
                    "Direção de arte exclusiva",
                    "Parcial",
                    "Total",
                    "Total",
                    "Total + design system",
                  ],
                  ["Prazo médio", "6–8 semanas", "10–14 semanas", "4–6 meses", "Roadmap contínuo"],
                  [
                    "Time alocado",
                    "1 dev + design",
                    "Squad enxuta",
                    "Squad completa",
                    "Squad dedicada",
                  ],
                  ["Suporte incluso", "3 meses", "6 meses", "12 meses + SLA", "SLA corporativo"],
                ].map((row) => (
                  <tr
                    key={row[0]}
                    className="border-b border-white/5 last:border-0 transition hover:bg-white/5"
                  >
                    {row.map((cell, idx) => (
                      <td
                        key={idx}
                        className={`p-4 ${idx === 0 ? "font-semibold text-white" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      <section className="py-16">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white">
            Cases de <span className="text-gradient">alto valor</span>
          </h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {cases.map((c, i) => (
            <Reveal key={c.tag} delay={i * 80}>
              <div className="group h-full overflow-hidden glass-panel hover-lift">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={c.img}
                    alt={`Case ${c.tag}`}
                    width={1280}
                    height={800}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {c.tag}
                  </span>
                  <div className="mt-2 text-4xl font-black text-white">{c.metric}</div>
                  <p className="mt-2 text-sm text-white/65">{c.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-16">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white">
            Quem já <span className="text-gradient">investiu</span>
          </h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <figure className="h-full glass-panel p-7 hover-lift">
                <Quote className="h-7 w-7 text-accent" />
                <blockquote className="mt-4 text-white/80 leading-relaxed">"{t.text}"</blockquote>
                <figcaption className="mt-5">
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/55">{t.role}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-10">
        <div className="grid gap-5 md:grid-cols-3">
          {guarantees.map((g, i) => (
            <Reveal key={g.t} delay={i * 70}>
              <div className="h-full glass rounded-3xl p-6 hover-lift">
                <g.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-3 font-bold text-white">{g.t}</h3>
                <p className="mt-1.5 text-sm text-white/65">{g.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-16">
        <Reveal className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Vamos desenhar seu <span className="text-gradient">projeto premium</span>
          </h2>
          <p className="mt-3 text-white/70">
            Descreva o desafio. Você recebe escopo, prazo e faixa de investimento em até 24h.
          </p>
        </Reveal>
        <Reveal className="flex justify-center">
          <ContactForm />
        </Reveal>
      </section>
    </div>
  );
}
