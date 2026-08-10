import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ACCENTS, DEFAULT_SETTINGS, saveSettings, type SiteSettings } from "@/lib/site-settings";
import { Reveal } from "@/components/Reveal";
import { Settings2, Palette, Sparkles, Layout, RotateCcw, Save, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações do site — Diamante.dev" },
      { name: "description", content: "Personalize cores, animações, densidade e tamanho de fonte do site." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Configuracoes,
});

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/10 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-md">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-0.5 text-sm text-white/65">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-14 rounded-full transition-colors duration-300 ${on ? "bg-primary" : "bg-white/20"}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ${on ? "translate-x-7" : "translate-x-1"}`} />
    </button>
  );
}

function Configuracoes() {
  const { user } = Route.useRouteContext();
  const { settings, update } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  async function persist() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, preferences: JSON.parse(JSON.stringify(settings)) });

      if (error) throw error;
      toast.success("Configurações salvas na sua conta!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    saveSettings(DEFAULT_SETTINGS);
    update(DEFAULT_SETTINGS);
    toast.success("Preferências restauradas");
  }

  const s: SiteSettings = settings;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
      <div className="pt-6 pb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/90">
          <Settings2 className="h-3.5 w-3.5 text-accent" /> Personalização global
        </span>
        <h1 className="mt-4 text-4xl md:text-5xl font-black text-white">
          Configurações do <span className="text-gradient">site</span>
        </h1>
        <p className="mt-2 text-sm text-white/65">As mudanças valem para todas as páginas e ficam salvas no seu navegador.</p>
      </div>

      <Reveal className="glass-panel p-6 sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-white">
          <Palette className="h-4 w-4 text-accent" /> <span className="font-bold">Aparência</span>
        </div>

        <Row title="Cor de destaque" desc="Define botões, links e gradientes do site inteiro.">
          <div className="flex gap-2">
            {(Object.keys(ACCENTS) as (keyof typeof ACCENTS)[]).map((k) => (
              <button
                key={k}
                aria-label={ACCENTS[k].label}
                onClick={() => update({ accent: k })}
                className={`h-9 w-9 rounded-full ring-2 transition hover:scale-110 ${s.accent === k ? "ring-white" : "ring-white/20"}`}
                style={{ background: ACCENTS[k].swatch }}
              />
            ))}
          </div>
        </Row>

        <Row title="Densidade do layout" desc="Espaçamento entre as seções das páginas.">
          <div className="flex rounded-full glass p-1">
            {(["compacto", "confortavel", "amplo"] as const).map((d) => (
              <button key={d} onClick={() => update({ density: d })}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${s.density === d ? "bg-primary text-primary-foreground" : "text-white/70 hover:text-white"}`}>
                {d}
              </button>
            ))}
          </div>
        </Row>

        <Row title="Tamanho do texto" desc={`Escala atual: ${Math.round(s.fontScale * 100)}%`}>
          <input type="range" min={0.9} max={1.15} step={0.05} value={s.fontScale}
                 onChange={(e) => update({ fontScale: Number(e.target.value) })}
                 className="w-44 accent-primary" aria-label="Tamanho do texto" />
        </Row>

        <div className="mt-6 mb-2 flex items-center gap-2 text-white">
          <Sparkles className="h-4 w-4 text-accent" /> <span className="font-bold">Experiência</span>
        </div>

        <Row title="Animações" desc="Efeitos de entrada, hover e shaders líquidos.">
          {mounted && <Toggle on={s.animations} onChange={(v) => update({ animations: v })} label="Animações" />}
        </Row>
        <Row title="Efeito de vidro" desc="Transparência e desfoque estilo iOS nos cartões.">
          {mounted && <Toggle on={s.glass} onChange={(v) => update({ glass: v })} label="Efeito de vidro" />}
        </Row>
        <Row title="Botões flutuantes" desc="Atalhos de WhatsApp, Instagram, e-mail, GitHub e LinkedIn.">
          {mounted && <Toggle on={s.floatingSocial} onChange={(v) => update({ floatingSocial: v })} label="Botões flutuantes" />}
        </Row>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={persist} disabled={saving}
                  className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-5 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-[position:100%_0] disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar na conta"}
          </button>
          <button onClick={reset}
                  className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5">
            <RotateCcw className="h-4 w-4" /> Restaurar padrão
          </button>
        </div>
      </Reveal>

      <Reveal delay={100} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/perfil" className="glass-panel p-6 hover-lift">
          <UserIcon className="h-5 w-5 text-accent" />
          <h3 className="mt-3 font-bold text-white">Meu perfil</h3>
          <p className="mt-1 text-sm text-white/65">Nome, foto e newsletter.</p>
        </Link>
        <Link to="/vendas" className="glass-panel p-6 hover-lift">
          <Layout className="h-5 w-5 text-accent" />
          <h3 className="mt-3 font-bold text-white">Pacotes</h3>
          <p className="mt-1 text-sm text-white/65">Veja preços e escolha o ideal.</p>
        </Link>
      </Reveal>
    </div>
  );
}
