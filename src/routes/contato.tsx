import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { CONTACT, buildWhatsappUrl } from "@/lib/contact";
import { Mail, MessageCircle, Instagram, Github, Linkedin } from "lucide-react";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Diamante.dev" },
      {
        name: "description",
        content:
          "Fale comigo pelo WhatsApp, Instagram, e-mail ou LinkedIn. Envio direto do formulário.",
      },
      { property: "og:title", content: "Contato — Diamante.dev" },
      { property: "og:description", content: "Vamos conversar sobre o seu próximo site." },
    ],
  }),
  component: Contato,
});

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: CONTACT.whatsappDisplay,
    href: buildWhatsappUrl("Olá Igor!"),
    color: "from-green-400 to-emerald-600",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: `@${CONTACT.instagram}`,
    href: CONTACT.instagramUrl,
    color: "from-pink-500 to-yellow-500",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    color: "from-sky-400 to-blue-600",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "dudubrzsyt",
    href: CONTACT.github,
    color: "from-slate-400 to-slate-700",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "Igor Eduardo",
    href: CONTACT.linkedin,
    color: "from-blue-500 to-blue-800",
  },
];

function Contato() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="pt-8 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white">
          Vamos <span className="text-gradient">conversar</span>.
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-white/70">
          Escolha o canal que preferir — o formulário envia direto pro meu WhatsApp.
        </p>
      </section>

      <section className="pb-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel p-5 group hover:-translate-y-1 transition-transform"
          >
            <div
              className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.color} shadow-lg mb-3`}
            >
              <c.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-xs uppercase tracking-wider text-white/50">{c.label}</div>
            <div className="mt-1 text-sm font-semibold text-white truncate">{c.value}</div>
          </a>
        ))}
      </section>

      <section className="pb-20 max-w-2xl mx-auto">
        <Reveal variant="right">
          <ContactForm />
        </Reveal>
      </section>
    </div>
  );
}
