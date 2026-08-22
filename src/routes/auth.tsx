import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Loader2,
  Zap,
  Shield,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

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

const FEATURES = [
  { icon: Zap, label: "Acesso instantâneo com Google" },
  { icon: UserIcon, label: "Perfil 100% personalizável" },
  { icon: Shield, label: "Seus dados protegidos" },
  { icon: Sparkles, label: "Novidades em primeira mão" },
];

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09C3.24 21.3 7.29 24 12 24z"
      />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.64H1.26a12 12 0 0 0 0 10.72l4.01-3.09z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.29 0 3.24 2.7 1.26 6.64l4.01 3.09C6.22 6.87 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;

        if (data.session) {
          // Confirmação de e-mail desativada no Supabase — a conta já vem logada
          toast.success("Conta criada e login realizado!");
          navigate({ to: "/perfil" });
        } else {
          // Supabase não devolveu sessão — a confirmação de e-mail ainda está ativa no projeto
          toast.success(
            "Conta criada! Confirme seu e-mail pra entrar (ou desative a confirmação em Authentication → Providers no Supabase)."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate({ to: "/perfil" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      const lower = msg.toLowerCase();
      if (lower.includes("invalid login")) {
        toast.error("E-mail ou senha inválidos");
      } else if (lower.includes("email not confirmed")) {
        toast.error(
          "Essa conta ainda não foi confirmada. Confirme manualmente em Authentication → Users no Supabase, ou desative a confirmação em Authentication → Providers."
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/perfil` },
      });
      if (error) throw error;
      // O Supabase redireciona pro Google a partir daqui — não precisa navigate manual
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao entrar com Google";
      toast.error(msg);
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error("Digite seu e-mail pra receber o link de redefinição");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Enviamos um link de redefinição pro seu e-mail");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível enviar o e-mail";
      toast.error(msg);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <style>{`
        @keyframes authFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-mode-fade { animation: authFadeIn 0.35s ease-out; }

        @media (prefers-reduced-motion: no-preference) {
          @keyframes floatSlow {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(24px, -32px); }
          }
          .animate-float-slow { animation: floatSlow 9s ease-in-out infinite; }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-shift { background-size: 200% 100%; animation: gradientShift 4s ease infinite; }
        }
      `}</style>

      {/* Fundo decorativo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl motion-safe:animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 animate-float-slow rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-64 w-64 animate-float-slow rounded-full bg-primary/10 blur-3xl" />

      <Link
        to="/"
        className="absolute left-4 top-4 z-20 flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white sm:left-8 sm:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao site
      </Link>

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* Painel de marca — visível só no desktop */}
        <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 p-12 lg:flex xl:p-16">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inset-0 rounded-full rainbow-ring blur-[1px] motion-safe:animate-[spin_6s_linear_infinite]" />
              <span className="absolute inset-[3px] rounded-full bg-background" />
              <span className="relative text-sm font-black text-white">D</span>
            </span>
            <span className="text-lg font-bold text-white">Diamante.dev</span>
          </div>

          <div>
            <h2 className="text-4xl font-black leading-tight text-white xl:text-5xl">
              Seu espaço,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                do seu jeito.
              </span>
            </h2>
            <p className="mt-4 max-w-sm text-white">
              Crie sua conta, personalize seu perfil e leve suas preferências pra qualquer lugar.
            </p>

            <ul className="mt-10 space-y-4">
              {FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                    <f.icon className="h-4 w-4 text-primary" />
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white">© {new Date().getFullYear()} Diamante.dev</p>
        </div>

        {/* Formulário */}
        <div className="relative flex items-center justify-center px-4 py-20 sm:px-6 lg:px-12">
          <div className="w-full max-w-md">
            <div className="glass-panel relative overflow-hidden p-8 animate-fade-up sm:p-10">
              <div className="relative mx-auto mb-6 h-20 w-20 lg:hidden">
                <span className="absolute inset-0 rounded-full rainbow-ring blur-sm motion-safe:animate-[spin_6s_linear_infinite]" />
                <span className="absolute inset-[3px] grid place-items-center rounded-full bg-background">
                  <UserIcon className="h-8 w-8 text-white" />
                </span>
              </div>

              <div key={mode} className="auth-mode-fade text-center">
                <h1 className="text-2xl font-black text-white md:text-3xl">
                  {mode === "signin" ? "Bem-vindo de volta" : "Crie sua conta"}
                </h1>
                <p className="mt-1 text-sm text-white/60">
                  {mode === "signin" ? "Acesse seu perfil personalizado" : "Leva menos de 30 segundos"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white px-6 py-3.5 font-semibold text-gray-900 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                ) : (
                  <GoogleIcon className="h-5 w-5" />
                )}
                {googleLoading ? "Conectando..." : "Continuar com Google"}
              </button>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/40">ou continue com e-mail</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "signup" && (
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-white/50" />
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      maxLength={80}
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-white outline-none transition-all duration-200 placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-white/50" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-white outline-none transition-all duration-200 placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-white/50" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha (mín. 6)"
                    minLength={6}
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-11 text-white outline-none transition-all duration-200 placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-3.5 text-white/50 transition-colors hover:text-white"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {mode === "signin" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetLoading}
                      className="text-xs text-white/50 transition-colors hover:text-primary disabled:opacity-60"
                    >
                      {resetLoading ? "Enviando..." : "Esqueci minha senha"}
                    </button>
                  </div>
                )}

                <button
                  disabled={loading}
                  className="w-full animate-gradient-shift rounded-xl bg-gradient-to-r from-primary via-accent to-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-white/40">
                <Lock className="h-3 w-3" />
                Login seguro e criptografado
              </div>

              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="mt-6 w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-white/70 transition-all duration-200 hover:border-white/25 hover:bg-white/5 hover:text-white"
              >
                {mode === "signin" ? "Não tem conta? Criar agora" : "Já tenho conta — Entrar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}