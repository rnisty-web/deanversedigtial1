export type DashboardThemeId =
  | "classic"
  | "rose"
  | "slate"
  | "midnight"
  | "crimson"
  | "ember"
  | "aurora"
  | "platinum";

export const DASHBOARD_THEME_SETTINGS_KEY = "dashboardTheme";

export type DashboardThemeDefinition = {
  id: DashboardThemeId;
  name: string;
  description: string;
  accent: string;
  accentLight: string;
  secondary: string;
  background: string;
  panel: string;
};

export const DASHBOARD_THEMES: DashboardThemeDefinition[] = [
  {
    id: "classic",
    name: "Gold & Emerald",
    description: "The signature luxury palette — warm gold accents over deep emerald structure.",
    accent: "#c9a962",
    accentLight: "#dfc88a",
    secondary: "#6f8f72",
    background: "#050505",
    panel: "#121715",
  },
  {
    id: "rose",
    name: "Rose & Copper",
    description: "Soft and warm — rose-gold highlights with muted copper undertones.",
    accent: "#d4a87a",
    accentLight: "#e8c9a0",
    secondary: "#9a7a72",
    background: "#0a0808",
    panel: "#151012",
  },
  {
    id: "slate",
    name: "Slate & Teal",
    description: "A cool executive look — silver-blue accents with deep teal structure.",
    accent: "#8eb4c9",
    accentLight: "#b8d4e8",
    secondary: "#4a8a8f",
    background: "#050608",
    panel: "#0f1418",
  },
  {
    id: "midnight",
    name: "Midnight Amethyst",
    description: "After-hours energy — luminous violet accents over a deep indigo night.",
    accent: "#b8a3e8",
    accentLight: "#d4c6f2",
    secondary: "#7a6ab0",
    background: "#08060f",
    panel: "#13101f",
  },
  {
    id: "crimson",
    name: "Ruby Noir",
    description: "Dramatic and cinematic — smoked ruby accents on near-black velvet.",
    accent: "#d98a8f",
    accentLight: "#eeb4b8",
    secondary: "#a05568",
    background: "#0b0507",
    panel: "#180d11",
  },
  {
    id: "ember",
    name: "Ember & Bronze",
    description: "Fireside warmth — burnt amber accents with bronzed, glowing panels.",
    accent: "#e0904d",
    accentLight: "#f2ba85",
    secondary: "#a5643a",
    background: "#0a0603",
    panel: "#181009",
  },
  {
    id: "aurora",
    name: "Aurora Mint",
    description: "Fresh and electric — glacial mint accents drifting over polar green depths.",
    accent: "#7adcb0",
    accentLight: "#aeeed2",
    secondary: "#3f9d78",
    background: "#040a08",
    panel: "#0d1713",
  },
  {
    id: "platinum",
    name: "Platinum Graphite",
    description: "Pure monochrome minimalism — polished platinum on graphite black.",
    accent: "#c8ccd8",
    accentLight: "#e8eaf0",
    secondary: "#82889a",
    background: "#060608",
    panel: "#131318",
  },
];

export const DEFAULT_DASHBOARD_THEME: DashboardThemeId = "classic";

const THEME_IDS = new Set<string>(DASHBOARD_THEMES.map((theme) => theme.id));

export function parseDashboardTheme(value: unknown): DashboardThemeId {
  if (typeof value === "string") {
    const trimmed = value.replace(/"/g, "").trim();
    if (THEME_IDS.has(trimmed)) {
      return trimmed as DashboardThemeId;
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
