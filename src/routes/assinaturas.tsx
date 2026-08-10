import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/Reveal";
import { PLANS, type PlanId } from "@/lib/diamond";
import {
  Check,
  Crown,
  Gem,
  ShieldCheck,
  CalendarClock,
  Loader2,
  ArrowRight,
  KeyRound,
  Star,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const Route = createFileRoute("/assinaturas")({
  head: () => ({
    meta: [
      { title: "Assinaturas para Devs — Diamante.dev" },
      {
        name: "description",
        content:
          "Planos Básico Rubi/Diamante Negro (R$45) e Elite com IA (R$85) para devs aparecerem no ranking, com pagamento retido até a aprovação do cliente.",
      },
      { property: "og:title", content: "Assinaturas para Devs — Diamante.dev" },
      {
        property: "og:description",
        content:
          "Escolha seu plano, suba no ranking e receba com segurança: valor retido até o cliente aprovar a entrega.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssinaturasPage,
});

type Sub = {
  plan: PlanId;
  status: string;
  amount_cents: number;
  payment_day: number | null;
  current_period_end: string | null;
  current_period_start: string | null;
};

type Event = {
  id: string;
  kind: string;
  amount_cents: number | null;
  detail: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  ativa: { label: "Ativa", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  pendente: {
    label: "Pagamento pendente",
    className: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  },
  expirada: { label: "Expirada", className: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
};

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function AssinaturasPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [sub, setSub] = useState<Sub | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [busy, setBusy] = useState<PlanId | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;
      const { data: s } = await supabase
        .from("subscriptions")
        .select("plan,status,amount_cents,payment_day,current_period_end,current_period_start")
        .eq("user_id", uid)
        .maybeSingle();
      setSub((s as Sub) ?? null);
      const { data: ev } = await supabase
        .from("subscription_events")
        .select("id,kind,amount_cents,detail,created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(12);
      setEvents((ev ?? []) as Event[]);
    });
  }, []);

  async function choose(plan: PlanId) {
    if (!userId) return;
    setBusy(plan);
    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        plan,
        amount_cents: PLANS[plan].priceCents,
        payment_day: new Date().getDate(),
        status: "ativa",
        current_period_start: new Date().toISOString(),
        current_period_end: null,
      },
      { onConflict: "user_id" },
    );
    setBusy(null);
    if (error) {
      toast.error("Não foi possível registrar o plano. Tente novamente.");
      return;
    }
    setSub((prev) => ({
      plan,
      status: prev?.status === "ativa" ? "ativa" : "pendente",
      amount_cents: PLANS[plan].priceCents,
      payment_day: new Date().getDate(),
      current_period_start: prev?.current_period_start ?? null,
      current_period_end: prev?.current_period_end ?? null,
    }));
    toast.success(`Plano ${PLANS[plan].name} reservado. Conclua o pagamento para ativar.`);
  }

  const status = sub ? (STATUS_LABEL[sub.status] ?? STATUS_LABEL.pendente) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <Reveal>
        <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-600">
          <Gem size={14} /> Assinaturas
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Suba no ranking. Receba com segurança.
        </h1>
        <p className="mt-3 max-w-2xl text-base opacity-70">
          A assinatura libera sua presença no ranking público e o contato direto com clientes. O
          valor de cada projeto fica retido na plataforma até o cliente aprovar a entrega.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((id, i) => {
          const p = PLANS[id];
          const active = sub?.plan === id;
          const elite = id === "elite";
          return (
            <Reveal key={id} delay={i * 90}>
              <article
                className={`relative flex h-full flex-col rounded-3xl glass-panel p-6 sm:p-8 hover-lift ${
                  elite ? "ring-2 ring-sky-400/40" : ""
                }`}
              >
                {elite && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    Mais escolhido
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {elite ? (
                    <Crown size={20} className="text-sky-500" />
                  ) : (
                    <Gem size={20} className="text-rose-500" />
                  )}
                  <h2 className="text-lg font-bold">{p.name}</h2>
                </div>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-black">{p.price}</span>
                  {"oldPrice" in p && p.oldPrice && (
                    <span className="pb-1 text-sm line-through opacity-50">{p.oldPrice}</span>
                  )}
                </div>
                <p className="mt-1 text-xs uppercase tracking-wider opacity-60">{p.note}</p>

                <ul className="mt-5 grid gap-2.5 text-sm">
                  {p.benefits.map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                      <span className="opacity-80">{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  {userId ? (
                    <>
                      <button
                        onClick={() => choose(id)}
                        disabled={busy === id}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 ${
                          elite
                            ? "bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white shadow-lg shadow-sky-500/25"
                            : "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30 hover:brightness-110"
                        }`}
                      >
                        {busy === id ? <Loader2 size={16} className="animate-spin" /> : null}
                        {active ? "Plano selecionado" : `Assinar por ${p.price}/mês`}
                      </button>

                      {/* Ícone abaixo do botão */}

                      <div className="flex justify-center mt-2">
                        {elite ? (
                          // Ícone coroa para plano azul
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-indigo-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 19h14l-2-9-5 5-5-5-2 9z" />
                          </svg>
                        ) : (
                          // Ícone rubi para plano vermelho
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l4 4-4 16-4-16 4-4z" />
                          </svg>
                        )}
                      </div>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                    >
                      Entrar para assinar <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={120}>
        <section className="mt-12 rounded-3xl glass-panel p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <CalendarClock size={18} className="text-sky-500" /> Painel da assinatura
          </h2>

          {!userId ? (
            <p className="mt-3 text-sm opacity-70">
              <Lock size={14} className="mr-1 inline" /> Entre na sua conta para ver status, valores
              e histórico.
            </p>
          ) : !sub ? (
            <p className="mt-3 text-sm opacity-70">
              Você ainda não escolheu um plano. Selecione uma das opções acima.
            </p>
          ) : (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl glass p-4">
                  <div className="text-xs uppercase tracking-wider opacity-60">Status</div>
                  <div
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${status?.className}`}
                  >
                    {status?.label}
                  </div>
                </div>
                <div className="rounded-2xl glass p-4">
                  <div className="text-xs uppercase tracking-wider opacity-60">Plano e valor</div>
                  <div className="mt-2 text-sm font-bold">{PLANS[sub.plan].name}</div>
                  <div className="text-sm opacity-70">{brl(sub.amount_cents)} / mês</div>
                </div>
                <div className="rounded-2xl glass p-4">
                  <div className="text-xs uppercase tracking-wider opacity-60">
                    Dia de pagamento
                  </div>
                  <div className="mt-2 text-sm font-bold">
                    {sub.payment_day ? `Dia ${sub.payment_day}` : "—"}
                  </div>
                </div>
                <div className="rounded-2xl glass p-4">
                  <div className="text-xs uppercase tracking-wider opacity-60">
                    Vencimento (30 dias)
                  </div>
                  <div className="mt-2 text-sm font-bold">
                    {sub.current_period_end
                      ? new Date(sub.current_period_end).toLocaleDateString("pt-BR")
                      : "Aguardando pagamento"}
                  </div>
                </div>
              </div>

              <h3 className="mt-8 text-sm font-bold uppercase tracking-wider opacity-70">
                Histórico
              </h3>
              {events.length === 0 ? (
                <p className="mt-2 text-sm opacity-60">Nenhum lançamento ainda.</p>
              ) : (
                <ul className="mt-3 divide-y divide-white/10 overflow-hidden rounded-2xl glass">
                  {events.map((e) => (
                    <li
                      key={e.id}
                      className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
                    >
                      <span className="font-semibold">{e.kind}</span>
                      <span className="opacity-70">{e.detail}</span>
                      <span className="opacity-60">
                        {e.amount_cents ? brl(e.amount_cents) : ""}
                      </span>
                      <span className="text-xs opacity-50">
                        {new Date(e.created_at).toLocaleString("pt-BR")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </Reveal>

      <Reveal delay={160}>
        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              t: "Pagamento retido",
              d: "O valor do projeto fica retido na plataforma e só é liberado após a aprovação do cliente.",
            },
            {
              icon: Gem,
              t: "Score justo",
              d: "Assinatura pesa no ranking, mas o score vem da análise de IA sobre seu GitHub real.",
            },
            {
              icon: Crown,
              t: "Antifraude",
              d: "Dev com projeto em andamento sai automaticamente da lista de disponíveis.",
            },
            {
              icon: KeyRound,
              t: "Acesso seguro",
              d: "Somente você controla sua conta e projetos, com autenticação reforçada.",
            },
            {
              icon: Lock,
              t: "Proteção total",
              d: "Todos os dados ficam criptografados e protegidos contra fraudes.",
            },
            {
              icon: Star,
              t: "Destaque garantido",
              d: "Assinantes aparecem em posição privilegiada no ranking da plataforma.",
            },
          ].map(({ icon: Icon, t, d }, i) => (
            <div
              key={t}
              className="rounded-3xl glass p-5 hover-lift"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Icon size={20} className="text-sky-500" />
              <h3 className="mt-3 text-sm font-bold">{t}</h3>
              <p className="mt-1 text-sm opacity-70">{d}</p>
            </div>
          ))}
        </section>
      </Reveal>
    </div>
  );
}
