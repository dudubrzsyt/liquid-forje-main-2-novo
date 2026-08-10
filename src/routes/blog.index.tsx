import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Clock, ArrowUpRight } from "lucide-react";
import { BLOG_CATEGORIES, BLOG_POSTS, formatDate } from "@/lib/blog";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Diamante.dev" },
      {
        name: "description",
        content:
          "Artigos sobre desenvolvimento, performance, design e conversão para quem quer um site que gera resultado.",
      },
      { property: "og:title", content: "Blog — Diamante.dev" },
      {
        property: "og:description",
        content: "Conteúdo técnico e prático sobre criação de sites, performance e vendas online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("Todos");

  const posts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOG_POSTS.filter((p) => {
      const okCat = cat === "Todos" || p.category === cat;
      const okQ = !q || `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [query, cat]);

  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
      <section className="pt-8 pb-10 md:pt-14">
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/90">
            Conteúdo novo toda semana
          </span>
          <h1 className="mt-5 text-4xl font-black leading-[1.05] sm:text-5xl md:text-6xl text-white">
            O <span className="text-gradient">blog</span> de quem constrói.
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Bastidores técnicos, decisões de arquitetura e o que realmente move o ponteiro de
            faturamento em um site.
          </p>
        </Reveal>

        <Reveal className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar artigo..."
              aria-label="Buscar artigo"
              className="w-full rounded-full bg-white/5 border border-white/15 pl-11 pr-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {BLOG_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  cat === c
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25"
                    : "glass text-white/80 hover:-translate-y-0.5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      {posts.length === 0 && (
        <p className="glass-panel p-10 text-center text-white/70">
          Nenhum artigo encontrado para essa busca.
        </p>
      )}

      {featured && (
        <Reveal>
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="group block glass-panel overflow-hidden hover-lift"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={featured.cover}
                  alt={featured.title}
                  width={1280}
                  height={720}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-7 md:p-10 flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {featured.category}
                </span>
                <h2 className="mt-3 text-2xl md:text-3xl font-black text-white leading-tight">
                  {featured.title}
                </h2>
                <p className="mt-3 text-white/70">{featured.excerpt}</p>
                <div className="mt-5 flex items-center gap-4 text-xs text-white/50">
                  <span>{formatDate(featured.date)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {featured.readingMinutes} min
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 font-semibold text-white/80 group-hover:text-white">
                    Ler artigo{" "}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </Reveal>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p, i) => (
          <Reveal key={p.slug} delay={i * 60}>
            <Link
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group flex h-full flex-col glass-panel overflow-hidden hover-lift"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={p.cover}
                  alt={p.title}
                  width={1280}
                  height={720}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                  {p.category}
                </span>
                <h3 className="mt-2 text-lg font-bold text-white leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-white/65 flex-1">{p.excerpt}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-white/50">
                  <span>{formatDate(p.date)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {p.readingMinutes} min
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <section className="mt-24">
        <Reveal className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Gostou do conteúdo? <span className="text-gradient">Vamos aplicar</span> no seu site.
          </h2>
          <p className="mt-3 text-white/70">Conte sua ideia e receba uma proposta em até 24h.</p>
        </Reveal>
        <Reveal className="flex justify-center">
          <ContactForm />
        </Reveal>
      </section>
    </div>
  );
}
