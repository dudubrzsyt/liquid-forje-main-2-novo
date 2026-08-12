import { Link } from "@tanstack/react-router";
import { CONTACT } from "@/lib/contact";
import { Logo, Wordmark } from "@/components/Logo";
import { Mail, Github, Linkedin, Instagram, MessageCircle, ArrowUp } from "lucide-react";

const links = [
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
  { to: "/contato", label: "Contato" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 chrome-glass chrome-glass-footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Logo size={40} />
            <Wordmark className="text-lg" />
          </div>
          <p className="text-sm text-white leading-relaxed max-w-sm">
            Sites modernos, agressivos e sofisticados. Feito à mão por {CONTACT.name.split(" ").slice(0, 2).join(" ")}.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Navegação</h4>
          <ul className="space-y-2 text-sm text-white/70">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="inline-block transition-transform duration-300 hover:translate-x-1 hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Contato</h4>
          <ul className="space-y-2 text-sm text-white/70 break-words">
            <li>{CONTACT.whatsappDisplay}</li>
            <li>{CONTACT.email}</li>
            <li>@{CONTACT.instagram}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Redes</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: MessageCircle, href: `https://wa.me/${CONTACT.whatsapp}`, l: "WhatsApp" },
              { icon: Instagram, href: CONTACT.instagramUrl, l: "Instagram" },
              { icon: Mail, href: `mailto:${CONTACT.email}`, l: "E-mail" },
              { icon: Github, href: CONTACT.github, l: "GitHub" },
              { icon: Linkedin, href: CONTACT.linkedin, l: "LinkedIn" },
            ].map(({ icon: Icon, href, l }) => (
              <a key={l} href={href} target="_blank" rel="noopener noreferrer" aria-label={l}
                 className="grid h-10 w-10 place-items-center rounded-full glass text-white/90 transition-all duration-300 hover:text-white hover:scale-110 hover:-translate-y-1">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-5 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium text-white/90 transition hover:-translate-y-0.5 hover:text-white"
          >
            <ArrowUp className="h-3.5 w-3.5" /> Voltar ao topo
          </button>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 sm:px-6 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {CONTACT.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
