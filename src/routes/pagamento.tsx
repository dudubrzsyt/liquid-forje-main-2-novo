import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  CheckCircle2,
  Zap,
  Crown,
  Shield,
  Loader2,
  QrCode,
  CreditCard,
  Barcode,
  Lock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  MessageCircle,
  Mail,
  HelpCircle,
  Repeat,
  Briefcase,
  Rocket,
  Building2,
  ShoppingCart,
} from "lucide-react";

export const Route = createFileRoute("/pagamento")({
  component: CheckoutPage,
});

type Mode = "subscription" | "project";
type BillingType = "PIX" | "CREDIT_CARD" | "BOLETO";
type AccentColor = "emerald" | "sky" | "amber";

interface Offer {
  id: string;
  name: string;
  tagline: string;
  price: number;
  features: string[];
  icon: LucideIcon;
  popular?: boolean;
}

interface PaymentMethod {
  id: BillingType;
  label: string;
  hint: string;
  icon: LucideIcon;
  accent: AccentColor;
}

interface FaqItem {
  question: string;
  answer: string;
}

const PLANS: Offer[] = [
  {
    id: "basic",
    name: "Plano Essencial",
    price: 45,
    tagline: "Perfeito para começar",
    icon: Zap,
    features: [
      "Acesso completo à plataforma",
      "Suporte via chat",
      "Atualizações incluídas",
      "Cancele quando quiser",
    ],
  },
  {
    id: "pro",
    name: "Plano Premium",
    price: 85,
    tagline: "Para quem quer o máximo",
    icon: Crown,
    popular: true,
    features: [
      "Tudo do plano Essencial",
      "Suporte prioritário 24/7",
      "Recursos exclusivos da plataforma",
      "Acesso antecipado a novidades",
      "Sem limite de uso",
    ],
  },
];

// Valores de referência "a partir de" — ajuste conforme sua tabela real de preços
const PROJECTS: Offer[] = [
  {
    id: "landing",
    name: "Landing Page",
    price: 497,
    tagline: "Página única focada em conversão",
    icon: Rocket,
    features: [
      "Design responsivo",
      "Foco em conversão",
      "Entrega em até 7 dias",
      "1 rodada de ajustes incluída",
    ],
  },
  {
    id: "institucional",
    name: "Site Institucional",
    price: 897,
    tagline: "Presença profissional pra sua empresa",
    icon: Building2,
    features: [
      "Várias páginas (sobre, serviços, contato)",
      "Design responsivo",
      "SEO básico incluído",
      "Entrega em até 15 dias",
    ],
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    price: 1497,
    tagline: "Loja virtual completa pra vender online",
    icon: ShoppingCart,
    features: [
      "Catálogo de produtos",
      "Carrinho e checkout",
      "Integração com pagamento",
      "Entrega em até 30 dias",
    ],
  },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "PIX", label: "Pix", hint: "Aprovação na hora", icon: QrCode, accent: "emerald" },
  { id: "CREDIT_CARD", label: "Cartão", hint: "Em até 3x", icon: CreditCard, accent: "sky" },
  { id: "BOLETO", label: "Boleto", hint: "Vence em 3 dias úteis", icon: Barcode, accent: "amber" },
];

const ACCENT_CLASSES: Record<AccentColor, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Qual a diferença entre assinatura e projeto?",
    answer:
      "A assinatura é um plano mensal recorrente da plataforma. O projeto é uma entrega única — landing page, site institucional ou e-commerce, sob demanda.",
  },
  {
    question: "Posso cancelar quando eu quiser?",
    answer: "Sim, na assinatura você cancela direto pelo seu painel, sem burocracia e sem multa.",
  },
  {
    question: "Como funciona o parcelamento?",
    answer:
      "No cartão ou boleto, você pode dividir o valor em até 3x. O valor de cada parcela é calculado automaticamente antes de confirmar o pagamento.",
  },
  {
    question: "Meus dados de pagamento estão seguros?",
    answer:
      "Sim. Todo o processamento acontece na Asaas, com criptografia de ponta a ponta. Não guardamos dados de cartão em nossos servidores.",
  },
  {
    question: "Quando recebo o acesso ou o projeto?",
    answer:
      "Na assinatura, o acesso é liberado assim que o pagamento é confirmado. No projeto, nosso time entra em contato em até 1 dia útil para iniciar o trabalho.",
  },
];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function OfferCard({
  offer,
  isSelected,
  onSelect,
  pricePrefix,
  priceSuffix,
}: {
  offer: Offer;
  isSelected: boolean;
  onSelect: () => void;
  pricePrefix?: string;
  priceSuffix?: string;
}) {
  const Icon = offer.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`group relative flex flex-col rounded-2xl border p-7 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        isSelected
          ? "scale-[1.02] border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-gray-200 bg-white shadow-sm hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      {offer.popular && (
        <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-[11px] font-semibold text-white shadow-md shadow-primary/30">
          Mais popular
        </span>
      )}

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
          isSelected ? "bg-gradient-to-r from-primary to-accent" : "bg-gray-100"
        }`}
      >
        <Icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-gray-700"}`} />
      </div>

      <h3 className="mt-5 text-xl font-bold text-black">{offer.name}</h3>
      <p className="text-sm text-gray-600">{offer.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        {pricePrefix && <span className="mr-1 text-xs text-gray-500">{pricePrefix}</span>}
        <span className="text-sm text-gray-600">R$</span>
        <span className="text-5xl font-extrabold text-black">{offer.price}</span>
        {priceSuffix && <span className="text-sm text-gray-600">{priceSuffix}</span>}
      </div>

      <ul className="mt-6 space-y-3">
        {offer.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <span
        className={`mt-7 flex h-5 w-5 items-center justify-center self-start rounded-full border-2 transition-colors ${
          isSelected ? "border-primary bg-primary" : "border-gray-300"
        }`}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </span>
    </button>
  );
}

function CheckoutPage() {
  const [mode, setMode] = useState<Mode>("subscription");
  const [selectedPlan, setSelectedPlan] = useState<Offer>(PLANS[1]);
  const [selectedProject, setSelectedProject] = useState<Offer>(PROJECTS[0]);
  const [billingType, setBillingType] = useState<BillingType>("PIX");
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeOffer = mode === "subscription" ? selectedPlan : selectedProject;
  const actionVerb = mode === "subscription" ? "Assinar" : "Contratar";
  const canInstall = billingType !== "PIX";
  const installmentValue = activeOffer.price / installments;

  function selectBillingType(id: BillingType) {
    setBillingType(id);
    if (id === "PIX") setInstallments(1);
  }

  async function handlePayment() {
    setLoading(true);
    setError(null);
    setPaymentLink(null);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: "cus_123456", // ID do cliente no Asaas
          value: activeOffer.price,
          billingType,
          serviceType: mode, // "subscription" | "project"
          itemId: activeOffer.id,
          // Ajuste estes campos conforme o contrato real do seu endpoint /api/payment e a integração com a Asaas
          installmentCount: canInstall && installments > 1 ? installments : undefined,
        }),
      });
      const data = await res.json();
      const link = data.invoiceUrl || data.bankSlipUrl || data.pixQrCode;
      if (!link) throw new Error("no-link");
      setPaymentLink(link);
    } catch {
      setError("Não foi possível gerar o pagamento agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white py-20 text-black sm:py-28">
      {/* Glow decorativo de fundo */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl motion-safe:animate-pulse sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl motion-safe:animate-pulse [animation-delay:1.2s] sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4">
        {/* Hero */}
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Assinaturas e projetos sob demanda
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-black sm:text-6xl">
              Escolha {mode === "subscription" ? "seu" : "o"}{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {mode === "subscription" ? "plano ideal" : "projeto ideal"}
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base text-gray-600 sm:text-lg">
              {mode === "subscription"
                ? "Pix, cartão ou boleto — parcele em até 3x e comece a usar na hora. Cancele quando quiser, sem multa."
                : "Pix, cartão ou boleto — parcele em até 3x e comece seu projeto com nosso time em poucos dias."}
            </p>
          </div>
        </Reveal>

        {/* Alternar entre assinatura e projeto */}
        <Reveal>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setMode("subscription")}
                aria-pressed={mode === "subscription"}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  mode === "subscription"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <Repeat className="h-4 w-4" />
                Assinatura mensal
              </button>
              <button
                type="button"
                onClick={() => setMode("project")}
                aria-pressed={mode === "project"}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  mode === "project"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Projeto sob demanda
              </button>
            </div>
          </div>
        </Reveal>

        {/* Ofertas */}
        <Reveal>
          {mode === "subscription" ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {PLANS.map((plan) => (
                <OfferCard
                  key={plan.id}
                  offer={plan}
                  isSelected={selectedPlan.id === plan.id}
                  onSelect={() => setSelectedPlan(plan)}
                  priceSuffix="/mês"
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((project) => (
                <OfferCard
                  key={project.id}
                  offer={project}
                  isSelected={selectedProject.id === project.id}
                  onSelect={() => setSelectedProject(project)}
                  pricePrefix="A partir de"
                />
              ))}
            </div>
          )}
        </Reveal>

        {/* Forma de pagamento */}
        <Reveal>
          <div className="mt-14">
            <p className="mb-4 text-center text-sm font-medium text-gray-600">
              Forma de pagamento
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isActive = billingType === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => selectBillingType(method.id)}
                    aria-pressed={isActive}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${ACCENT_CLASSES[method.accent]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-black">{method.label}</span>
                      <span className="block text-xs text-gray-600">{method.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {canInstall && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[1, 2, 3].map((n) => {
                  const isActive = installments === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setInstallments(n)}
                      aria-pressed={isActive}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                        isActive
                          ? "border-primary bg-primary/10 text-black"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {n === 1 ? "À vista" : `${n}x de ${formatBRL(activeOffer.price / n)}`}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent px-9 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando pagamento...
                </>
              ) : installments > 1 ? (
                <>
                  {actionVerb} — {installments}x de {formatBRL(installmentValue)}
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              ) : (
                <>
                  {actionVerb} agora por {formatBRL(activeOffer.price)}
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-600">
              <Lock className="h-3.5 w-3.5" />
              Pagamento 100% seguro, processado pela Asaas
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {paymentLink && (
              <div className="mx-auto mt-6 max-w-sm rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Pagamento gerado com sucesso
                </div>
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 font-medium text-accent underline-offset-4 hover:underline"
                >
                  Finalizar pagamento
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </Reveal>

        {/* Como funciona */}
        <Reveal>
          <div className="mt-24">
            <h2 className="text-center text-2xl font-bold text-black sm:text-3xl">
              Como funciona
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Escolha o que precisa",
                  desc: "Assinatura mensal ou um projeto sob demanda.",
                },
                {
                  step: "02",
                  title: "Escolha o pagamento",
                  desc: "Pix, cartão ou boleto, com opção de parcelar em até 3x.",
                },
                {
                  step: "03",
                  title: "Comece agora",
                  desc: "Acesso liberado ou início do projeto assim que o pagamento é confirmado.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-extrabold text-transparent">
                    {item.step}
                  </span>
                  <h3 className="mt-3 font-semibold text-black">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal>
          <div className="mt-24">
            <h2 className="text-center text-2xl font-bold text-black sm:text-3xl">
              Perguntas frequentes
            </h2>
            <div className="mx-auto mt-8 max-w-2xl space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-black [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm text-gray-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Suporte */}
        <Reveal>
          <div className="mt-24 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center sm:p-10">
            <HelpCircle className="mx-auto h-8 w-8 text-accent" />
            <h2 className="mt-3 text-xl font-bold text-black sm:text-2xl">Precisa de ajuda?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Nosso suporte responde rápido se tiver qualquer dúvida antes ou depois do pagamento.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="https://wa.me/5500000000000" // troque pelo número real do WhatsApp
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-50"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                WhatsApp
              </a>
              <a
                href="mailto:suporte@seudominio.com" // troque pelo e-mail real de suporte
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-50"
              >
                <Mail className="h-4 w-4 text-accent" />
                E-mail
              </a>
            </div>
          </div>
        </Reveal>

        {/* Selos de confiança */}
        <Reveal>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Dados protegidos
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              Sem taxas escondidas
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              Ativação imediata
            </span>
          </div>
        </Reveal>
      </div>
    </div>
  );
}