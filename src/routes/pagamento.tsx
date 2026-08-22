import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { useEffect, useRef, useState } from "react";
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
  Heart,
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
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
  Hash,
  X,
} from "lucide-react";

export const Route = createFileRoute("/pagamento")({
  component: CheckoutPage,
});

type Mode = "subscription" | "project" | "donation";
type BillingType = "PIX" | "CREDIT_CARD";
type AccentColor = "emerald" | "sky";

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

interface CardData {
  holderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
}

interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  subscriptionId?: string;
  invoiceUrl?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  pixExpiration?: string;
  message?: string;
  error?: string;
}

type PixStatus = "idle" | "pending" | "confirmed";
type CardStatus = "idle" | "success";

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

const DONATION_PRESETS = [20, 50, 100];

const DONATION_BENEFITS = [
  "100% revertido em melhorias da plataforma",
  "Apoio livre, sem contrapartida obrigatória",
  "Você pode doar quantas vezes quiser",
];

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "PIX", label: "PIX", hint: "Aprovação na hora", icon: QrCode, accent: "emerald" },
  { id: "CREDIT_CARD", label: "Cartão de Crédito", hint: "Em até 3x", icon: CreditCard, accent: "sky" },
];

const ACCENT_CLASSES: Record<AccentColor, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-sky-50 text-sky-600",
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
      "No cartão de crédito você pode dividir o valor em até 3x. O valor de cada parcela é calculado automaticamente antes de confirmar o pagamento. Doações são sempre à vista.",
  },
  {
    question: "Meus dados de pagamento estão seguros?",
    answer:
      "Sim. Todo o processamento acontece na Asaas, com criptografia de ponta a ponta. Não guardamos os dados do seu cartão em nossos servidores.",
  },
  {
    question: "Quando recebo o acesso, o projeto ou a confirmação da doação?",
    answer:
      "Na assinatura, o acesso é liberado assim que o pagamento é confirmado. No projeto, nosso time entra em contato em até 1 dia útil. Nas doações via PIX, a confirmação aparece na tela automaticamente assim que o pagamento cai.",
  },
];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCardNumber(value: string) {
  return value
    .replace(/\s/g, "")
    .replace(/(\d{4})/g, "$1 ")
    .trim();
}

function formatCpfCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function formatCep(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

function isValidCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(digits[i], 10) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === parseInt(digits[9], 10) && calc(10) === parseInt(digits[10], 10);
}

function isValidCpfCnpj(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return true; // validação completa de CNPJ fica a cargo da Asaas
  return false;
}

function validateCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// ============= COMPONENTES =============

function Toast({
  message,
  type = "info",
  onClose,
}: {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    error: "bg-red-50 text-red-800 border-red-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  }[type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: AlertCircle,
  }[type];

  return (
    <div
      className={`fixed bottom-4 right-4 left-4 sm:left-auto flex items-center gap-3 rounded-lg border p-4 ${bgColor} shadow-lg animate-in slide-in-from-bottom-4 duration-300 z-50 sm:max-w-sm`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="text-sm">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto text-inherit hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
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
      className={`group relative flex w-full flex-col rounded-2xl border p-5 sm:p-7 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.99] ${
        isSelected
          ? "scale-100 sm:scale-[1.02] border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:shadow-md"
      }`}
    >
      {offer.popular && (
        <span className="absolute -top-3 right-4 sm:right-6 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-[10px] sm:text-[11px] font-semibold text-white shadow-md shadow-primary/30 animate-in fade-in zoom-in duration-500">
          Mais popular
        </span>
      )}

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 ${
          isSelected ? "bg-gradient-to-r from-primary to-accent" : "bg-gray-100 group-hover:bg-gray-200"
        }`}
      >
        <Icon className={`h-5 w-5 transition-colors ${isSelected ? "text-white" : "text-gray-700"}`} />
      </div>

      <h3 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-black">{offer.name}</h3>
      <p className="text-xs sm:text-sm text-gray-600">{offer.tagline}</p>

      <div className="mt-4 sm:mt-5 flex items-baseline gap-1">
        {pricePrefix && <span className="mr-1 text-xs text-gray-500">{pricePrefix}</span>}
        <span className="text-xs sm:text-sm text-gray-600">R$</span>
        <span className="text-4xl sm:text-5xl font-extrabold text-black">{offer.price}</span>
        {priceSuffix && <span className="text-xs sm:text-sm text-gray-600">{priceSuffix}</span>}
      </div>

      <ul className="mt-5 sm:mt-6 space-y-2 sm:space-y-3">
        {offer.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs sm:text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <span
        className={`mt-6 sm:mt-7 flex h-5 w-5 items-center justify-center self-start rounded-full border-2 transition-all duration-300 ${
          isSelected ? "border-primary bg-primary scale-110" : "border-gray-300"
        }`}
      >
        {isSelected && <Check className="h-3 w-3 text-white animate-in zoom-in duration-200" />}
      </span>
    </button>
  );
}

function DonationPicker({
  selected,
  isCustom,
  customValue,
  onSelectPreset,
  onCustomChange,
}: {
  selected: number;
  isCustom: boolean;
  customValue: string;
  onSelectPreset: (amount: number) => void;
  onCustomChange: (value: string) => void;
}) {
  return (
    <div className="relative flex w-full flex-col rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-5 sm:p-7 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent">
        <Heart className="h-5 w-5 text-white" />
      </div>

      <h3 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-black">Apoie a plataforma</h3>
      <p className="text-xs sm:text-sm text-gray-600">
        Sua doação ajuda a manter tudo no ar e a construir novidades pra todo mundo.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {DONATION_PRESETS.map((amount) => {
          const isActive = !isCustom && selected === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => onSelectPreset(amount)}
              className={`rounded-xl border-2 py-3 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                isActive
                  ? "border-primary bg-primary/10 text-black scale-105"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {formatBRL(amount)}
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-700 mb-2">Ou digite outro valor</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            R$
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={1}
            step="0.01"
            placeholder="0,00"
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            className={`w-full rounded-lg border pl-10 pr-4 py-2 sm:py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              isCustom ? "border-primary" : "border-gray-300"
            }`}
          />
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {DONATION_BENEFITS.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs sm:text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreditCardForm({
  card,
  onChange,
  onValidChange,
}: {
  card: CardData;
  onChange: (card: CardData) => void;
  onValidChange: (valid: boolean) => void;
}) {
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState<Partial<CardData>>({});

  const validateForm = () => {
    const newErrors: Partial<CardData> = {};

    if (!card.holderName.trim()) newErrors.holderName = "Nome obrigatório";
    if (!validateCardNumber(card.cardNumber)) newErrors.cardNumber = "Cartão inválido";
    if (!card.expiryMonth || parseInt(card.expiryMonth) < 1 || parseInt(card.expiryMonth) > 12)
      newErrors.expiryMonth = "Mês inválido";
    if (!card.expiryYear || card.expiryYear.length !== 2) newErrors.expiryYear = "Ano inválido";
    if (!card.cvv || card.cvv.length < 3 || card.cvv.length > 4) newErrors.cvv = "CVV inválido";

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidChange(isValid);
    return isValid;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "");
    if (!/^\d*$/.test(value)) return;
    value = value.slice(0, 19);
    onChange({ ...card, cardNumber: formatCardNumber(value) });
  };

  const handleExpiryChange = (type: "month" | "year", value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (type === "month") {
      onChange({ ...card, expiryMonth: value.slice(0, 2) });
    } else {
      onChange({ ...card, expiryYear: value.slice(0, 2) });
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    onChange({ ...card, cvv: value.slice(0, 4) });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Card Preview */}
      <div className="relative mb-6 h-40 sm:h-48 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-4 sm:p-6 text-white shadow-xl transition-transform duration-300 hover:scale-[1.02]">
        <div className="absolute right-4 sm:right-6 top-4 sm:top-6 opacity-20">
          <CreditCard className="h-10 sm:h-12 w-10 sm:w-12" />
        </div>
        <div className="mb-6 sm:mb-8 flex items-center gap-2">
          <div className="h-3 w-8 sm:w-10 rounded-full bg-yellow-400 opacity-80" />
          <div className="h-2 w-8 sm:w-10 rounded-full bg-gray-300 opacity-50" />
        </div>
        <div className="mb-4 sm:mb-6 font-mono text-xs sm:text-lg tracking-wider break-all">
          {card.cardNumber || "•••• •••• •••• ••••"}
        </div>
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs opacity-80">Titular</p>
            <p className="font-semibold text-xs sm:text-base truncate">
              {card.holderName.toUpperCase() || "SEU NOME"}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-80">Validade</p>
            <p className="font-mono text-sm">
              {card.expiryMonth || "MM"}/{card.expiryYear || "YY"}
            </p>
          </div>
        </div>
      </div>

      {/* Input Fields */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Nome do Titular
        </label>
        <input
          type="text"
          placeholder="João Silva"
          value={card.holderName}
          onChange={(e) => onChange({ ...card, holderName: e.target.value })}
          className={`w-full rounded-lg border px-3 sm:px-4 py-2 sm:py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.holderName ? "border-red-300 focus:ring-red-500" : "border-gray-300"
          }`}
        />
        {errors.holderName && (
          <p className="mt-1 text-xs text-red-600">{errors.holderName}</p>
        )}
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Número do Cartão
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="•••• •••• •••• ••••"
            value={card.cardNumber}
            onChange={handleCardNumberChange}
            maxLength={19}
            className={`w-full rounded-lg border px-3 sm:px-4 py-2 sm:py-3 font-mono text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.cardNumber ? "border-red-300 focus:ring-red-500" : "border-gray-300"
            }`}
          />
          <CreditCard className="absolute right-3 sm:right-4 top-2.5 sm:top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Mês</label>
          <div className="relative">
            <input
              type="text"
              placeholder="MM"
              value={card.expiryMonth}
              onChange={(e) => handleExpiryChange("month", e.target.value)}
              maxLength={2}
              className={`w-full rounded-lg border px-2 sm:px-3 py-2 sm:py-3 text-center font-mono text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.expiryMonth ? "border-red-300 focus:ring-red-500" : "border-gray-300"
              }`}
            />
            <Calendar className="absolute right-2 sm:right-3 top-2.5 sm:top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.expiryMonth && (
            <p className="mt-1 text-xs text-red-600">{errors.expiryMonth}</p>
          )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Ano</label>
          <input
            type="text"
            placeholder="YY"
            value={card.expiryYear}
            onChange={(e) => handleExpiryChange("year", e.target.value)}
            maxLength={2}
            className={`w-full rounded-lg border px-2 sm:px-3 py-2 sm:py-3 text-center font-mono text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.expiryYear ? "border-red-300 focus:ring-red-500" : "border-gray-300"
            }`}
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">CVV</label>
          <div className="relative">
            <input
              type={showCvv ? "text" : "password"}
              placeholder="•••"
              value={card.cvv}
              onChange={handleCvvChange}
              maxLength={4}
              className={`w-full rounded-lg border px-2 sm:px-3 py-2 sm:py-3 text-center font-mono text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.cvv ? "border-red-300 focus:ring-red-500" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowCvv(!showCvv)}
              className="absolute right-2 sm:right-3 top-2.5 sm:top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showCvv ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.cvv && <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
        <Lock className="h-4 w-4 shrink-0" />
        <p>Dados criptografados pela Asaas. Nunca armazenamos o número do seu cartão.</p>
      </div>

      <button
        type="button"
        onClick={validateForm}
        className="w-full rounded-lg bg-primary/10 px-4 py-2 text-xs sm:text-sm font-medium text-primary transition-colors hover:bg-primary/20 active:scale-[0.99]"
      >
        Validar Cartão
      </button>
    </div>
  );
}

function PixQRCode({
  qrCode,
  copyPaste,
  status,
  expiration,
}: {
  qrCode: string;
  copyPaste: string;
  status: PixStatus;
  expiration?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(copyPaste)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Clipboard pode falhar em contexto não seguro (http) ou sem
        // permissão — o campo de texto continua selecionável manualmente.
      });
  };

  if (status === "confirmed") {
    return (
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 sm:p-8 text-center shadow-sm animate-in fade-in zoom-in-95 duration-500">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 animate-in zoom-in duration-700" />
        <h3 className="mt-3 text-base sm:text-lg font-bold text-emerald-800">Pagamento confirmado!</h3>
        <p className="mt-1 text-xs sm:text-sm text-emerald-700">
          Obrigado! Você já pode fechar esta tela — a confirmação também chega no seu e-mail.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 sm:p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-emerald-600 mb-4">
        <QrCode className="h-5 w-5" />
        Leia o QR Code no seu app bancário
      </div>

      {qrCode && (
        <div className="flex justify-center mb-6 p-4 bg-white rounded-xl border border-emerald-200">
          <img
            src={qrCode}
            alt="QR Code para pagamento via Pix"
            className="h-48 w-48 sm:h-64 sm:w-64 rounded-lg"
          />
        </div>
      )}

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Ou copie o código PIX</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={copyPaste}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs text-gray-600"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
              }`}
            >
              {copied ? "✓" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
          </span>
          <p>
            Aguardando confirmação do pagamento...
            {expiration && ` Código Pix válido até ${new Date(expiration).toLocaleString("pt-BR")}.`}
          </p>
        </div>
      </div>
    </div>
  );
}

function CardPaymentSuccess({ invoiceUrl }: { invoiceUrl?: string }) {
  return (
    <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 sm:p-8 text-center shadow-sm animate-in fade-in zoom-in-95 duration-500">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 animate-in zoom-in duration-700" />
      <h3 className="mt-3 text-base sm:text-lg font-bold text-emerald-800">Pagamento aprovado!</h3>
      <p className="mt-1 text-xs sm:text-sm text-emerald-700">
        Seu cartão foi cobrado com sucesso. A confirmação também chega no seu e-mail.
      </p>
      {invoiceUrl && (
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
        >
          Ver comprovante
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

// ============= MAIN COMPONENT =============
function CheckoutPage() {
  const [mode, setMode] = useState<Mode>("subscription");
  const [selectedPlan, setSelectedPlan] = useState<Offer>(PLANS[1]);
  const [selectedProject, setSelectedProject] = useState<Offer>(PROJECTS[0]);
  const [donationAmount, setDonationAmount] = useState(DONATION_PRESETS[1]);
  const [customDonation, setCustomDonation] = useState("");
  const [billingType, setBillingType] = useState<BillingType>("PIX");
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [pixStatus, setPixStatus] = useState<PixStatus>("idle");
  const [cardStatus, setCardStatus] = useState<CardStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [cardValid, setCardValid] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    holderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    cpfCnpj: "",
    postalCode: "",
    addressNumber: "",
  });

  const pollRef = useRef<number | null>(null);
  const pollAttemptsRef = useRef(0);

  const donationOffer: Offer = {
    id: "donation",
    name: "Doação",
    tagline: "Ajude a plataforma a crescer",
    price: customDonation !== "" ? Number(customDonation) || 0 : donationAmount,
    icon: Heart,
    features: DONATION_BENEFITS,
  };

  const activeOffer =
    mode === "subscription" ? selectedPlan : mode === "project" ? selectedProject : donationOffer;

  const actionVerb = mode === "subscription" ? "Assinar" : mode === "project" ? "Contratar" : "Doar";
  const canInstall = billingType === "CREDIT_CARD" && mode !== "donation";
  const installmentValue = activeOffer.price / installments;

  useEffect(() => {
    if (!canInstall) setInstallments(1);
  }, [canInstall]);

  // Limpa QR Code / confirmação de uma seleção anterior sempre que o
  // usuário muda de ideia (plano, projeto, valor da doação ou forma de
  // pagamento), pra nunca deixar informação de um pedido antigo na tela.
  function resetPaymentState() {
    setPaymentData(null);
    setPixStatus("idle");
    setCardStatus("idle");
    setError(null);
  }

  // Faz o polling do status da cobrança Pix até confirmar (ou até atingir
  // um limite de tentativas, pra não rodar pra sempre em segundo plano).
  useEffect(() => {
    if (billingType !== "PIX" || !paymentData?.pixQrCode || !paymentData.paymentId) return;

    setPixStatus("pending");
    pollAttemptsRef.current = 0;

    const checkStatus = async () => {
      pollAttemptsRef.current += 1;
      try {
        const res = await fetch(`/api/pagamento?paymentId=${paymentData.paymentId}`);
        const data = await res.json();
        const confirmedStates = ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"];
        if (data.success && confirmedStates.includes(data.status)) {
          setPixStatus("confirmed");
          setToast({ message: "Pagamento confirmado! 🎉", type: "success" });
          if (pollRef.current) window.clearInterval(pollRef.current);
        } else if (pollAttemptsRef.current >= 90) {
          // ~7,5 minutos de polling a cada 5s
          if (pollRef.current) window.clearInterval(pollRef.current);
        }
      } catch {
        // Falha de rede pontual não deve interromper o polling
      }
    };

    checkStatus();
    pollRef.current = window.setInterval(checkStatus, 5000);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [paymentData?.paymentId, paymentData?.pixQrCode, billingType]);

  function selectMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    resetPaymentState();
  }

  function selectBillingType(id: BillingType) {
    if (id === billingType) return;
    setBillingType(id);
    if (id === "PIX") setInstallments(1);
    resetPaymentState();
  }

  async function handlePayment() {
    if (!customerData.name || !customerData.email || !customerData.phone || !customerData.cpfCnpj) {
      setError("Por favor, preencha nome, e-mail, telefone e CPF/CNPJ.");
      return;
    }

    if (!isValidCpfCnpj(customerData.cpfCnpj)) {
      setError("CPF ou CNPJ inválido. Confira os números digitados.");
      return;
    }

    if (mode === "donation" && activeOffer.price <= 0) {
      setError("Informe um valor de doação maior que zero.");
      return;
    }

    if (billingType === "CREDIT_CARD") {
      if (!cardValid) {
        setError("Por favor, valide os dados do cartão.");
        return;
      }
      if (!customerData.postalCode || !customerData.addressNumber) {
        setError("Informe o CEP e o número do endereço para pagamento com cartão.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setPaymentData(null);
    setPixStatus("idle");
    setCardStatus("idle");

    try {
      const response = await fetch("/api/pagamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: activeOffer.price,
          billingType,
          serviceType: mode,
          itemId: activeOffer.id,
          installmentCount: canInstall && installments > 1 ? installments : 1,
          description: `${mode === "subscription" ? "Assinatura" : mode === "project" ? "Projeto" : "Doação"} - ${activeOffer.name}`,
          customerEmail: customerData.email,
          customerName: customerData.name,
          customerPhone: customerData.phone,
          customerCpfCnpj: customerData.cpfCnpj,
          customerPostalCode: customerData.postalCode || undefined,
          customerAddressNumber: customerData.addressNumber || undefined,
          cardData: billingType === "CREDIT_CARD" ? cardData : undefined,
        }),
      });

      // Se a rota /api/pagamento não existir (ou o servidor cair em algum
      // fallback), a resposta vem como HTML em vez de JSON. Detectamos
      // isso aqui pra mostrar um erro claro em vez do JSON.parse quebrar
      // com "Unexpected token '<'".
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          "Não foi possível conectar à rota de pagamento (/api/pagamento). Verifique se o servidor está no ar e tente novamente.",
        );
      }

      const data: PaymentResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar pagamento");
      }

      if (data.success) {
        setPaymentData(data);
        if (billingType === "CREDIT_CARD") setCardStatus("success");
        setToast({
          message:
            billingType === "PIX"
              ? "QR Code gerado! Escaneie para concluir."
              : "Pagamento aprovado com sucesso!",
          type: "success",
        });
      } else {
        setError(data.error || "Erro ao gerar pagamento");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Não foi possível gerar o pagamento. Tente novamente.";
      setError(errorMsg);
      setToast({ message: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white py-12 sm:py-20 lg:py-28 text-black">
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 sm:h-72 w-64 sm:w-72 rounded-full bg-primary/10 blur-3xl motion-safe:animate-pulse lg:h-96 lg:w-96" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 sm:h-72 w-64 sm:w-72 rounded-full bg-accent/10 blur-3xl motion-safe:animate-pulse [animation-delay:1.2s] lg:h-96 lg:w-96" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-48 sm:h-64 w-48 sm:w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Pagamento seguro com Asaas
            </span>

            <h1 className="mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-black">
              Escolha {mode === "subscription" ? "seu" : mode === "project" ? "o" : "como"}{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {mode === "subscription" ? "plano ideal" : mode === "project" ? "projeto ideal" : "apoiar"}
              </span>
            </h1>
            <p className="mx-auto mt-3 sm:mt-5 max-w-lg text-sm sm:text-base lg:text-lg text-gray-600">
              {mode === "subscription"
                ? "PIX com QR Code ou cartão de crédito — parcele em até 3x. Cancele quando quiser, sem multa."
                : mode === "project"
                ? "PIX com QR Code ou cartão de crédito — parcele em até 3x. Comece seu projeto em poucos dias."
                : "Todo valor ajuda. Pague com PIX ou cartão e apoie diretamente o crescimento da plataforma."}
            </p>
          </div>
        </Reveal>

        {/* Modo */}
        <Reveal>
          <div className="mt-6 sm:mt-8 flex justify-center">
            <div className="inline-flex flex-wrap justify-center rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => selectMode("subscription")}
                aria-pressed={mode === "subscription"}
                className={`flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                  mode === "subscription"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <Repeat className="h-4 w-4" />
                Assinatura
              </button>
              <button
                type="button"
                onClick={() => selectMode("project")}
                aria-pressed={mode === "project"}
                className={`flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                  mode === "project"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Projeto
              </button>
              <button
                type="button"
                onClick={() => selectMode("donation")}
                aria-pressed={mode === "donation"}
                className={`flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                  mode === "donation"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <Heart className="h-4 w-4" />
                Doação
              </button>
            </div>
          </div>
        </Reveal>

        {/* Grid principal */}
        <div className="mt-10 sm:mt-12 grid gap-6 sm:gap-8 lg:grid-cols-5">
          {/* Coluna Ofertas */}
          <Reveal className="lg:col-span-2">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Escolha uma opção</h2>
              <div key={mode} className="grid gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                {mode === "subscription" &&
                  PLANS.map((plan) => (
                    <OfferCard
                      key={plan.id}
                      offer={plan}
                      isSelected={selectedPlan.id === plan.id}
                      onSelect={() => {
                        if (selectedPlan.id === plan.id) return;
                        setSelectedPlan(plan);
                        resetPaymentState();
                      }}
                      priceSuffix="/mês"
                    />
                  ))}
                {mode === "project" &&
                  PROJECTS.map((project) => (
                    <OfferCard
                      key={project.id}
                      offer={project}
                      isSelected={selectedProject.id === project.id}
                      onSelect={() => {
                        if (selectedProject.id === project.id) return;
                        setSelectedProject(project);
                        resetPaymentState();
                      }}
                      pricePrefix="A partir de"
                    />
                  ))}
                {mode === "donation" && (
                  <DonationPicker
                    selected={donationAmount}
                    isCustom={customDonation !== ""}
                    customValue={customDonation}
                    onSelectPreset={(amount) => {
                      if (customDonation === "" && donationAmount === amount) return;
                      setDonationAmount(amount);
                      setCustomDonation("");
                      resetPaymentState();
                    }}
                    onCustomChange={(value) => {
                      setCustomDonation(value);
                      resetPaymentState();
                    }}
                  />
                )}
              </div>
            </div>
          </Reveal>

          {/* Coluna Pagamento */}
          <Reveal className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Dados do Cliente */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Seus dados</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="CPF ou CNPJ"
                    value={customerData.cpfCnpj}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, cpfCnpj: formatCpfCnpj(e.target.value) })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {billingType === "CREDIT_CARD" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <input
                      type="text"
                      placeholder="CEP"
                      value={customerData.postalCode}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, postalCode: formatCep(e.target.value) })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="Número do endereço"
                      value={customerData.addressNumber}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, addressNumber: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Resumo do pedido</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {mode === "donation" ? "Doação" : "Opção selecionada"}
                  </span>
                  <span className="font-medium text-gray-900">{activeOffer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Forma de pagamento</span>
                  <span className="font-medium text-gray-900">
                    {PAYMENT_METHODS.find((m) => m.id === billingType)?.label}
                  </span>
                </div>
                {installments > 1 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parcelamento</span>
                    <span className="font-medium text-gray-900">
                      {installments}x de {formatBRL(installmentValue)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-lg sm:text-xl font-bold text-primary transition-all duration-300">
                    {formatBRL(activeOffer.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Forma de pagamento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isActive = billingType === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => selectBillingType(method.id)}
                      className={`flex items-center gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all duration-200 text-left active:scale-[0.98] ${
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          ACCENT_CLASSES[method.accent]
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs sm:text-sm font-semibold text-black">
                          {method.label}
                        </span>
                        <span className="block text-xs text-gray-600">{method.hint}</span>
                      </span>
                      {isActive && (
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 animate-in zoom-in duration-200" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parcelamento */}
            {canInstall && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Parcelamento</h3>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => {
                    const isActive = installments === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setInstallments(n)}
                        className={`flex flex-1 flex-col items-center rounded-lg border-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                          isActive
                            ? "border-primary bg-primary/10 text-black"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <span>{n === 1 ? "À vista" : `${n}x`}</span>
                        {n > 1 && (
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {formatBRL(activeOffer.price / n)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Formulário de Cartão / Confirmação */}
            {billingType === "CREDIT_CARD" &&
              (cardStatus === "success" ? (
                <CardPaymentSuccess invoiceUrl={paymentData?.invoiceUrl} />
              ) : (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                    Dados do cartão
                  </h3>
                  <CreditCardForm card={cardData} onChange={setCardData} onValidChange={setCardValid} />
                </div>
              ))}

            {/* QR Code PIX */}
            {billingType === "PIX" && paymentData?.pixQrCode && (
              <PixQRCode
                qrCode={paymentData.pixQrCode}
                copyPaste={paymentData.pixCopyPaste || ""}
                status={pixStatus}
                expiration={paymentData.pixExpiration}
              />
            )}

            {/* Errors */}
            {error && (
              <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 animate-in fade-in slide-in-from-top-1 duration-300">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Botão Principal */}
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading || pixStatus === "confirmed" || cardStatus === "success"}
              className="w-full group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 active:scale-[0.99]"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : pixStatus === "confirmed" || cardStatus === "success" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Pagamento confirmado
                </>
              ) : installments > 1 ? (
                <>
                  {actionVerb} — {installments}x {formatBRL(installmentValue)}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              ) : mode === "donation" ? (
                <>
                  Doar {formatBRL(activeOffer.price)}
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                </>
              ) : (
                <>
                  {actionVerb} por {formatBRL(activeOffer.price)}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-x-4 text-xs text-gray-600 pt-2">
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4" />
                SSL/TLS
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Asaas
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                Sem taxas
              </span>
            </div>
          </Reveal>
        </div>

        {/* Como funciona */}
        <Reveal>
          <div className="mt-20 sm:mt-28">
            <h2 className="text-center text-2xl sm:text-3xl font-bold text-black">
              Como funciona
            </h2>
            <div className="mt-8 sm:mt-10 grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Escolha uma opção",
                  desc: "Assinatura, projeto sob demanda ou uma doação livre.",
                },
                {
                  step: "02",
                  title: "Escolha o pagamento",
                  desc: "PIX na hora ou cartão de crédito em até 3x.",
                },
                {
                  step: "03",
                  title: "Aproveite agora",
                  desc: "Acesso liberado assim que o pagamento é confirmado.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl sm:text-3xl font-extrabold text-transparent">
                    {item.step}
                  </span>
                  <h3 className="mt-3 font-semibold text-black text-sm sm:text-base">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal>
          <div className="mt-20 sm:mt-28">
            <h2 className="text-center text-2xl sm:text-3xl font-bold text-black">
              Perguntas frequentes
            </h2>
            <div className="mx-auto mt-6 sm:mt-8 max-w-2xl space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-black text-sm sm:text-base [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-gray-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Suporte */}
        <Reveal>
          <div className="mt-20 sm:mt-28 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 lg:p-10 text-center">
            <HelpCircle className="mx-auto h-8 w-8 text-accent" />
            <h2 className="mt-3 text-xl sm:text-2xl font-bold text-black">
              Precisa de ajuda?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-gray-600">
              Suporte via WhatsApp ou e-mail — respondemos rápido.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
              <a
                href="https://wa.me/5511990047011"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-black transition-all hover:bg-gray-50 hover:shadow-sm active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                WhatsApp
              </a>
              <a
                href="mailto:suporte@seudominio.com"
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-black transition-all hover:bg-gray-50 hover:shadow-sm active:scale-[0.98]"
              >
                <Mail className="h-4 w-4 text-accent" />
                E-mail
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default CheckoutPage;