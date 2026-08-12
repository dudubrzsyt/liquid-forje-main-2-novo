import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Menu, X, ChevronRight } from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";
import { Logo, Wordmark } from "@/components/Logo";


const nav = [
  { to: "/", label: "Início" },
  { to: "/devs", label: "Ranking Devs" },
  { to: "/cadastro-dev", label: "Cadastre-se como Dev" },
  { to: "/assinaturas", label: "Assinaturas" },
  { to: "/vendas", label: "Pacotes" },
  { to: "/premium", label: "Premium" },
  { to: "/portfolio", label: "Portfólio" },
  { to: "/blog", label: "Blog" },
  { to: "/comunidade", label: "Comunidade" },
  { to: "/processo", label: "Processo" },
  { to: "/faq", label: "FAQ" },
  { to: "/sobre", label: "Quem Somos" },
];



export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [open, setOpen] = useState(false);
  const [openDesktop, setOpenDesktop] = useState(false);

   // >>> ADIÇÃO: estado para avatar
  const [avatar, setAvatar] = useState<string | null>(null);


  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (y / h) * 100) : 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);


  // >>> ADIÇÃO: buscar avatar do perfil
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setAvatar(data?.avatar_url ?? null);
        });
    }
  }, [user]);

  return (
 <header
  className="fixed top-0 inset-x-0 z-40 bg-black/10 backdrop-blur-md transition duration-300 border-b border-white/5"
>





      
     <div className={`mx-auto flex max-w-1x1 items-center justify-between px-4 sm:px-6 transition-all duration-300 ${scrolled ? "py-1" : "py-3 md:py-0.5"}`}>
        <Link to="/" className="flex items-center gap-2 group shrink-0" onClick={() => setOpen(false)}>
          <span className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
            <Logo size={36} />
          </span>
          <Wordmark className="text-base sm:text-lg" />
        </Link>

       

        <nav className="hidden lg:flex items-center gap-0.10">
          {nav.map((n, i) => (
            <Link
              key={n.to + "-" + i}   // chave única mesmo com duplicados   // garante que cada chave seja única
              to={n.to}
              className="relative px-3 py-2 rounded-full text-sm font-medium 
bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-100 
transition-all duration-300 hover:text-white hover:bg-white/50 hover:-translate-y-0.5 
drop-shadow-md"
style={{ WebkitTextStroke: '0.5px rgba(0,0,0,0.6)' }}

              activeProps={{ className: "relative px-3 py-2 rounded-full text-sm font-semibold text-white bg-white/15 ring-1 ring-white/20" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/contato"
            className="hidden sm:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-500 hover:bg-[position:100%_0] hover:scale-[1.03]"
          >
            Orçamento <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to={user ? "/perfil" : "/auth"}
            className="group relative grid place-items-center"
            aria-label={user ? "Meu Perfil" : "Entrar"}
          >
            <span className="absolute inset-0 rounded-full rainbow-ring opacity-90 blur-[1px] transition group-hover:blur-[3px]" />
            <span className="relative m-[2px] grid h-9 w-9 place-items-center rounded-full bg-[oklch(0.14_0.07_260)] overflow-hidden ring-2 ring-white/10 transition-transform duration-300 group-hover:scale-105">
              {avatar ? (
  <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
) : (
  <User className="h-4 w-4 text-white" />
)}
 </span>
  </Link>



{/* Botão quadrado de menu (desktop) */}
<div className="relative">
  <button
    onClick={() => setOpenDesktop((o) => !o)}
    className="hidden lg:grid h-9 w-9 place-items-center rounded-md bg-sky-600 text-white hover:bg-sky-700 active:scale-90 transition"
    aria-label="Menu"
  >
    <Menu className="h-4 w-4" />
  </button>

  {openDesktop && (
    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-black/80 shadow-lg p-2">
      {nav.map((n, i) => (
        <Link
          key={i}
          to={n.to}
          onClick={() => setOpenDesktop(false)}
          className="block px-3 py-2 text-sm text-white/75 hover:text-white hover:bg-sky-600 rounded-md"
        >
          {n.label}
        </Link>
      ))}
    </div>
  )}
</div>






                     <button
            className="lg:hidden grid h-9 w-9 place-items-center rounded-full glass text-black active:scale-90 transition"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="h-[2px] w-full bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* === MENU MOBILE (corrigido: grid responsivo, rolável, animações mantidas) === */}
      <div
        className={`lg:hidden overflow-hidden chrome-glass-panel transition-[max-height,opacity] duration-500 ${
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 overflow-y-auto max-h-[68vh]">
            {nav.map((n, i) => (
              <Link
                key={n.to + "-" + i}
                to={n.to}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: `${i * 35}ms` }}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-white/90 hover:bg-white/10 transition-all duration-500 ${
                  open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                }`}
                activeProps={{
                  className:
                    "flex items-center justify-between w-full px-4 py-3 rounded-2xl text-white bg-white/15 font-semibold",
                }}
              >
                <span className="truncate w-full pr-3">{n.label}</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
            ))}
          </div>
        </nav>

        {/* rodapé do menu mobile */}
        <div className="flex items-center justify-between px-4 py-4 border-t border-white/5">
          <Link
            to="/vendas"
            onClick={() => setOpen(false)}
           className="absolute left-[5%] button-3 px-5 py-3 rounded-full border bg-gradient-to-r from-primary via-accent to-primary text-sm font-semibold text-white transform -translate-y-4"

          >
            Pacotes
          </Link>
          <Link
            to="/contato"
            onClick={() => setOpen(false)}
            className="absolute left-[45%] bottom-3 px-5 py-3 rounded-full border border-white/10 text-sm font-semibold text-white"
          >
            Contato
          </Link>
        </div>
      </div>
    </header>
  );
}
