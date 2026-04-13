// ─── Atlas — Result Card ──────────────────────────────────────────
import { scoreColor } from "@/data/ui-constants";
import type { DestinationScoreResult, ViewName } from "@/lib/types";

interface ResultCardProps {
  result: DestinationScoreResult;
  rank: number;
  onNavigate: (view: ViewName, slug: string) => void;
  onCompareToggle?: (slug: string) => void;
  isCompareSelected?: boolean;
}

export default function ResultCard({
  result,
  rank,
  onNavigate,
  onCompareToggle,
  isCompareSelected,
}: ResultCardProps) {
  return (
    <div className="result-card" style={{ animationDelay: `${rank * 0.08}s` }}>
      <div className="result-card-img-wrap">
        <img src={result.image} alt={result.name} className="result-card-img" loading="lazy" />
        <div className="result-card-score" style={{ color: scoreColor(result.totalScore) }}>
          {result.totalScore}%
        </div>
      </div>

      <div className="result-card-body">
        <div className="result-card-country">{result.country}</div>
        <div className="result-card-name">{result.name}</div>

        <div className="result-card-tags">
          {result.ambiance.slice(0, 3).map((tag) => (
            <span key={tag} className="result-card-tag">{tag}</span>
          ))}
        </div>

        {result.highlights.length > 0 && (
          <div className="result-card-highlight">✓ {result.highlights[0]}</div>
        )}
        {result.limitations.length > 0 && (
          <div className="result-card-limitation">⚠ {result.limitations[0]}</div>
        )}

        <div className="result-card-budget">
          💰 {result.budgetEstimate.min}–{result.budgetEstimate.max}€
          <span className="result-card-budget-variant"> ({result.budgetEstimate.variant})</span>
        </div>

        <div className="result-card-actions">
          <button className="btn-primary" onClick={() => onNavigate("destination", result.slug)}>
            Voir la fiche
          </button>
          <button className="btn-outline" onClick={() => onNavigate("itinerary", result.slug)}>
            Itinéraire
          </button>
          {onCompareToggle && (
            <button
              className={`btn-compare ${isCompareSelected ? "active" : ""}`}
              onClick={() => onCompareToggle(result.slug)}
            >
              {isCompareSelected ? "✓" : "⇔"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
