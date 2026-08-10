import { CONTACT, buildWhatsappUrl } from "@/lib/contact";
import { Mail, Github, Linkedin, Instagram, MessageCircle } from "lucide-react";

const items = [
  { label: "WhatsApp", icon: MessageCircle, href: buildWhatsappUrl("Olá Igor! Vim pelo site e quero conversar sobre um projeto."), color: "from-green-400 to-emerald-600" },
  { label: "Instagram", icon: Instagram, href: CONTACT.instagramUrl, color: "from-pink-500 via-red-500 to-yellow-500" },
  { label: "E-mail", icon: Mail, href: `mailto:${CONTACT.email}`, color: "from-sky-400 to-blue-600" },
  { label: "GitHub", icon: Github, href: CONTACT.github, color: "from-slate-400 to-slate-700" },
  { label: "LinkedIn", icon: Linkedin, href: CONTACT.linkedin, color: "from-blue-500 to-blue-800" },
];

export function FloatingSocial() {
  return (
    <div className="floating-social fixed bottom-3 right-3 z-40 flex flex-col gap-2 sm:bottom-6 sm:right-6 sm:gap-3">
      {items.map(({ label, icon: Icon, href, color }, i) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="group relative animate-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} opacity-70 blur-md transition duration-500 group-hover:opacity-100 group-hover:blur-lg`} />
          <span className={`relative grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${color} text-white shadow-xl shadow-black/40 ring-1 ring-white/30 transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95 sm:h-14 sm:w-14`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
          </span>
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg glass px-3 py-1 text-xs font-medium text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-x-1 hidden sm:block">
            {label}
          </span>
        </a>
      ))}
    </div>
  );
}
