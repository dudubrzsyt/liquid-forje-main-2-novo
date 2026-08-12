import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { submitDevProfile } from "@/lib/devs.functions";
import { Reveal } from "@/components/Reveal";
import { DiamondBadge } from "@/components/DiamondBadge";
import { SENIORITY_LABEL, type Seniority, TIER_ORDER, TIERS } from "@/lib/diamond";
import { Sparkles, Github, Linkedin, ShieldCheck, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cadastro-dev")({
  head: () => ({
    meta: [
      { title: "Cadastre-se como Dev — Diamante.dev" },
      { name: "description", content: "Envie seu perfil, tenha o GitHub analisado por IA e receba seu score em diamantes para aparecer no ranking de devs da Diamante.dev." },
      { property: "og:title", content: "Cadastre-se como Dev — Diamante.dev" },
      { property: "og:description", content: "Análise de GitHub com IA, score em diamantes e ranking de desenvolvedores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CadastroDevPage,
});

const seniorities: Seniority[] = ["estagiario", "junior", "pleno", "senior", "especialista"];

function CadastroDevPage() {
  const submit = useServerFn(submitDevProfile);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score?: number; tier?: string; approved?: boolean; summary?: string } | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    age: "",
    bio: "",
    stack: "",
    seniority: "pleno" as Seniority,
    education: "",
    github_url: "",
    linkedin_url: "",
    avatar_url: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUserId(u?.id ?? null);
      if (u?.email) setForm((f) => ({ ...f, email: f.email || u.email! }));
    });
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await submit({
        data: {
          full_name: form.full_name,
          email: form.email,
          age: Number(form.age),
          bio: form.bio,
          stack: form.stack.split(",").map((s) => s.trim()).filter(Boolean),
          seniority: form.seniority,
          education: form.education,
          github_url: form.github_url,
          linkedin_url: form.linkedin_url,
          avatar_url: form.avatar_url || null,
        },
      });
      if (!res.ok) {
        toast.error(res.error);
      } else if (!res.verified) {
        toast.warning(res.message);
      } else {
        setResult(res);
        toast.success("Análise concluída: seu perfil está ativo e validado pela inteligência da plataforma. ");
      }
    } catch {
      toast.error("Ops! Confira os campos: a biografia deve ter entre 30 e 40 caracteres e os links precisam estar corretos.")


    } finally {
      setLoading(false);
    }
  }

  const field = "w-full rounded-xl border border-white/15 bg-white/60 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400/60 focus:bg-white focus:ring-4 focus:ring-sky-400/15 dark:bg-white/10 dark:text-white";

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <Reveal>
        <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-600">
          <Sparkles size={14} /> Programa de devs
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Cadastre-se como Dev</h1>
        <p className="mt-3 max-w-2xl text-base opacity-70">
          Seu GitHub é verificado e analisado por IA para gerar um score de confiabilidade em diamantes. Quanto melhor o histórico
          público e o plano de assinatura, mais alto você aparece no ranking.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl glass-panel p-4 text-sm">
          <Clock size={16} className="text-sky-500" />
          <span className="font-semibold">Seu perfil será analisado pela IA em até 30–60 minutos.</span>
          <span className="opacity-60">Na maioria dos casos o resultado sai em segundos.</span>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {TIER_ORDER.map((t) => (
            <div key={t} className="flex items-center gap-3 rounded-2xl glass p-3 hover-lift">
              <DiamondBadge tier={t} size={26} />
              <div className="text-xs">
                <div className="font-bold">{TIERS[t].label}</div>
                <div className="opacity-60">score ≥ {TIERS[t].min}</div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {!userId ? (
        <Reveal delay={160}>
          <div className="mt-10 rounded-3xl glass-panel p-8 text-center">
            <ShieldCheck className="mx-auto text-sky-500" size={32} />
            <h2 className="mt-3 text-xl font-bold">Entre para enviar seu perfil</h2>
            <p className="mt-2 text-sm opacity-70">Precisamos de uma conta para vincular seu score, assinatura e histórico.</p>
            <Link
              to="/auth"
              className="mt-5 inline-flex rounded-xl bg-yellow-300  to-amber-500 shadow-lg shadow-amber-400/30 hover:brightness-110 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              Entrar ou criar conta
            </Link>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={160}>
          <form onSubmit={onSubmit} className="mt-10 grid gap-4 rounded-3xl glass-panel p-6 sm:p-8 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold">
              Nome completo
              <input required minLength={3} className={field} value={form.full_name} onChange={set("full_name")} placeholder="Seu nome" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              E-mail
              <input required type="email" className={field} value={form.email} onChange={set("email")} placeholder="voce@email.com" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Idade
              <input required type="number" min={14} max={99} className={field} value={form.age} onChange={set("age")} placeholder="24" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Senioridade
              <select className={field} value={form.seniority} onChange={set("seniority")}>
                {seniorities.map((s) => (
                  <option key={s} value={s}>{SENIORITY_LABEL[s]}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-semibold md:col-span-2">
              Biografia <span className="font-normal opacity-60">(mínimo 40 caracteres)</span>
              <textarea required minLength={40} maxLength={1500} rows={4} className={field} value={form.bio} onChange={set("bio")} placeholder="Conte sua experiência, projetos e o que você entrega melhor." />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold md:col-span-2">
              Stack <span className="font-normal opacity-60">(separe por vírgula)</span>
              <input required className={field} value={form.stack} onChange={set("stack")} placeholder="React, TypeScript, Node, PostgreSQL" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold md:col-span-2">
              Graduações e certificações
              <textarea required rows={2} className={field} value={form.education} onChange={set("education")} placeholder="Ciência da Computação — USP; AWS Solutions Architect" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5"><Github size={14} /> Link do GitHub</span>
              <input required className={field} value={form.github_url} onChange={set("github_url")} placeholder="https://github.com/seu-usuario" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5"><Linkedin size={14} /> Link do LinkedIn</span>
              <input required type="url" className={field} value={form.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/voce" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold md:col-span-2">
              Avatar (URL da imagem)
              <input className={field} value={form.avatar_url} onChange={set("avatar_url")} placeholder="https://..." />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? <><Loader2 className="animate-spin" size={16} /> Analisando seu GitHub com IA…</> : <>Enviar para análise</>}
            </button>
          </form>
        </Reveal>
      )}

      {result && (
        <Reveal>
          <div className="mt-8 rounded-3xl glass-panel p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-4">
              <DiamondBadge tier={(result.tier as never) ?? "negro"} size={44} />
              <div>
                <div className="text-2xl font-black">Score {result.score}</div>
                <div className="text-sm opacity-70">
                  {result.approved ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600"><CheckCircle2 size={14} /> Perfil aprovado</span>
                  ) : (
                    "Perfil em análise manual — nossa equipe revisa em até 60 minutos."
                  )}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm opacity-80">{result.summary}</p>
            <Link to="/assinaturas" className="mt-5 inline-flex rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
              Ativar assinatura para entrar no ranking
            </Link>
          </div>
        </Reveal>
      )}
    </div>
  );
}
