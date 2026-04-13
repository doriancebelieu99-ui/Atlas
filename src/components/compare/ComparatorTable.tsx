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
  format?: (v: string | number) => string;
  lowerIsBetter?: boolean;
}

const CRITERIA: CriterionRow[] = [
  {
    label: "Budget / jour (confort)",
    extract: (d) => (d.budget.comfort.min + d.budget.comfort.max) / 2,
    format: (v) => `${Math.round(v as number)}€`,
    lowerIsBetter: true,
  },
  {
    label: "Coût de la vie",
    extract: (d) => d.budget.costIndex,
    format: (v) => `${v}/200`,
    lowerIsBetter: true,
  },
  {
    label: "Logistique",
    extract: (d) => d.safety.logisticsScore,
    format: (v) => `${v}/100`,
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

export default function ComparatorTable({ destinations, onNavigate }: ComparatorTableProps) {
  const dests = destinations;

  function isBest(criterion: CriterionRow, dest: Destination): boolean {
    const val = criterion.extract(dest);
    if (typeof val !== "number") return false;
    const values = dests.map((d) => criterion.extract(d) as number);
    if (criterion.lowerIsBetter) return val === Math.min(...values);
    return val === Math.max(...values);
  }

  return (
    <div className="compare-page">
      <div className="section-label">Comparateur</div>
      <h2 className="section-title">
        {dests.map((d) => d.name).join(" vs ")}
      </h2>

      <div className="compare-header" style={{ gridTemplateColumns: `160px repeat(${dests.length}, 1fr)` }}>
        <div />
        {dests.map((d) => (
          <div key={d.slug} className="compare-dest-header">
            <img src={d.image} alt={d.name} className="compare-dest-img" />
            <div className="compare-dest-name">{d.name}</div>
            <div className="compare-dest-country">{d.country}</div>
            <div className="compare-dest-score" style={{ color: scoreColor(d.score) }}>
              {d.score}%
            </div>
          </div>
        ))}
      </div>

      <div className="compare-table">
        {CRITERIA.map((criterion) => (
          <div
            key={criterion.label}
            className="compare-row"
            style={{ gridTemplateColumns: `160px repeat(${dests.length}, 1fr)` }}
          >
            <div className="compare-row-label">{criterion.label}</div>
            {dests.map((d) => {
              const val = criterion.extract(d);
              const display = criterion.format ? criterion.format(val) : String(val);
              const best = isBest(criterion, d);
              return (
                <div key={d.slug} className={`compare-row-value ${best ? "best" : ""}`}>
                  {display}
                </div>
              );
            })}
          </div>
        ))}

        <div className="compare-row" style={{ gridTemplateColumns: `160px repeat(${dests.length}, 1fr)` }}>
          <div className="compare-row-label">Meilleure période</div>
          {dests.map((d) => (
            <div key={d.slug} className="compare-row-value">{d.season.best}</div>
          ))}
        </div>

        <div className="compare-row" style={{ gridTemplateColumns: `160px repeat(${dests.length}, 1fr)` }}>
          <div className="compare-row-label">Ambiance</div>
          {dests.map((d) => (
            <div key={d.slug} className="compare-row-value">
              {d.ambiance.slice(0, 3).join(", ")}
            </div>
          ))}
        </div>
      </div>

      <div className="compare-actions">
        {dests.map((d) => (
          <div key={d.slug} className="compare-action-group">
            <button className="btn-primary" onClick={() => onNavigate("destination", d.slug)}>
              Fiche {d.name}
            </button>
            <button className="btn-outline" onClick={() => onNavigate("itinerary", d.slug)}>
              Itinéraire
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
