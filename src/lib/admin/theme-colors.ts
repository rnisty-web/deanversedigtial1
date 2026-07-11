// Chart.js needs concrete color strings, so read the active dashboard theme's
// CSS variables at render time (with classic-palette fallbacks for SSR).

const CLASSIC = {
  gold: "#c9a962",
  goldLight: "#dfc88a",
  emerald: "#6f8f72",
  emeraldDeep: "#2f5d50",
  danger: "#c45c5c",
  text: "rgba(245, 242, 235, 0.55)",
};

export function getAdminThemeColor(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const el =
    document.querySelector(".admin-theme, .portal-theme") ?? document.documentElement;
  const value = getComputedStyle(el).getPropertyValue(varName).trim();
  return value || fallback;
}

export type AdminChartPalette = {
  gold: string;
  goldLight: string;
  emerald: string;
  emeraldDeep: string;
  danger: string;
  text: string;
};

export function getAdminChartPalette(): AdminChartPalette {
  return {
    gold: getAdminThemeColor("--admin-gold", CLASSIC.gold),
    goldLight: getAdminThemeColor("--admin-gold-light", CLASSIC.goldLight),
    emerald: getAdminThemeColor("--admin-emerald", CLASSIC.emerald),
    emeraldDeep: getAdminThemeColor("--admin-emerald-deep", CLASSIC.emeraldDeep),
    danger: getAdminThemeColor("--admin-danger", CLASSIC.danger),
    text: CLASSIC.text,
  };
}

/** Convert a hex color (#rgb or #rrggbb) to rgba() with the given alpha. */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.trim();
  if (!hex.startsWith("#")) return hex;
  const raw = hex.slice(1);
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
