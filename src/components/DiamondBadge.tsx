import { TIERS, type DiamondTier } from "@/lib/diamond";

export function DiamondBadge({
  tier,
  score,
  size = 28,
  showLabel = false,
}: {
  tier: DiamondTier;
  score?: number;
  size?: number;
  showLabel?: boolean;
}) {
  const t = TIERS[tier] ?? TIERS.negro;
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="relative inline-grid place-items-center rounded-xl transition-transform duration-500 hover:scale-110 hover:rotate-6"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(140deg, ${t.from}, ${t.to})`,
          boxShadow: `0 0 0 1.5px ${t.ring}, 0 8px 24px -8px ${t.ring}`,
        }}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none">
          <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="rgba(255,255,255,.85)" />
          <path d="M6 3l6 18L2 9l4-6z" fill="rgba(255,255,255,.45)" />
        </svg>
        <span className="pointer-events-none absolute inset-0 rounded-xl opacity-50 mix-blend-overlay animate-shimmer" />
      </span>
      {showLabel && (
        <span className="text-xs font-semibold">
          {t.label}
          {typeof score === "number" && <span className="opacity-60"> · {score}</span>}
        </span>
      )}
    </span>
  );
}
