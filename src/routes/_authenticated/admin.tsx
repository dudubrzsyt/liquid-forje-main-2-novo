import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/Reveal";
import { DiamondBadge } from "@/components/DiamondBadge";
import { PLANS, SENIORITY_LABEL, type DiamondTier, type Seniority } from "@/lib/diamond";
import { ShieldAlert, Users, CreditCard, ScrollText, Check, X, Loader2, Power } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type DevRow = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: "em_analise" | "aprovado" | "rejeitado";
  score: number;
  tier: DiamondTier;
  seniority: Seniority;
  available: boolean;
  github_url: string;
  github_verified: boolean;
  bio: string;
};

type SubRow = {
  id: string;
  user_id: string;
  plan: "free" | "basico" | "elite";
  status: string;
  amount_cents: number;
  current_period_end: string | null;
};

type LogRow = { id: string; action: string; target: string | null; created_at: string };

function brl(c: number) {
  return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"devs" | "subs" | "logs">("devs");
  const [devs, setDevs] = useState<DevRow[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [{ data: d }, { data: s }, { data: l }] = await Promise.all([
      supabase.from("dev_profiles").select("id,user_id,full_name,email,status,score,tier,seniority,available,github_url,github_verified,bio").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("id,user_id,plan,status,amount_cents,current_period_end").order("updated_at", { ascending: false }),
      supabase.from("audit_logs").select("id,action,target,created_at").order("created_at", { ascending: false }).limit(50),
    ]);
    setDevs((d ?? []) as DevRow[]);
    setSubs((s ?? []) as SubRow[]);
    setLogs((l ?? []) as LogRow[]);
  }

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getUser();
      const uid = session.user?.id;
      if (!uid) return setIsAdmin(false);
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
      const ok = Boolean(data);
      setIsAdmin(ok);
      if (ok) await load();
    })();
  }, []);

  async function audit(action: string, target: string) {
    const { data } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({ actor_id: data.user?.id ?? null, action, target });
  }

  async function setDevStatus(dev: DevRow, status: DevRow["status"]) {
    setBusy(dev.id);
    const { error } = await supabase.from("dev_profiles").update({ status }).eq("id", dev.id);
    setBusy(null);
    if (error) return toast.error("Falha ao atualizar o perfil.");
    await audit(`dev_${status}`, dev.email);
    setDevs((prev) => prev.map((x) => (x.id === dev.id ? { ...x, status } : x)));
    toast.success(`Perfil de ${dev.full_name} atualizado.`);
    load();
  }

  async function toggleAvailable(dev: DevRow) {
    setBusy(dev.id);
    const { error } = await supabase.from("dev_profiles").update({ available: !dev.available }).eq("id", dev.id);
    setBusy(null);
    if (error) return toast.error("Falha ao atualizar disponibilidade.");
    await audit(dev.available ? "dev_indisponivel" : "dev_disponivel", dev.email);
    setDevs((prev) => prev.map((x) => (x.id === dev.id ? { ...x, available: !x.available } : x)));
  }

  async function setSubStatus(sub: SubRow, status: string) {
    setBusy(sub.id);
    const { error } = await supabase.from("subscriptions").update({ status: status as never }).eq("id", sub.id);
    setBusy(null);
    if (error) return toast.error("Falha ao atualizar a assinatura.");
    await audit(`assinatura_${status}`, sub.user_id);
    toast.success("Assinatura atualizada.");
    load();
  }

  if (isAdmin === null) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="animate-spin opacity-50" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-32 pb-24 text-center">
        <div className="rounded-3xl glass-panel p-10">
          <ShieldAlert className="mx-auto text-rose-500" size={34} />
          <h1 className="mt-3 text-xl font-bold">Acesso restrito</h1>
          <p className="mt-2 text-sm opacity-70">Esta área é exclusiva para administradores da plataforma.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "devs" as const, label: "Devs", icon: Users, count: devs.length },
    { id: "subs" as const, label: "Assinaturas", icon: CreditCard, count: subs.length },
    { id: "logs" as const, label: "Auditoria", icon: ScrollText, count: logs.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <Reveal>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Painel administrativo</h1>
        <p className="mt-2 text-sm opacity-70">Gerencie devs, análises de IA, assinaturas e o registro de auditoria.</p>
      </Reveal>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
              tab === id ? "bg-slate-900 text-white" : "glass hover:scale-[1.02]"
            }`}
          >
            <Icon size={15} /> {label} <span className="opacity-60">{count}</span>
          </button>
        ))}
      </div>

      {tab === "devs" && (
        <ul className="mt-6 grid gap-3">
          {devs.map((d) => (
            <li key={d.id} className="rounded-2xl glass-panel p-4">
              <div className="flex flex-wrap items-center gap-3">
                <DiamondBadge tier={d.tier} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{d.full_name}</span>
                    <span className="text-xs opacity-60">{d.email}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      d.status === "aprovado" ? "bg-emerald-500/15 text-emerald-600"
                      : d.status === "rejeitado" ? "bg-rose-500/15 text-rose-600"
                      : "bg-amber-500/15 text-amber-600"}`}>
                      {d.status === "em_analise" ? "em análise" : d.status}
                    </span>
                    {!d.github_verified && <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-600">GitHub não verificado</span>}
                  </div>
                  <div className="mt-1 text-xs opacity-60">
                    {SENIORITY_LABEL[d.seniority]} · score {d.score} · {d.available ? "disponível" : "em projeto"} ·{" "}
                    <a href={d.github_url} target="_blank" rel="noreferrer" className="underline">GitHub</a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={busy === d.id} onClick={() => setDevStatus(d, "aprovado")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-transform hover:scale-105 disabled:opacity-50">
                    <Check size={13} /> Aprovar
                  </button>
                  <button disabled={busy === d.id} onClick={() => setDevStatus(d, "rejeitado")} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white transition-transform hover:scale-105 disabled:opacity-50">
                    <X size={13} /> Rejeitar
                  </button>
                  <button disabled={busy === d.id} onClick={() => toggleAvailable(d)} className="inline-flex items-center gap-1.5 rounded-lg glass px-3 py-2 text-xs font-bold transition-transform hover:scale-105 disabled:opacity-50">
                    <Power size={13} /> {d.available ? "Marcar em projeto" : "Marcar disponível"}
                  </button>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm opacity-70">{d.bio}</p>
            </li>
          ))}
          {devs.length === 0 && <li className="rounded-2xl glass-panel p-6 text-sm opacity-70">Nenhum dev cadastrado ainda.</li>}
        </ul>
      )}

      {tab === "subs" && (
        <ul className="mt-6 grid gap-3">
          {subs.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-2xl glass-panel p-4">
              <div className="min-w-0 flex-1">
                <div className="text-xs opacity-60">
                  {brl(s.amount_cents)} · status {s.status} ·{" "}
                  {s.current_period_end ? `vence ${new Date(s.current_period_end).toLocaleDateString("pt-BR")}` : "sem período ativo"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button disabled={busy === s.id} onClick={() => setSubStatus(s, "ativa")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Ativar 30 dias</button>
                <button disabled={busy === s.id} onClick={() => setSubStatus(s, "pendente")} className="rounded-lg glass px-3 py-2 text-xs font-bold disabled:opacity-50">Pendente</button>
                <button disabled={busy === s.id} onClick={() => setSubStatus(s, "cancelada")} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Cancelar</button>
              </div>
            </li>
          ))}
          {subs.length === 0 && <li className="rounded-2xl glass-panel p-6 text-sm opacity-70">Nenhuma assinatura registrada.</li>}
        </ul>
      )}

      {tab === "logs" && (
        <ul className="mt-6 divide-y divide-white/10 overflow-hidden rounded-2xl glass-panel">
          {logs.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <span className="font-semibold">{l.action}</span>
              <span className="opacity-70">{l.target}</span>
              <span className="text-xs opacity-50">{new Date(l.created_at).toLocaleString("pt-BR")}</span>
            </li>
          ))}
          {logs.length === 0 && <li className="p-6 text-sm opacity-70">Sem registros de auditoria.</li>}
        </ul>
      )}
    </div>
  );
}
