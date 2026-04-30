// ─── Atlas — Comparator Table ─────────────────────────────────────
// Receives destinations as props. No direct data import.

import { scoreColor } from "@/data/ui-constants";
import type { Destination, ViewName } from "@/lib/types";

interface ComparatorTableProps {
  destinations: Destination[];
  onNavigate: (view: ViewName, slug: string) => void;
}

interface CriterionRow {
  label: string;
  extract: (d: Destination) => string | number;
  formatDisplay?: (d: Destination) => string;
  format?: (v: string | number) => string;
  lowerIsBetter?: boolean;
}

// ─── Display helpers ──────────────────────────────────────────────

function formatLogistics(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Bon";
  return "Modéré";
}

function formatCostLevel(costIndex: number): string {
  if (costIndex < 55) return "Abordable";
  if (costIndex < 88) return "Standard";
  return "Élevé";
}

function avgSeasonScore(d: Destination): number {
  const m = d.season.months;
  return m.reduce((s, mo) => s + mo.score, 0) / m.length;
}

// ─── Criteria ─────────────────────────────────────────────────────

const CRITERIA: CriterionRow[] = [
  {
    label: "Budget / jour (confort)",
    extract: (d) => (d.budget.comfort.min + d.budget.comfort.max) / 2,
    format: (v) => `${Math.round(v as number)} €`,
    lowerIsBetter: true,
  },
  {
    label: "Niveau de prix",
    extract: (d) => d.budget.costIndex,
    formatDisplay: (d) => formatCostLevel(d.budget.costIndex),
    lowerIsBetter: true,
  },
  {
    label: "Vol depuis Paris",
    extract: (d) => d.flightHoursFromParis,
    format: (v) => `${v} h`,
    lowerIsBetter: true,
  },
  {
    label: "Facilité logistique",
    extract: (d) => d.safety.logisticsScore,
    formatDisplay: (d) => formatLogistics(d.safety.logisticsScore),
  },
  {
    label: "Durée idéale",
    extract: (d) => d.idealDuration,
  },
  {
    label: "Rythme",
    extract: (d) => d.pace,
  },
  {
    label: "Intérêt principal",
    extract: (d) => d.mainInterest,
  },
];

// ─── Badges ───────────────────────────────────────────────────────

type BadgeType = "budget" | "flight_short" | "weather" | "exotic" | "score";

interface Badge {
  type: BadgeType;
  slug: string;
  label: string;
  icon: string;
}

function computeBadges(dests: Destination[]): Badge[] {
  if (dests.length < 2) return [];
  const badges: Badge[] = [];

  // Meilleur budget — lowest costIndex, unique winner only
  const costs = dests.map((d) => d.budget.costIndex);
  const minCost = Math.min(...costs);
  if (costs.filter((c) => c === minCost).length === 1) {
    badges.push({
      type: "budget",
      slug: dests.find((d) => d.budget.costIndex === minCost)!.slug,
      label: "Meilleur budget",
      icon: "💶",
    });
  }

  // Vol le plus court — lowest flightHoursFromParis, unique winner
  const flights = dests.map((d) => d.flightHoursFromParis);
  const minFlight = Math.min(...flights);
  if (flights.filter((f) => f === minFlight).length === 1) {
    badges.push({
      type: "flight_short",
      slug: dests.find((d) => d.flightHoursFromParis === minFlight)!.slug,
      label: "Vol le plus court",
      icon: "✈️",
    });
  }

  // Meilleure météo — highest average season score, unique winner
  const weatherScores = dests.map(avgSeasonScore);
  const maxWeather = Math.max(...weatherScores);
  const weatherWinners = weatherScores.filter((s) => Math.abs(s - maxWeather) < 0.01);
  if (weatherWinners.length === 1) {
    badges.push({
      type: "weather",
      slug: dests.find((d) => Math.abs(avgSeasonScore(d) - maxWeather) < 0.01)!.slug,
      label: "Meilleure météo",
      icon: "🌤️",
    });
  }

  // Le plus dépaysant — highest flightHoursFromParis, unique winner, must differ from shortest
  const maxFlight = Math.max(...flights);
  if (flights.filter((f) => f === maxFlight).length === 1 && maxFlight !== minFlight) {
    badges.push({
      type: "exotic",
      slug: dests.find((d) => d.flightHoursFromParis === maxFlight)!.slug,
      label: "Le plus dépaysant",
      icon: "🌍",
    });
  }

  // Le mieux noté — highest Atlas score, unique winner
  const scores = dests.map((d) => d.score);
  const maxScore = Math.max(...scores);
  if (scores.filter((s) => s === maxScore).length === 1) {
    badges.push({
      type: "score",
      slug: dests.find((d) => d.score === maxScore)!.slug,
      label: "Le mieux noté",
      icon: "⭐",
    });
  }

  return badges;
}

// ─── Synthesis ────────────────────────────────────────────────────

const ENV_REASON: Record<string, string> = {
  coastal: "tu veux une destination axée sur mer et littoral",
  nature: "les grands espaces naturels sont ta priorité",
  urban: "tu cherches une expérience urbaine intense",
  mixed: "tu veux un mélange de culture et de nature",
};

function synthesisReason(dest: Destination, badges: Badge[]): string {
  const myBadges = badges.filter((b) => b.slug === dest.slug);
  const priority: BadgeType[] = ["exotic", "weather", "budget", "flight_short", "score"];
  for (const type of priority) {
    if (myBadges.some((b) => b.type === type)) {
      if (type === "exotic")      return "tu cherches un véritable dépaysement et l'aventure lointaine";
      if (type === "weather")     return "la météo est un critère décisif dans ton choix";
      if (type === "budget")      return "tu veux optimiser ton budget sans sacrifier l'expérience";
      if (type === "flight_short") return "tu préfères minimiser le temps de trajet depuis Paris";
      if (type === "score")       return "tu veux la destination la mieux notée par notre moteur";
    }
  }
  return ENV_REASON[dest.environment] ?? `le profil global de ${dest.name} correspond à tes attentes`;
}

// ─── Component ────────────────────────────────────────────────────

export default function ComparatorTable({ destinations, onNavigate }: ComparatorTableProps) {
  const dests = destinations;
  const badges = computeBadges(dests);
  const n = dests.length <= 3 ? dests.length : 3;
  const gridClass = `compare-grid--${n}`;

  function isBest(criterion: CriterionRow, dest: Destination): boolean {
    const val = criterion.extract(dest);
    if (typeof val !== "number") return false;
    const values = dests.map((d) => criterion.extract(d) as number);
    if (criterion.lowerIsBetter) return val === Math.min(...values);
    return val === Math.max(...values);
  }

  const destBadges = (slug: string) => badges.filter((b) => b.slug === slug);

  return (
    <div className="compare-page">
      <h2 className="section-title">
        {dests.map((d) => d.name).join(" vs ")}
      </h2>
      <p className="compare-subtitle">
        Comparaison sur {CRITERIA.length + 2} critères · {dests.length} destinations
      </p>

      {/* ── Synthesis block ─────────────────────────────────────── */}
      <div className="compare-synthesis">
        <p className="compare-synthesis-title">Lequel choisir ?</p>
        <ul className="compare-synthesis-list">
          {dests.map((d) => (
            <li key={d.slug} className="compare-synthesis-item">
              <span className="compare-synthesis-dest">{d.name}</span>
              {" si "}
              <span className="compare-synthesis-reason">
                {synthesisReason(d, badges)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Scrollable header + table ────────────────────────────── */}
      <div className="compare-scroll">
        {/* Destination headers */}
        <div className={`compare-header ${gridClass}`}>
          <div />
          {dests.map((d) => (
            <div key={d.slug} className="compare-dest-header">
              <img src={d.image} alt={d.name} className="compare-dest-img" />
              <div className="compare-dest-name">{d.name}</div>
              <div className="compare-dest-country">{d.country}</div>
              <div className="compare-dest-score" style={{ color: scoreColor(d.score) }}>
                {d.score} %
              </div>
              {destBadges(d.slug).length > 0 && (
                <div className="compare-badges">
                  {destBadges(d.slug).map((b) => (
                    <span key={b.type} className="compare-badge">
                      {b.icon} {b.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison rows */}
        <div className="compare-table">
          {CRITERIA.map((criterion) => (
            <div key={criterion.label} className={`compare-row ${gridClass}`}>
              <div className="compare-row-label">{criterion.label}</div>
              {dests.map((d) => {
                const val = criterion.extract(d);
                const display = criterion.formatDisplay
                  ? criterion.formatDisplay(d)
                  : criterion.format
                    ? criterion.format(val)
                    : String(val);
                const best = isBest(criterion, d);
                return (
                  <div key={d.slug} className={`compare-row-value${best ? " best" : ""}`}>
                    {display}
                  </div>
                );
              })}
            </div>
          ))}

          <div className={`compare-row ${gridClass}`}>
            <div className="compare-row-label">Meilleure période</div>
            {dests.map((d) => (
              <div key={d.slug} className="compare-row-value">{d.season.best}</div>
            ))}
          </div>

          <div className={`compare-row ${gridClass}`}>
            <div className="compare-row-label">Ambiance</div>
            {dests.map((d) => (
              <div key={d.slug} className="compare-row-value">
                {d.ambiance.slice(0, 2).join(", ")}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className="compare-actions">
        <div className="compare-actions-row">
          {dests.map((d) => (
            <button
              key={d.slug}
              className="btn-primary btn-sm"
              onClick={() => onNavigate("destination", d.slug)}
            >
              Fiche {d.name} →
            </button>
          ))}
        </div>
        <div className="compare-actions-row">
          {dests.map((d) => (
            <button
              key={d.slug}
              className="btn-outline btn-sm"
              onClick={() => onNavigate("itinerary", d.slug)}
            >
              Itinéraire {d.name} →
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
