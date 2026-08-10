import { useEffect, useState } from "react";
import { applySettings, loadSettings, saveSettings, type SiteSettings } from "@/lib/site-settings";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(loadSettings);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    applySettings(s);
    const onChange = (e: Event) => setSettings((e as CustomEvent<SiteSettings>).detail);
    window.addEventListener("ie:settings", onChange as EventListener);
    return () => window.removeEventListener("ie:settings", onChange as EventListener);
  }, []);

  function update(patch: Partial<SiteSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }

  return { settings, update };
}
