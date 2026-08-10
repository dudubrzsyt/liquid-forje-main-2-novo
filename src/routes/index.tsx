import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import showcase1 from "@/assets/showcase-1.jpg";
import showcase2 from "@/assets/showcase-2.jpg";
import showcase3 from "@/assets/showcase-3.jpg";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { Sparkles, Zap, ShieldCheck, Rocket, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diamante.dev — Sites modernos que vendem" },
      {
        name: "description",
        content:
          "Landing pages, institucionais, e-commerce e projetos premium — design sofisticado, performance real e conversão.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      {/* HERO FULLSCREEN */}
      <section
        aria-label="Hero"
        className="relative h-screen md:h-[100vh] w-full"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundPosition: "center top",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* overlay sutil para garantir contraste (ajustável) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.35)] via-[rgba(0,0,0,0.18)] to-[rgba(255,255,255,0.02)] backdrop-blur-sm" />

        {/* conteúdo centralizado */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 h-full flex items-center">
          <div className="w-full">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <Reveal className="animate-fade-up">
                <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/90">
                  <Sparkles className="h-3.5 w-3.5 text-accent" /> Novo · Design iOS 27 · Shaders
                  líquidos
                </span>

                <h1
                  className="mt-5 text-4xl font-black leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl"
                  style={{ WebkitTextStroke: "0.4px rgba(0,0,0,0.6)" }}
                >
                  <span className="text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
                    Sites
                  </span>{" "}
                  <span className="text-gradient bg-clip-text text-transparent">
                    agressivamente
                  </span>{" "}
                  <span className="text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
                    modernos.
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-lg text-white/85 leading-relaxed">
                  Design sofisticado, performance real e experiências que convertem. Do landing page
                  ao e-commerce corporativo — feitos à mão em TypeScript.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/vendas"
                    className="group relative overflow-hidden rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-6 py-3.5 font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition hover:bg-[position:100%_0] focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    Ver pacotes{" "}
                    <ArrowRight className="ml-1 inline h-4 w-4 group-hover:translate-x-1 transition" />
                  </Link>

                  <Link
                    to="/contato"
                    className="rounded-full glass px-6 py-3.5 font-semibold text-white hover:bg-white/15 transition focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    Falar comigo
                  </Link>
                </div>

                <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
                  {[
                    { k: "Prêmio", v: "Diferencial" },
                    { k: "+59", v: "projetos" },
                    { k: "99", v: "PageSpeed" },
                    { k: "24h", v: "resposta" },
                    { k: "Premium", v: "Beleza" },
                    { k: "+30%", v: "conversão" },
                  ].map((s) => (
                    <div key={s.v} className="glass rounded-2xl p-3 text-center">
                      <div className="text-2xl font-black text-white">{s.k}</div>
                      <div className="text-[11px] uppercase tracking-wider text-white/60">
                        {s.v}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* mockup / destaque à direita (ajustado: desce um pouco e imagem mais visível) */}
              <div className="relative animate-fade-up" style={{ animationDelay: "150ms" }}>
                {/* brilho/halo mais sutil */}
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-2xl pointer-events-none" />

                {/* deslocamento para baixo em telas maiores para "tirar a barra branca" */}
                <div className="relative glass-panel overflow-hidden animate-float rounded-[1.25rem] shadow-2xl transform translate-y-3 md:translate-y-6 lg:translate-y-10">
                  <img
                    src={heroImg}
                    alt="Mockups de sites modernos"
                    width={1600}
                    height={1008}
                    className="w-full h-full object-cover"
                    fetchPriority="high"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* indicador de scroll */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <a href="#features" className="flex flex-col items-center gap-2 group">
            <span className="block h-10 w-6 rounded-full border-2 border-white/60 flex items-start justify-center p-1">
              <span className="block h-2 w-2 rounded-full bg-white/80 animate-bounce" />
            </span>
            <span className="text-xs text-white/80">Role para ver</span>
          </a>
        </div>
      </section>

      {/* RESTO DA PÁGINA: fundo branco */}
      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* FEATURES */}
          <section id="features" className="py-20">
            <Reveal className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900">
                Por que meus sites <span className="text-gradient">convertem</span>
              </h2>
              <p className="mt-4 text-slate-700">
                Cada detalhe pensado pra atrair confiança e valorizar seu produto.
              </p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Zap,
                  title: "Performance brutal",
                  desc: "Otimizado para celular, PC, tablet e TV. Score 95+ no Lighthouse.",
                },
                {
                  icon: ShieldCheck,
                  title: "Confiança visual",
                  desc: "Design premium com vidro, shaders e tipografia sob medida.",
                },
                {
                  icon: Rocket,
                  title: "Pronto pra escalar",
                  desc: "Arquitetura moderna em TypeScript, APIs integradas e SEO nativo.",
                },
              ].map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title} delay={i * 90} variant="zoom" className="h-full">
                  <div className="bg-white border border-slate-100 p-7 h-full rounded-2xl hover:shadow-lg transition hover-lift">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent mb-4 shadow-sm">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* SHOWCASE com hover overlay */}
          <section className="py-20">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900">
                  Vitrine <span className="text-gradient">visual</span>
                </h2>
                <p className="mt-2 text-slate-600">Um gosto do que entregamos.</p>
              </div>
              <Link
                to="/vendas"
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-900 border border-slate-200 hover:bg-slate-50 transition"
              >
                Ver todos os pacotes →
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[showcase1, showcase2, showcase3].map((src, i) => (
                <Reveal key={i} delay={i * 100} variant="blur">
                  <Link
                    to="/portfolio"
                    className="group relative overflow-hidden rounded-2xl aspect-[4/3] block"
                    aria-label={`Ver projeto ${i + 1}`}
                  >
                    <img
                      src={src}
                      alt={`Showcase ${i + 1}`}
                      width={1200}
                      height={800}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* overlay que aparece ao hover / touch */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/60 transition-colors duration-300">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-6">
                        <h3 className="text-lg font-bold text-white">Projeto {i + 1}</h3>
                        <p className="mt-2 text-sm text-white/90">
                          Design, performance e conversão.
                        </p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          {/* EXPLORE */}
          <section className="py-16">
            <Reveal className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900">
                Explore <span className="text-gradient">antes de decidir</span>
              </h2>
              <p className="mt-4 text-slate-600">
                Cases, método de trabalho e respostas para todas as dúvidas.
              </p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  to: "/portfolio" as const,
                  title: "Portfólio",
                  desc: "Cases reais com métricas de conversão e performance.",
                },
                {
                  to: "/processo" as const,
                  title: "Processo",
                  desc: "As 5 etapas do briefing ao lançamento, com prazos.",
                },
                {
                  to: "/faq" as const,
                  title: "FAQ",
                  desc: "Prazos, pagamento, domínio, manutenção e garantias.",
                },
              ].map((c, i) => (
                <Reveal key={c.to} delay={i * 90} variant="zoom" className="h-full">
                  <Link
                    to={c.to}
                    className="group bg-white border border-slate-100 p-7 h-full flex flex-col rounded-2xl hover:shadow-lg transition"
                  >
                    <h3 className="text-xl font-bold text-slate-900">{c.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">{c.desc}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                      Ver mais{" "}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          {/* CONTACT */}
          <section id="contato" className="py-20">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <Reveal variant="left">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900">
                  Vamos criar <span className="text-gradient">algo memorável</span>.
                </h2>
                <p className="mt-4 text-slate-600 max-w-lg">
                  Preencha o formulário e envio direto pro meu WhatsApp. Respondo em até 24h com um
                  plano personalizado.
                </p>
              </Reveal>
              <Reveal variant="right" delay={80}>
                <ContactForm />
              </Reveal>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
