import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Diamante.dev" },
      { name: "description", content: "Acesse sua conta para personalizar seu perfil e preferências." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) navigate({ to: "/perfil" });
  });
}, [navigate]);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  try {
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: name },
        },
      });
      if (error) throw error;

      // login automático só após criar conta
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;

      toast.success("Conta criada e login realizado!");
      navigate({ to: "/perfil" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Bem-vindo de volta!");
      navigate({ to: "/perfil" });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    toast.error(msg.includes("Invalid login") ? "E-mail ou senha inválidos" : msg);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 sm:px-6">
      <div className="w-full glass-panel p-8 animate-fade-up">
        <div className="mx-auto mb-6 relative w-24 h-24">
          <span className="absolute inset-0 rounded-full rainbow-ring blur-sm" />
          <span className="absolute inset-[3px] rounded-full bg-background grid place-items-center">
            <UserIcon className="h-8 w-8 text-white" />
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white text-center">
          {mode === "signin" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-white/60 text-center">
          {mode === "signin" ? "Acesse seu perfil personalizado" : "Junte-se e salve suas preferências"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-white/50" />
              <input required value={name} onChange={(e) => setName(e.target.value)}
                     placeholder="Seu nome" maxLength={80}
                     className="w-full rounded-xl bg-white/5 border border-white/15 pl-10 pr-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-white/50" />
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                   placeholder="seu@email.com"
                   className="w-full rounded-xl bg-white/5 border border-white/15 pl-10 pr-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-white/50" />
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                   placeholder="Sua senha (mín. 6)" minLength={6}
                   className="w-full rounded-xl bg-white/5 border border-white/15 pl-10 pr-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
          </div>
          <button disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-6 py-3.5 font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition hover:bg-[position:100%_0] disabled:opacity-60">
            {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="mt-5 w-full text-sm text-white/70 hover:text-white transition">
          {mode === "signin" ? "Não tem conta? Criar agora →" : "Já tenho conta ← Entrar"}
        </button>

        <Link to="/" className="mt-3 block text-center text-xs text-white/50 hover:text-white">
          Voltar ao site
        </Link>
      </div>
    </div>
  );
}
