export type SiteSettings = {
  accent: "azul" | "ciano" | "roxo" | "verde";
  density: "compacto" | "confortavel" | "amplo";
  fontScale: number; // 0.9 - 1.15
  animations: boolean;
  glass: boolean;
  floatingSocial: boolean;
  language: "pt" | "en";
};

export const DEFAULT_SETTINGS: SiteSettings = {
  accent: "azul",
  density: "confortavel",
  fontScale: 1,
  animations: true,
  glass: true,
  floatingSocial: true,
  language: "pt",
};

export const ACCENTS: Record<
  SiteSettings["accent"],
  { primary: string; accent: string; ring: string; label: string; swatch: string }
> = {
  azul: {
    primary: "oklch(0.72 0.19 245)",
    accent: "oklch(0.78 0.15 220)",
    ring: "oklch(0.72 0.19 245)",
    label: "Azul AWS",
    swatch: "#3b82f6",
  },
  ciano: {
    primary: "oklch(0.75 0.14 205)",
    accent: "oklch(0.82 0.13 195)",
    ring: "oklch(0.75 0.14 205)",
    label: "Ciano",
    swatch: "#22d3ee",
  },
  roxo: {
    primary: "oklch(0.65 0.2 285)",
    accent: "oklch(0.74 0.16 300)",
    ring: "oklch(0.65 0.2 285)",
    label: "Violeta",
    swatch: "#8b5cf6",
  },
  verde: {
    primary: "oklch(0.7 0.16 165)",
    accent: "oklch(0.8 0.14 175)",
    ring: "oklch(0.7 0.16 165)",
    label: "Esmeralda",
    swatch: "#10b981",
  },
};

const KEY = "ie_site_settings";

export function loadSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<SiteSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: SiteSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  applySettings(s);
  window.dispatchEvent(new CustomEvent("ie:settings", { detail: s }));
}

export function applySettings(s: SiteSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const a = ACCENTS[s.accent] ?? ACCENTS.azul;
  root.style.setProperty("--primary", a.primary);
  root.style.setProperty("--accent", a.accent);
  root.style.setProperty("--ring", a.ring);
  root.style.setProperty("--font-scale", String(s.fontScale));
  root.dataset.density = s.density;
  root.dataset.animations = s.animations ? "on" : "off";
  root.dataset.glass = s.glass ? "on" : "off";
  root.dataset.social = s.floatingSocial ? "on" : "off";
}
