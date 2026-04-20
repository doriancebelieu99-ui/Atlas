import { scoreColor } from "@/data/ui-constants";
import type { DestinationScoreResult, ViewName } from "@/lib/types";

interface ResultCardProps {
  result: DestinationScoreResult;
  rank: number;
  featured?: boolean;
  onNavigate: (view: ViewName, slug: string) => void;
  onCompareToggle?: (slug: string) => void;
  isCompareSelected?: boolean;
}

function buildWhyText(result: DestinationScoreResult): string {
  const parts: string[] = [];

  if (result.highlights?.[0]) {
    const h = result.highlights[0];
    const lower = h.toLowerCase();

    if (lower.includes("durée idéale") || lower.includes("durée")) {
      const match = h.match(/(\d+\s*à\s*\d+|\d+\s*-\s*\d+)\s*jours/i);
      parts.push(match ? `Idéal ${match[0].replace(" à ", "–")}` : "Durée adaptée");
    } else if (lower.includes("bonne période") || lower.includes("saisonnier")) {
      parts.push("Bonne période");
    } else if (lower.includes("budget")) {
      parts.push("Budget adapté");
    } else {
      parts.push(h.length > 32 ? `${h.slice(0, 32)}…` : h);
    }
  }

  if (result.ambiance?.[0]) {
    parts.push(`Ambiance ${result.ambiance[0].toLowerCase()}`);
  }

  return parts.slice(0, 2).join(" · ");
}

export default function ResultCard({
  result,
  rank,
  featured = false,
  onNavigate,
  onCompareToggle,
  isCompareSelected,
}: ResultCardProps) {
  const whyText = buildWhyText(result);

  return (
    <div
      className={`result-card${featured ? " result-card--featured" : ""}`}
      style={{ animationDelay: `${rank * 0.08}s` }}
    >
      <div className="result-card-img-wrap">
        <img
          src={result.image}
          alt={result.name}
          className="result-card-img"
          loading="lazy"
        />
        {/* Badge score — masqué sur la featured (score affiché dans le body) */}
        {!featured && (
          <div
            className="result-card-score"
            style={{ color: scoreColor(result.totalScore) }}
            aria-label={`${result.totalScore}% de compatibilité`}
            title={`${result.totalScore}% de compatibilité`}
          >
            {result.totalScore}%
          </div>
        )}
      </div>

      <div className="result-card-body">
        {featured && (
          <div className="result-card-featured-label">Recommandation principale</div>
        )}

        <div className="result-card-country">{result.country}</div>
        <div className="result-card-name">{result.name}</div>

        {/* Score inline — uniquement sur la featured */}
        {featured && (
          <div className="result-card-featured-score">
            <span
              className="result-card-featured-score-value"
              style={{ color: scoreColor(result.totalScore) }}
            >
              {result.totalScore}%
            </span>
            <span className="result-card-featured-score-label">de compatibilité avec votre profil</span>
          </div>
        )}

        {featured && result.highlights && result.highlights.length > 0 ? (
          <ul className="result-card-highlights-list">
            {result.highlights.slice(0, 3).map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        ) : (
          <div className={`result-card-why${featured ? " result-card-why--featured" : ""}`}>
            {whyText}
          </div>
        )}

        <div className="result-card-tags">
          {result.ambiance.slice(0, 3).map((tag) => (
            <span key={tag} className="result-card-tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="result-card-budget">
          Budget : {result.budgetEstimate.min}–{result.budgetEstimate.max}€
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
            Voir la fiche →
          </button>

          {result.hasItinerary ? (
            <button
              className="btn-outline"
              onClick={() => onNavigate("itinerary", result.slug)}
            >
              Voir l'itinéraire →
            </button>
          ) : (
            <span className="result-card-itinerary-soon">Itinéraire bientôt disponible</span>
          )}

          {onCompareToggle && (
            <button
              className={`btn-compare ${isCompareSelected ? "active" : ""}`}
              onClick={() => onCompareToggle(result.slug)}
              aria-label={isCompareSelected
                ? `Retirer ${result.name} de la comparaison`
                : `Ajouter ${result.name} à la comparaison`}
              aria-pressed={isCompareSelected}
            >
              <span aria-hidden="true">{isCompareSelected ? "✓" : "+"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
