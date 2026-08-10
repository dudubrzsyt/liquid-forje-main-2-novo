import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { getPost, formatDate, BLOG_POSTS } from "@/lib/blog";
import { Comments } from "@/components/Comments";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Artigo indisponível — Diamante.dev" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — Diamante.dev` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: BlogPostPage,
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center text-white/70">
      Não foi possível carregar o artigo.
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-3xl font-black text-white">Artigo não encontrado</h1>
      <Link
        to="/blog"
        className="mt-6 inline-flex rounded-full glass px-5 py-2.5 text-sm font-semibold text-white"
      >
        Voltar ao blog
      </Link>
    </div>
  ),
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const post = getPost(slug)!;
  const related = BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && p.category === post.category,
  ).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
      <Link
        to="/blog"
        className="mt-6 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" /> Todos os artigos
      </Link>

      <header className="mt-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {post.category}
        </span>
        <h1 className="mt-3 text-3xl md:text-5xl font-black leading-tight text-white">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/50">
          <span>{formatDate(post.date)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.readingMinutes} min de leitura
          </span>
        </div>
      </header>

      <div className="mt-8 glass-panel overflow-hidden">
        <img
          src={post.cover}
          alt={post.title}
          width={1280}
          height={720}
          className="w-full object-cover"
        />
      </div>

      <div className="mt-10 space-y-6">
        {post.body.map((b, i) => (
          <Reveal key={i} delay={i * 40}>
            {b.h && <h2 className="text-xl md:text-2xl font-black text-white mb-2">{b.h}</h2>}
            <p className="text-[17px] leading-relaxed text-white/75">{b.p}</p>
          </Reveal>
        ))}
      </div>

      <Comments blogSlug={post.slug} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-black text-white">Leia também</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                to="/blog/$slug"
                params={{ slug: r.slug }}
                className="glass rounded-2xl p-4 hover-lift"
              >
                <span className="text-[11px] uppercase tracking-wider text-accent">
                  {r.category}
                </span>
                <h3 className="mt-1 text-sm font-semibold text-white leading-snug">{r.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-20">
        <h2 className="text-center text-2xl md:text-3xl font-black text-white">
          Quer um site assim de bem feito?
        </h2>
        <p className="mt-2 text-center text-white/70">
          Me conte seu projeto — respondo em até 24h.
        </p>
        <div className="mt-6 flex justify-center">
          <ContactForm />
        </div>
      </section>
    </article>
  );
}
