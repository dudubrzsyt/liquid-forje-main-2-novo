import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { CONTACT } from "@/lib/contact";
import { Code2, Palette, Rocket, Shield } from "lucide-react";
import igor from "@/assets/igor.png";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Quem Somos — Igor Eduardo, Desenvolvedor" },
      {
        name: "description",
        content:
          "Igor Eduardo Pinheiro de Araujo — desenvolvedor full-stack, especialista em sites modernos, performance e design agressivo.",
      },
      { property: "og:title", content: "Quem Somos — Igor Eduardo" },
      { property: "og:description", content: "Conheça a pessoa por trás do Diamante.dev." },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* Seção principal */}
      <section className="pt-8 pb-16">
        <div className="glass-panel p-8 md:p-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary to-accent opacity-30 blur-3xl" />
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/90">
            <Code2 className="h-3.5 w-3.5 text-accent" />
            Desenvolvedor Full-Stack
          </span>
          {/* Wrapper que alinha nome + foto (responsivo) */}
          <span className="absolute top-0 right-0 h-full w-full rounded-full bg-gradient-to-r from-primary to-accent opacity-30 blur-3xl">
            <Code2 className="h-3.5 w-3.5 text-accent" />
          </span>
          IGOR EDUARDO PINHEIRO DE ARAUJO
          <div className="md:absolute md:top-8 md:right-8 z-30 pointer-events-none w-full md:w-auto flex justify-end mt-8 md:mt-0">
            <div className="relative transform -translate-x-6 sm:-translate-x-8 md:translate-x-0 w-33 h-33 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-52 lg:h-52">
              {/* Anel arco-íris vibrante girando rápido (conic gradient + blur) */}
              <div
                aria-hidden="true"
                className="absolute -inset-1 rounded-full animate-spin-fast"
                style={{
                  backgroundImage: "conic-gradient(#ff007a, #ffcc00, #00e5ff, #7dff4d, #ff007a)",
                  filter: "blur(10px)",
                  opacity: 0.98,
                }}
              />

              {/* Anel frontal sutil com leve balanço */}
              <div className="absolute inset-0 rounded-full border-4 border-white/10 pointer-events-none animate-sway-fast" />

              {/* Container da foto (garante overflow e contorno) */}
              <div className="relative w-full h-full rounded-full overflow-hidden z-10">
                {/* Foto redonda fixa (removida/comentada para não bloquear o slideshow) */}

                {/* Camada de brilho/color overlay */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.06), transparent 20%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%)",
                    mixBlendMode: "overlay",
                  }}
                />

                {/* Anel frontal sutil com leve balanço */}
                <div className="absolute inset-0 rounded-full border-4 border-white/10 pointer-events-none animate-sway-fast" />

                {/* Container da foto (garante overflow e contorno) */}
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <img
                    src={igor}
                    alt="Foto do Igor Eduardo"
                    loading="lazy"
                    className="w-full h-full object-cover rounded-full ring-4 ring-white/10 shadow-lg"
                    style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  />
                  {/* Foto redonda */}
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden">
                    <img
                      src={igor}
                      alt="Foto do Igor Eduardo"
                      className="absolute inset-0 w-full h-full object-cover rounded-full"
                      style={{
                        animation: "fade1 8s infinite",
                        transition: "opacity 0.5s ease-in-out",
                      }}
                    />

                    <style>{`
    @keyframes fade1 {
  0%, 24% { opacity: 1; }
  25%, 100% { opacity: 0; }
}
@keyframes fade2 {
  0%, 24% { opacity: 0; }
  25%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes fade3 {
  0%, 49% { opacity: 0; }
  50%, 74% { opacity: 1; }
  75%, 100% { opacity: 0; }
}
@keyframes fade4 {
  0%, 74% { opacity: 0; }
  75%, 100% { opacity: 1; }
}

  `}</style>
                  </div>

                  {/* Camada de brilho/color overlay */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.06), transparent 20%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%)",
                      mixBlendMode: "overlay",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Texto adicional dentro do mesmo glass-panel */}
          <p className="mt-6 max-w-2xl text-lg text-white/80 leading-relaxed">
            Cada projeto é feito à mão, com atenção aos mínimos detalhes. Desde landing pages
            rápidas até e-commerces de alta complexidade — o objetivo é sempre o mesmo: entregar um
            site que transmita confiança, valorize o produto e converta visitantes em clientes.
          </p>
        </div>
      </section>

      {/* Cards de diferenciais */}
      <section className="pb-16 grid gap-5 md:grid-cols-2">
        {[
          {
            icon: Palette,
            t: "Design como diferencial",
            d: "Interfaces com identidade forte, shaders líquidos, glass morphism e tipografia sob medida.",
          },
          {
            icon: Rocket,
            t: "Performance em primeiro lugar",
            d: "Otimização obsessiva: LCP baixo, TBT mínimo, imagens responsivas e código enxuto.",
          },
          {
            icon: Code2,
            t: "TypeScript de ponta a ponta",
            d: "Segurança de tipos do frontend ao backend. Menos bugs, mais entregas.",
          },
          {
            icon: Shield,
            t: "Confiança e transparência",
            d: "Comunicação direta, entregas em prazo e código próprio — sem black-box.",
          },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="glass-panel p-6 hover:-translate-y-1 transition-transform">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent mb-4">
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-bold text-white">{t}</h3>
            <p className="mt-1 text-sm text-white/70">{d}</p>
          </div>
        ))}
      </section>

      {/* Contato */}
      <section className="pb-16">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white">Falar comigo</h2>
            <p className="mt-3 text-white/70">Chama por qualquer canal. Respondo rápido.</p>
            <ul className="mt-6 space-y-2 text-sm text-white/80">
              <li>
                <span className="text-white/50">WhatsApp:</span> {CONTACT.whatsappDisplay}
              </li>
              <li>
                <span className="text-white/50">Instagram:</span> @{CONTACT.instagram}
              </li>
              <li>
                <span className="text-white/50">E-mail:</span> {CONTACT.email}
              </li>
            </ul>
          </div>
          <Reveal variant="right">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
