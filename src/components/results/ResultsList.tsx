// ─── Atlas — Results List ─────────────────────────────────────────
// Receives server-computed results. No scoring logic here.

import { useState } from "react";
import ResultCard from "./ResultCard";
import { answerLabels } from "@/data/quiz-questions";
import type { QuizAnswers, DestinationScoreResult, ViewName } from "@/lib/types";

interface ResultsListProps {
  results: DestinationScoreResult[];
  answers: QuizAnswers;
  onNavigate: (view: ViewName, slug?: string) => void;
}

export default function ResultsList({ results, answers, onNavigate }: ResultsListProps) {
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());

  const toggleCompare = (slug: string) => {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else if (next.size < 3) next.add(slug);
      return next;
    });
  };

  const summaryParts = Object.entries(answers)
    .filter(([, v]) => v !== undefined)
    .map(([key, val]) => {
      if (Array.isArray(val)) return val.map((v) => answerLabels[key]?.[v] ?? v).join(", ");
      return answerLabels[key]?.[val as string] ?? val;
    })
    .filter(Boolean);

  const [featured, ...alternatives] = results;

  return (
    <div className="section">
      {/* Profile summary bar */}
      <div className="results-summary">
        <div className="results-summary-label">Votre profil</div>
        <div className="results-summary-tags">
          {summaryParts.map((part, i) => (
            <span key={i} className="results-summary-tag">
              {part}
            </span>
          ))}
        </div>
        <button className="btn-outline btn-sm" onClick={() => onNavigate("quiz")}>
          Refaire le quiz
        </button>
      </div>

      {/* Compare bar */}
      {compareSet.size >= 2 && (
        <div className="compare-bar">
          <span>{compareSet.size} destinations sélectionnées</span>
          <button
            className="btn-primary btn-sm"
            onClick={() => onNavigate("compare", Array.from(compareSet).join(","))}
          >
            Comparer →
          </button>
        </div>
      )}

      {/* Results heading */}
      <div className="results-heading">
        <h2 className="section-title">
          {results.length} destination{results.length > 1 ? "s" : ""} correspondent à votre profil
        </h2>
        <p className="results-score-note">
          Chaque score mesure l'adéquation entre votre profil et la destination, calculé sur 10 critères : budget, saison, style, durée, logistique, centres d'intérêt, rythme, groupe, cadre et temps de vol.
        </p>
      </div>

      {/* Featured card — recommandation principale */}
      {featured && (
        <ResultCard
          key={featured.slug}
          result={featured}
          rank={0}
          featured
          onNavigate={onNavigate}
          onCompareToggle={toggleCompare}
          isCompareSelected={compareSet.has(featured.slug)}
        />
      )}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <>
          <div className="results-alternatives-label">Autres destinations</div>
          <div className="results-grid">
            {alternatives.map((r, i) => (
              <ResultCard
                key={r.slug}
                result={r}
                rank={i + 1}
                onNavigate={onNavigate}
                onCompareToggle={toggleCompare}
                isCompareSelected={compareSet.has(r.slug)}
              />
            ))}
          </div>
        </>
      )}

      {results.length === 0 && (
        <div className="results-empty">
          <p>Aucune destination ne correspond à ces critères.</p>
          <button className="btn-primary" onClick={() => onNavigate("quiz")}>
            Ajuster mes préférences
          </button>
        </div>
      )}
    </div>
  );
}
