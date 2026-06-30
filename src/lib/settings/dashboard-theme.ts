export type DashboardThemeId = "classic" | "rose" | "slate";

export const DASHBOARD_THEME_SETTINGS_KEY = "dashboardTheme";

export type DashboardThemeDefinition = {
  id: DashboardThemeId;
  name: string;
  description: string;
  accent: string;
  secondary: string;
  background: string;
};

export const DASHBOARD_THEMES: DashboardThemeDefinition[] = [
  {
    id: "classic",
    name: "Gold & Emerald",
    description: "The default luxury palette — warm gold accents with deep emerald tones.",
    accent: "#c9a962",
    secondary: "#6f8f72",
    background: "#050505",
  },
  {
    id: "rose",
    name: "Rose & Copper",
    description: "A softer, warmer dashboard — rose gold highlights with muted copper greens.",
    accent: "#d4a87a",
    secondary: "#9a7a72",
    background: "#0a0808",
  },
  {
    id: "slate",
    name: "Slate & Teal",
    description: "A cooler executive look — silver-blue accents with deep teal structure.",
    accent: "#8eb4c9",
    secondary: "#4a8a8f",
    background: "#050608",
  },
];

export const DEFAULT_DASHBOARD_THEME: DashboardThemeId = "classic";

export function parseDashboardTheme(value: unknown): DashboardThemeId {
  if (value === "classic" || value === "rose" || value === "slate") {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.replace(/"/g, "").trim();
    if (trimmed === "classic" || trimmed === "rose" || trimmed === "slate") {
      return trimmed;
    }
  }
  return DEFAULT_DASHBOARD_THEME;
}

export function getDashboardThemeDefinition(id: DashboardThemeId) {
  return DASHBOARD_THEMES.find((theme) => theme.id === id) ?? DASHBOARD_THEMES[0];
}

export function applyDashboardThemeToDocument(theme: DashboardThemeId) {
  if (typeof document === "undefined") return;
  document.querySelectorAll(".admin-theme, .portal-theme").forEach((node) => {
    node.setAttribute("data-dashboard-theme", theme);
  });
}
