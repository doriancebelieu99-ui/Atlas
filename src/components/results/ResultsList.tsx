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
          Modifier
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
        <div className="section-label">Résultats</div>
        <h2 className="section-title">
          {results.length} destination{results.length > 1 ? "s" : ""} pour vous
        </h2>
      </div>

      {/* Cards */}
      <div className="results-grid">
        {results.map((r, i) => (
          <ResultCard
            key={r.slug}
            result={r}
            rank={i}
            onNavigate={onNavigate}
            onCompareToggle={toggleCompare}
            isCompareSelected={compareSet.has(r.slug)}
          />
        ))}
      </div>

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
