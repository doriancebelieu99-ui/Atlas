import { scoreColor } from "@/data/ui-constants";
import type { DestinationScoreResult, ViewName } from "@/lib/types";

interface ResultCardProps {
  result: DestinationScoreResult;
  rank: number;
  onNavigate: (view: ViewName, slug: string) => void;
  onCompareToggle?: (slug: string) => void;
  isCompareSelected?: boolean;
}

function shortenHighlight(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes("durée idéale")) {
    const match = text.match(/(\d+\s*à\s*\d+|\d+\s*-\s*\d+)\s*jours/i);
    if (match) {
      return `Idéal ${match[0].replace(" à ", "–").replace("-", "–")}`;
    }
    return "Durée adaptée";
  }

  if (lower.includes("bonne période") || lower.includes("saison")) {
    return "Bonne période";
  }

  if (lower.includes("budget")) {
    return "Budget adapté";
  }

  return text.length > 28 ? `${text.slice(0, 28)}…` : text;
}

function buildWhyText(result: DestinationScoreResult): string {
  const parts: string[] = [];

  if (result.highlights?.[0]) {
    parts.push(shortenHighlight(result.highlights[0]));
  }

  if (result.ambiance?.[0]) {
    parts.push(`ambiance ${result.ambiance[0].toLowerCase()}`);
  }

  if (parts.length === 0 && result.budgetEstimate?.variant) {
    parts.push(`budget ${result.budgetEstimate.variant.toLowerCase()}`);
  }

  return parts.slice(0, 2).join(" • ");
}

export default function ResultCard({
  result,
  rank,
  onNavigate,
  onCompareToggle,
  isCompareSelected,
}: ResultCardProps) {
  const whyText = buildWhyText(result);

  return (
    <div className="result-card" style={{ animationDelay: `${rank * 0.08}s` }}>
      <div className="result-card-img-wrap">
        <img
          src={result.image}
          alt={result.name}
          className="result-card-img"
          loading="lazy"
        />
        <div
          className="result-card-score"
          style={{ color: scoreColor(result.totalScore) }}
          aria-label={`${result.totalScore}% de match avec votre profil`}
          title={`${result.totalScore}% de match avec votre profil`}
        >
          {result.totalScore}%
        </div>
      </div>

      <div className="result-card-body">
        <div className="result-card-country">{result.country}</div>
        <div className="result-card-name">{result.name}</div>

        <div className="result-card-compatibility">
          {result.totalScore}% de match avec votre profil
        </div>

        <div className="result-card-why">{whyText}</div>

        <div className="result-card-tags">
          {result.ambiance.slice(0, 3).map((tag) => (
            <span key={tag} className="result-card-tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="result-card-budget">
          💰 {result.budgetEstimate.min}–{result.budgetEstimate.max}€
          <span className="result-card-budget-variant">
            {" "}
            ({result.budgetEstimate.variant})
          </span>
        </div>

        <div className="result-card-actions">
          <button
            className="btn-primary"
            onClick={() => onNavigate("destination", result.slug)}
          >
            Voir la fiche
          </button>

          <button
            className="btn-outline"
            onClick={() => onNavigate("itinerary", result.slug)}
          >
            Itinéraire
          </button>

          {onCompareToggle && (
            <button
              className={`btn-compare ${isCompareSelected ? "active" : ""}`}
              onClick={() => onCompareToggle(result.slug)}
              aria-label={isCompareSelected
                ? `Retirer ${result.name} de la comparaison`
                : `Comparer ${result.name}`}
              aria-pressed={isCompareSelected}
            >
              <span aria-hidden="true">{isCompareSelected ? "✓" : "⇔"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}