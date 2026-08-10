import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User as UserIcon, LogOut, Upload, Save, SlidersHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [{ title: "Meu Perfil — Diamante.dev" }, { name: "robots", content: "noindex" }],
  }),
  component: Perfil,
});

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferences: { theme?: string; newsletter?: boolean } | null;
};

function Perfil() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [stack, setStack] = useState("");
  const [languages, setLanguages] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const p = data as Profile | null;
        setProfile(p);
        setName(p?.display_name ?? "");
        setAvatar(p?.avatar_url ?? "");
        setNewsletter(p?.preferences?.newsletter ?? true);
        setLoading(false);
      });
  }, [user.id]);

  // Preferências rápidas também salvas em localStorage para uso instantâneo.
  useEffect(() => {
    const saved = localStorage.getItem("ie_prefs");
    if (saved) {
      try {
        const p = JSON.parse(saved);

        if (p.avatar && !avatar) setAvatar(p.avatar);
        if (p.name && !name) setName(p.name);

        // Novos campos adicionados
        if (p.bio && !bio) setBio(p.bio);
        if (p.age && !age) setAge(p.age);
        if (p.stack && !stack) setStack(p.stack);
        if (p.languages && !languages) setLanguages(p.languages);
        if (typeof p.showPhone === "boolean") setShowPhone(p.showPhone);

        if (typeof p.newsletter === "boolean") setNewsletter(p.newsletter);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800_000) {
      toast.error("Imagem muito grande (max 800KB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        id: user.id,
        display_name: name.trim() || null,
        avatar_url: avatar || null,
        preferences: { newsletter },
      };
      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw error;
      localStorage.setItem(
        "ie_prefs",
        JSON.stringify({ name, avatar, newsletter, bio, age, stack, languages }),
      );
      toast.success("Perfil salvo!");
      qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  // funções dentro do componente
  function togglePhone() {
    setShowPhone((prev) => {
      const newState = !prev;
      localStorage.setItem("ie_contact", JSON.stringify({ showPhone: newState, newsletter }));
      return newState;
    });
  }

  async function signOut() {
    try {
      await qc.cancelQueries();
      qc.clear();
      await supabase.auth.signOut();
    } finally {
      localStorage.removeItem("ie_prefs");
      navigate({ to: "/auth", replace: true });
    }
  }

  function toggleNewsletter(e: React.ChangeEvent<HTMLInputElement>) {
    const newState = e.target.checked;
    setNewsletter(newState);

    // Salvar no localStorage
    localStorage.setItem("ie_contact", JSON.stringify({ newsletter: newState }));

    // Disparar confetes
    confetti({
      particleCount: newState ? 120 : 60,
      spread: newState ? 80 : 60,
      origin: { y: 0.6 },
      colors: newState ? ["#ff4d6d", "#ffcc00", "#00c2ff", "#7dff4d"] : ["#999999", "#444444"],
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-white/70 text-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
      <div className="pt-6 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white">
          Olá, <span className="text-gradient">{name || "amigo"}</span> 👋
        </h1>
        <p className="mt-2 text-white/60 text-sm">Personalize sua experiência</p>
      </div>

      <div className="glass-panel p-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative">
            <span className="absolute inset-0 rounded-full rainbow-ring blur-[2px]" />
            <span className="relative m-1 grid h-28 w-28 place-items-center rounded-full bg-background overflow-hidden ring-2 ring-white/20">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-white/60" />
              )}
            </span>
          </div>
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-white hover:bg-white/15 transition">
            <Upload className="h-4 w-4" />
            Trocar foto
            <input type="file" accept="image/*" onChange={onPickAvatar} className="hidden" />
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/90">
              Nome de usuário
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1.5 text-white/90">E-mail</label>

            <div className="flex items-center gap-2">
              <input
                type={showEmail ? "text" : "password"} // alterna entre texto e escondido
                value={user.email ?? ""}
                disabled
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white/60 transition-all duration-500"
              />

              <button
                type="button"
                onClick={() => setShowEmail(!showEmail)}
                className="rounded-full px-3 py-2 bg-primary text-white text-sm font-medium shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {showEmail ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/90">Biografia</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 resize-none"
              rows={4}
              placeholder="Escreva um pouco sobre você..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/90">Idade</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Ex: 18"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/90">
              Stack principal
            </label>
            <input
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              maxLength={100}
              className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Ex: Frontend, Backend, Fullstack"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/90">
              Linguagens de programação
            </label>
            <input
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              maxLength={120}
              className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Ex: JavaScript, TypeScript, Python"
            />
          </div>

          <div className="flex flex-col gap-6">
            {/* Número */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/90">Número</label>
              <div className="flex items-center gap-3">
                <input
                  type={showPhone ? "text" : "password"}
                  value={user.phone ?? ""}
                  disabled
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white/60 transition-all duration-500"
                />
              </div>

              <button
                type="button"
                onClick={togglePhone}
                className={`rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300 ${
                  showPhone
                    ? "bg-pink-500 hover:bg-pink-600 text-white"
                    : "bg-gray-700 hover:bg-gray-800 text-white"
                }`}
              >
                {showPhone ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={toggleNewsletter}
              className="h-5 w-5 rounded accent-primary transition-all duration-300"
            />
            <span className="text-sm text-white/85">Quero receber novidades e ofertas</span>
          </label>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-5 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-[position:100%_0] transition disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <Link
              to="/configuracoes"
              className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-white hover:bg-white/15 transition"
            >
              <SlidersHorizontal className="h-4 w-4" /> Configurações do site
            </Link>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-white hover:bg-white/15 transition"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
