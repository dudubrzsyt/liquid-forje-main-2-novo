import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/Reveal";
import { DiamondBadge } from "@/components/DiamondBadge";
import {
  SENIORITY_LABEL,
  TIER_ORDER,
  TIERS,
  planWeight,
  type DiamondTier,
  type Seniority,
} from "@/lib/diamond";
import { Github, Linkedin, Search, Trophy, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/devs")({
  head: () => ({
    meta: [
      { title: "Ranking de Devs — Diamante.dev" },
      {
        name: "description",
        content:
          "Ranking de desenvolvedores verificados por IA: score em diamantes, stack, senioridade e disponibilidade real para novos projetos.",
      },
      { property: "og:title", content: "Ranking de Devs — Diamante.dev" },
      {
        property: "og:description",
        content:
          "Devs verificados no GitHub, com score de confiabilidade e disponibilidade em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DevsPage,
});

type DevRow = {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  stack: string[];
  seniority: Seniority;
  education: string;
  github_url: string;
  linkedin_url: string;
  avatar_url: string | null;
  score: number;
  tier: DiamondTier;
};

function DevsPage() {
  const [devs, setDevs] = useState<DevRow[]>([]);
  const [plans, setPlans] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<"todos" | DiamondTier>("todos");
  const [sen, setSen] = useState<"todos" | Seniority>("todos");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("dev_profiles")
        .select(
          "id,user_id,full_name,bio,stack,seniority,education,github_url,linkedin_url,avatar_url,score,tier",
        )
        .order("score", { ascending: false });
      const rows = (data ?? []) as DevRow[];
      setDevs(rows);
      if (rows.length) {
        const { data: subs } = await supabase
          .from("subscriptions")
          .select("user_id,plan")
          .in(
            "user_id",
            rows.map((r) => r.user_id),
          );
        setPlans(Object.fromEntries((subs ?? []).map((s) => [s.user_id, s.plan])));
      }
      setLoading(false);
    })();
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return devs
      .filter((d) => (tier === "todos" ? true : d.tier === tier))
      .filter((d) => (sen === "todos" ? true : d.seniority === sen))
      .filter((d) =>
        !term
          ? true
          : d.full_name.toLowerCase().includes(term) ||
            d.stack.join(" ").toLowerCase().includes(term) ||
            d.bio.toLowerCase().includes(term),
      )
      .sort(
        (a, b) => planWeight(plans[b.user_id]) - planWeight(plans[a.user_id]) || b.score - a.score,
      );
  }, [devs, plans, q, tier, sen]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <Reveal>
        <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-600">
          <Trophy size={14} /> Ranking verificado
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Devs disponíveis agora
        </h1>
        <p className="mt-3 max-w-2xl text-base opacity-70">
          Só aparecem aqui perfis com GitHub verificado, análise de IA aprovada, perfil completo,
          assinatura ativa e sem projeto em andamento.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-8 grid gap-3 rounded-3xl glass-panel p-4 sm:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/60 px-3 dark:bg-white/10">
            <Search size={16} className="opacity-50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, stack ou palavra-chave"
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as never)}
            className="rounded-xl border border-white/15 bg-white/60 px-3 py-3 text-sm dark:bg-white/10"
          >
            <option value="todos">Todos os diamantes</option>
            {TIER_ORDER.map((t) => (
              <option key={t} value={t}>
                {TIERS[t].label}
              </option>
            ))}
          </select>
          <select
            value={sen}
            onChange={(e) => setSen(e.target.value as never)}
            className="rounded-xl border border-white/15 bg-white/60 px-3 py-3 text-sm dark:bg-white/10"
          >
            <option value="todos">Toda senioridade</option>
            {(Object.keys(SENIORITY_LABEL) as Seniority[]).map((s) => (
              <option key={s} value={s}>
                {SENIORITY_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </Reveal>

      {loading ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl bg-slate-200/50" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-12 rounded-3xl glass-panel p-10 text-center">
          <h2 className="text-xl font-bold">Nenhum dev no ranking ainda</h2>
          <p className="mx-auto mt-2 max-w-md text-sm opacity-70">
            Seja o primeiro: envie seu perfil, passe pela análise de IA e ative uma assinatura para
            aparecer aqui.
          </p>
          <Link
            to="/cadastro-dev"
            className="mt-5 inline-flex rounded-xl bg-yellow-300  to-amber-500 shadow-lg shadow-amber-400/30 hover:brightness-110 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Cadastre-se como dev
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d, i) => (
            <Reveal key={d.id} as="li" delay={i * 50}>
              <article className="group h-full rounded-3xl glass-panel p-5 hover-lift">
                <div className="flex items-start gap-3">
                  <div className="rainbow-ring shrink-0 rounded-full p-[2px]">
                    <img
                      src={
                        d.avatar_url ||
                        `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(d.full_name)}`
                      }
                      alt={`Avatar de ${d.full_name}`}
                      loading="lazy"
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="truncate text-base font-bold">{d.full_name}</h2>
                      <BadgeCheck size={15} className="shrink-0 text-sky-500" />
                    </div>
                    <p className="text-xs opacity-60">
                      {SENIORITY_LABEL[d.seniority]} · #{i + 1} no ranking
                      {planWeight(plans[d.user_id]) === 2 && (
                        <span className="ml-1 font-bold text-sky-600">Elite</span>
                      )}
                    </p>
                  </div>
                  <DiamondBadge tier={d.tier} size={30} />
                </div>

                <p className="mt-3 line-clamp-3 text-sm opacity-75">{d.bio}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {d.stack.slice(0, 6).map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-white/20 bg-white/50 px-2.5 py-1 text-[11px] font-semibold dark:bg-white/10"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                  <span className="text-xs font-bold">
                    {TIERS[d.tier].label} · {d.score}
                  </span>
                  <span className="flex items-center gap-2">
                    <a
                      href={d.github_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub"
                      className="rounded-lg p-2 transition-colors hover:bg-white/40"
                    >
                      <Github size={16} />
                    </a>
                    <a
                      href={d.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="LinkedIn"
                      className="rounded-lg p-2 transition-colors hover:bg-white/40"
                    >
                      <Linkedin size={16} />
                    </a>
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
