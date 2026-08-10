import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { parseGithubLogin, fetchGithubSignals, baseScore, aiReview, decide } from "@/lib/devs.server";

const DevInput = z.object({
  full_name: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(255),
  age: z.number().int().min(14).max(99),
  bio: z.string().trim().min(40).max(2000),
  stack: z.array(z.string().trim().min(1).max(2000)).min(1).max(2000),
  seniority: z.enum(["estagiario", "junior", "pleno", "senior", "especialista"]),
  education: z.string().trim().min(2).max(2000),
  github_url: z.string().trim().min(4).max(1000),
  linkedin_url: z.string().trim().url().max(1000),
  avatar_url: z.string().trim().max(1000).nullable().optional(),
});

export const submitDevProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DevInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const login = parseGithubLogin(data.github_url);
    if (!login) {
      return { ok: false as const, error: "Informe um link válido do GitHub (ex.: https://github.com/seu-usuario)." };
    }

    const { data: profile, error: upsertError } = await supabase
      .from("dev_profiles")
      .upsert(
        {
          user_id: userId,
          full_name: data.full_name,
          email: data.email,
          age: data.age,
          bio: data.bio,
          stack: data.stack,
          seniority: data.seniority,
          education: data.education,
          github_url: `https://github.com/${login}`,
          github_login: login,
          linkedin_url: data.linkedin_url,
          avatar_url: data.avatar_url ?? null,
          status: "em_analise",
        },
        { onConflict: "user_id" },
      )
      .select("id")
      .single();

    if (upsertError || !profile) {
      return { ok: false as const, error: "Não foi possível salvar seu perfil. Tente novamente." };
    }

    const signals = await fetchGithubSignals(login);
    if (!signals) {
      await supabase.from("dev_profiles").update({ github_verified: false, status: "em_analise" }).eq("user_id", userId);
      return {
        ok: true as const,
        verified: false,
        message: "Perfil salvo, mas não conseguimos verificar seu GitHub. Confira o link — a verificação é obrigatória.",
      };
    }

    const heuristic = baseScore(signals);
    const { score, summary } = await aiReview({
      signals,
      bio: data.bio,
      stack: data.stack,
      seniority: data.seniority,
      education: data.education,
      heuristic,
    });
    const { tier, approved } = decide(score);

    await supabase.from("dev_ai_analysis").insert({
      dev_profile_id: profile.id,
      user_id: userId,
      github_data: JSON.parse(JSON.stringify(signals)),
      summary,
      score,
      tier,
    });

    await supabase
      .from("dev_profiles")
      .update({ score, tier, github_verified: true, status: approved ? "aprovado" : "em_analise" })
      .eq("user_id", userId);

    return { ok: true as const, verified: true, score, tier, approved, summary };
  });

export const reanalyzeDevProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("dev_profiles")
      .select("id, github_login, bio, stack, seniority, education")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile?.github_login) return { ok: false as const, error: "Cadastre seu perfil de dev primeiro." };

    const signals = await fetchGithubSignals(profile.github_login);
    if (!signals) return { ok: false as const, error: "GitHub indisponível no momento." };

    const heuristic = baseScore(signals);
    const { score, summary } = await aiReview({
      signals,
      bio: profile.bio ?? "",
      stack: profile.stack ?? [],
      seniority: profile.seniority ?? "junior",
      education: profile.education ?? "",
      heuristic,
    });
    const { tier, approved } = decide(score);

    await supabase.from("dev_ai_analysis").insert({
      dev_profile_id: profile.id,
      user_id: userId,
      github_data: JSON.parse(JSON.stringify(signals)),
      summary,
      score,
      tier,
    });
    await supabase
      .from("dev_profiles")
      .update({ score, tier, github_verified: true, status: approved ? "aprovado" : "em_analise" })
      .eq("user_id", userId);

    return { ok: true as const, score, tier, approved, summary };
  });
