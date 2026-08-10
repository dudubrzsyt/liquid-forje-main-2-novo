export type DiamondTier = "negro" | "rosa" | "perolado" | "rubi" | "diamante_negro" | "elite";

export const TIERS: Record<
  DiamondTier,
  { label: string; from: string; to: string; ring: string; min: number }
> = {
  negro: {
    label: "Diamante Negro Bruto",
    from: "#3f3f46",
    to: "#0a0a0a",
    ring: "rgba(255,255,255,.35)",
    min: 0,
  },
  rosa: {
    label: "Diamante Rosa",
    from: "#f9a8d4",
    to: "#be185d",
    ring: "rgba(249,168,212,.6)",
    min: 20,
  },
  perolado: {
    label: "Diamante Perolado",
    from: "#f8fafc",
    to: "#94a3b8",
    ring: "rgba(226,232,240,.7)",
    min: 40,
  },
  rubi: { label: "Rubi", from: "#fb7185", to: "#9f1239", ring: "rgba(244,63,94,.6)", min: 60 },
  diamante_negro: {
    label: "Diamante Negro",
    from: "#a78bfa",
    to: "#111827",
    ring: "rgba(167,139,250,.6)",
    min: 75,
  },
  elite: { label: "Elite", from: "#67e8f9", to: "#1d4ed8", ring: "rgba(103,232,249,.7)", min: 90 },
};

export const TIER_ORDER: DiamondTier[] = [
  "negro",
  "rosa",
  "perolado",
  "rubi",
  "diamante_negro",
  "elite",
];

export function tierFromScore(score: number): DiamondTier {
  let tier: DiamondTier = "negro";
  for (const t of TIER_ORDER) if (score >= TIERS[t].min) tier = t;
  return tier;
}

export type Seniority = "estagiario" | "junior" | "pleno" | "senior" | "especialista";

export const SENIORITY_LABEL: Record<Seniority, string> = {
  estagiario: "Estagiário",
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
  especialista: "Especialista",
};

export const PLANS = {
  basico: {
    id: "basico" as const,
    name: "Básico Rubi / Diamante Negro",
    priceCents: 4500,
    price: "R$ 45",
    note: "por mês",
    benefits: [
      "Aparece no ranking público de devs",
      "Posição elevada acima dos perfis sem assinatura",
      "Score médio com selo de diamante",
      "Contato direto liberado com clientes",
    ],
  },
  elite: {
    id: "elite" as const,
    name: "Elite com IA",
    priceCents: 8500,
    price: "R$ 85",
    oldPrice: "R$ 90",
    note: "por mês · desconto de R$ 5",
    benefits: [
      "Análise de currículo e GitHub com IA",
      "Filtro de clientes premium (projetos 25k+)",
      "Destaque máximo no topo do ranking",
      "Selo Elite animado no perfil",
      "Reanálise de score sob demanda",
    ],
  },
};

export type PlanId = keyof typeof PLANS;

export function planWeight(plan?: PlanId | null) {
  if (plan === "elite") return 2;
  if (plan === "basico") return 1;
  return 0;
}
