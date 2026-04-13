// ─── Atlas — UI Constants ─────────────────────────────────────────
// Shared visual constants. No duplication across components.

export const INTENSITY_COLORS: Record<number, string> = {
  1: "#10B981",
  2: "#10B981",
  3: "#F59E0B",
  4: "#EF4444",
  5: "#DC2626",
};

export const INTENSITY_ICONS: Record<number, string> = {
  1: "🐢",
  2: "🌿",
  3: "⚖️",
  4: "🚀",
  5: "🔥",
};

export const INTENSITY_LABELS: Record<number, string> = {
  1: "Très calme",
  2: "Calme",
  3: "Modéré",
  4: "Dense",
  5: "Très dense",
};

export function scoreColor(score: number): string {
  if (score >= 85) return "#059669";
  if (score >= 60) return "#C9A84C";
  if (score >= 30) return "#D97706";
  return "#DC2626";
}

export const ACTIVITY_COLORS: Record<string, { bg: string; text: string }> = {
  culture: { bg: "#EDE9FE", text: "#5B21B6" },
  food: { bg: "#FEF3C7", text: "#92400E" },
  free: { bg: "#D1FAE5", text: "#065F46" },
  logistics: { bg: "#E0E7FF", text: "#3730A3" },
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  culture: "Culture",
  food: "Gastronomie",
  free: "Temps libre",
  logistics: "Logistique",
};

export const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  info: { bg: "#EFF6FF", border: "#BFDBFE", icon: "ℹ️" },
  caution: { bg: "#FFFBEB", border: "#FDE68A", icon: "⚠️" },
  warning: { bg: "#FEF2F2", border: "#FECACA", icon: "🚨" },
};
