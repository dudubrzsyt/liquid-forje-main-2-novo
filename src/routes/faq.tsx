import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { ChevronDown, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas frequentes sobre criação de sites | Diamante.dev" },
      { name: "description", content: "Prazos, formas de pagamento, domínio, hospedagem, manutenção e o que está incluso em cada pacote de site." },
      { property: "og:title", content: "Perguntas frequentes sobre criação de sites" },
      { property: "og:description", content: "Prazos, pagamento, domínio, hospedagem e manutenção: tudo explicado sem enrolação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Faq,
});

const faqs = [
  { q: "Quanto tempo leva para o site ficar pronto?", a: "Uma landing page fica pronta em 5 a 7 dias. Sites institucionais levam de 2 a 4 semanas e e-commerces de 4 a 8 semanas, dependendo do escopo aprovado." },
  { q: "Como funciona o pagamento?", a: "50% na aprovação da proposta e 50% na entrega. Aceito PIX, transferência e cartão parcelado. Projetos maiores podem ser divididos em etapas mensais." },
  { q: "Domínio e hospedagem estão inclusos?", a: "A configuração está inclusa. O custo anual do domínio e do plano de hospedagem é pago diretamente por você ao provedor, e fica no seu nome." },
  { q: "O site é responsivo de verdade?", a: "Sim. Testo em celular, tablet, notebook, desktop grande e TV. Todos os projetos passam por auditoria de performance com meta de 95+ no Lighthouse." },
  { q: "Vocês fazem manutenção depois da entrega?", a: "Todo projeto inclui de 30 a 90 dias de suporte a ajustes. Depois disso, ofereço planos mensais de manutenção, evolução e monitoramento." },
  { q: "Posso editar o conteúdo sozinho?", a: "Sim, quando o pacote inclui CMS. Você recebe um painel simples para textos, imagens, produtos e posts, além de um treinamento em vídeo." },
  { q: "Trabalha com quem já tem site?", a: "Trabalho. Faço redesign, migração de plataforma e otimização de performance/SEO de sites existentes sem perder posicionamento." },
  { q: "E se eu não gostar do design?", a: "O design é aprovado antes de qualquer linha de código, com rodadas de ajuste inclusas. Você só segue para o desenvolvimento quando estiver satisfeito." },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="pt-8 pb-12 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/90">
            <HelpCircle className="h-3.5 w-3.5 text-accent" /> Tudo explicado · Sem letra miúda
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05]">
            Perguntas <span className="text-gradient">frequentes</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-white/70">
            As dúvidas que todo cliente tem antes de fechar — respondidas de forma direta.
          </p>
        </Reveal>
      </section>

      <section className="pb-12 mx-auto max-w-3xl grid gap-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i * 50}>
              <div className="glass-panel overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-white text-base sm:text-lg">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-white/60 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm sm:text-base text-white/70 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </section>

      <section className="py-12 text-center">
        <Reveal className="glass-panel p-8 sm:p-10">
          <h2 className="text-2xl sm:text-4xl font-black text-white">Sua dúvida não está aqui?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">Me chama no WhatsApp — respondo pessoalmente em até 24h.</p>
          <Link to="/contato" className="mt-6 inline-flex rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-6 py-3.5 font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition hover:bg-[position:100%_0]">
            Falar comigo
          </Link>
        </Reveal>
      </section>

      <section className="pb-20 grid gap-8 lg:grid-cols-2 items-center">
        <Reveal variant="left">
          <h2 className="text-3xl md:text-4xl font-black text-white">Manda sua <span className="text-gradient">pergunta</span>.</h2>
          <p className="mt-3 text-white/70 max-w-lg">Sem compromisso, sem robô: quem responde sou eu.</p>
        </Reveal>
        <Reveal variant="right" delay={80}><ContactForm /></Reveal>
      </section>
    </div>
  );
}
