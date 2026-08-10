import { tierFromScore, type DiamondTier } from "@/lib/diamond";

export type GithubSignals = {
  login: string;
  createdAt: string | null;
  accountAgeYears: number;
  publicRepos: number;
  followers: number;
  languages: string[];
  totalStars: number;
  recentPushDays: number | null;
  topRepos: { name: string; stars: number; language: string | null; pushedAt: string }[];
};

export function parseGithubLogin(url: string): string | null {
  const m = url.trim().match(/github\.com\/([A-Za-z0-9-_.]+)/i);
  if (m) return m[1].replace(/\/$/, "");
  const bare = url.trim().replace(/^@/, "");
  return /^[A-Za-z0-9-_.]+$/.test(bare) ? bare : null;
}

const GH_HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "diamante-dev-platform",
};

export async function fetchGithubSignals(login: string): Promise<GithubSignals | null> {
  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, { headers: GH_HEADERS });
  if (!userRes.ok) return null;
  const user = (await userRes.json()) as Record<string, unknown>;

  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=100&sort=pushed`,
    { headers: GH_HEADERS },
  );
  const repos = reposRes.ok ? ((await reposRes.json()) as Record<string, unknown>[]) : [];

  const createdAt = typeof user.created_at === "string" ? user.created_at : null;
  const ageYears = createdAt ? (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365) : 0;

  const langCount = new Map<string, number>();
  let stars = 0;
  let lastPush = 0;
  for (const r of repos) {
    if (r.fork) continue;
    const lang = typeof r.language === "string" ? r.language : null;
    if (lang) langCount.set(lang, (langCount.get(lang) ?? 0) + 1);
    stars += typeof r.stargazers_count === "number" ? r.stargazers_count : 0;
    const p = typeof r.pushed_at === "string" ? new Date(r.pushed_at).getTime() : 0;
    if (p > lastPush) lastPush = p;
  }

  const ownRepos = repos.filter((r) => !r.fork);

  return {
    login: String(user.login ?? login),
    createdAt,
    accountAgeYears: Number(ageYears.toFixed(2)),
    publicRepos: typeof user.public_repos === "number" ? user.public_repos : ownRepos.length,
    followers: typeof user.followers === "number" ? user.followers : 0,
    languages: [...langCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([l]) => l),
    totalStars: stars,
    recentPushDays: lastPush ? Math.round((Date.now() - lastPush) / 86400000) : null,
    topRepos: ownRepos
      .slice(0, 8)
      .map((r) => ({
        name: String(r.name ?? ""),
        stars: typeof r.stargazers_count === "number" ? r.stargazers_count : 0,
        language: typeof r.language === "string" ? r.language : null,
        pushedAt: typeof r.pushed_at === "string" ? r.pushed_at : "",
      })),
  };
}

export function baseScore(s: GithubSignals): number {
  const age = Math.min(20, s.accountAgeYears * 5);
  const repos = Math.min(20, s.publicRepos * 1.5);
  const langs = Math.min(15, s.languages.length * 3);
  const stars = Math.min(15, Math.log2(s.totalStars + 1) * 4);
  const followers = Math.min(10, Math.log2(s.followers + 1) * 3);
  const activity =
    s.recentPushDays == null ? 0 : s.recentPushDays <= 30 ? 20 : s.recentPushDays <= 90 ? 14 : s.recentPushDays <= 365 ? 7 : 2;
  return Math.round(Math.max(0, Math.min(100, age + repos + langs + stars + followers + activity)));
}

export async function aiReview(input: {
  signals: GithubSignals;
  bio: string;
  stack: string[];
  seniority: string;
  education: string;
  heuristic: number;
}): Promise<{ score: number; summary: string }> {
  const key = process.env.LOVABLE_API_KEY;
  const fallback = {
    score: input.heuristic,
    summary: "Score calculado a partir dos sinais públicos do GitHub (idade da conta, repositórios, linguagens e atividade recente).",
  };
  if (!key) return fallback;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        reasoning_effort: "none",
        messages: [
          {
            role: "system",
            content:
              "Você avalia a confiabilidade técnica de desenvolvedores para um marketplace brasileiro. Responda SOMENTE JSON válido: {\"score\": number 0-100, \"summary\": string em português com no máximo 400 caracteres}. Seja rigoroso e objetivo; use o score heurístico como âncora e ajuste no máximo 15 pontos.",
          },
          {
            role: "user",
            content: JSON.stringify({
              heuristic_score: input.heuristic,
              github: input.signals,
              bio: input.bio,
              stack: input.stack,
              seniority: input.seniority,
              education: input.education,
            }),
          },
        ],
      }),
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    const parsed = JSON.parse(match[0]) as { score?: number; summary?: string };
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score ?? input.heuristic))));
    return { score: Number.isFinite(score) ? score : input.heuristic, summary: parsed.summary ?? fallback.summary };
  } catch {
    return fallback;
  }
}

export function decide(score: number): { tier: DiamondTier; approved: boolean } {
  return { tier: tierFromScore(score), approved: score >= 35 };
}
