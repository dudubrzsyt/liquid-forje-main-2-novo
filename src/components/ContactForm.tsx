import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { buildWhatsappUrl, buildMailtoUrl } from "@/lib/contact";

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(80),
  contact: z.string().trim().min(3, "Informe um contato").max(120),
  channel: z.enum(["whatsapp", "instagram", "email", "github", "telefone"]),
  projectType: z.enum(["landing", "institucional", "ecommerce", "premium", "corporativo"]),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Conte um pouco mais").max(1200),
});

const projectLabels: Record<string, string> = {
  landing: "Landing Page",
  institucional: "Site Institucional",
  ecommerce: "E-commerce",
  premium: "Projeto Premium",
  corporativo: "Grande Empresa / Corporativo",
};

const channelLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  email: "E-mail",
  github: "GitHub",
  telefone: "Telefone",
};

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique o formulário");
      return;
    }
    setLoading(true);
    const d = parsed.data;
    const summary =
      `Olá Igor! Meu nome é ${d.name}.\n` +
      `Interesse: ${projectLabels[d.projectType]}\n` +
      `Canal preferido: ${channelLabels[d.channel]} (${d.contact})\n` +
      (d.budget ? `Orçamento: ${d.budget}\n` : "") +
      `\nMensagem: ${d.message}`;
    // Envia direto pelo WhatsApp — funcionalidade 100% front-end.
    window.open(buildWhatsappUrl(summary), "_blank", "noopener");
    // Fallback e-mail caso o WhatsApp não abra.
    setTimeout(() => {
      window.location.href = buildMailtoUrl(`Novo projeto — ${projectLabels[d.projectType]}`, summary);
      setLoading(false);
      toast.success("Mensagem enviada! Vou responder rapidinho.");
      (e.target as HTMLFormElement).reset();
    }, 400);
  }

  return (
    <form onSubmit={handleSubmit} className={`glass-panel p-6 md:p-8 space-y-4 ${compact ? "" : "max-w-2xl"}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nome" name="name" placeholder="Seu nome" required />
        <Field label="Contato (telefone / @ / e-mail)" name="contact" placeholder="Ex: +55 11 9..." required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Tipo de projeto" name="projectType" options={projectLabels} />
        <Select label="Canal preferido" name="channel" options={channelLabels} />
      </div>
      <Field label="Orçamento estimado (opcional)" name="budget" placeholder="Ex: R$ 5.000" />
      <div>
        <label className="block text-sm font-medium mb-1.5 text-white/90">Mensagem</label>
        <textarea
          name="message"
          rows={4}
          placeholder="Descreva sua ideia, prazo, referências..."
          className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-6 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-[position:100%_0] active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Enviar direto pro WhatsApp"}
      </button>
      <p className="text-xs text-white/50 text-center">
        A mensagem abre no WhatsApp e também prepara um e-mail. Zero fricção.
      </p>
    </form>
  );
}

function Field({ label, name, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-white/90">{label}</label>
      <input
        name={name}
        {...rest}
        className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
      />
    </div>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: Record<string, string> }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-white/90">{label}</label>
      <select
        name={name}
        defaultValue={Object.keys(options)[0]}
        className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition [&>option]:bg-[oklch(0.16_0.08_260)]"
      >
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  );
}
