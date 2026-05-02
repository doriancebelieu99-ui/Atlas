// ─── Atlas — Results List ─────────────────────────────────────────
// Receives server-computed results. No scoring logic here.

import { useState } from "react";
import ResultCard from "./ResultCard";
import { answerLabels } from "@/data/quiz-questions";
import type { QuizAnswers, DestinationScoreResult, ViewName } from "@/lib/types";
import { getResultSignal } from "@/lib/result-signal";

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
    .filter(([key, v]) => {
      if (v === undefined) return false;
      if (key === "duration" && answers.durationExact) return false;
      return true;
    })
    .map(([key, val]) => {
      if (Array.isArray(val)) return val.map((v) => answerLabels[key]?.[v] ?? v).join(", ");
      return answerLabels[key]?.[val as string] ?? val;
    })
    .filter(Boolean);

  const signal = getResultSignal(answers);
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
          <span>Comparer {compareSet.size} destination{compareSet.size > 1 ? "s" : ""}</span>
          <button
            className="btn-primary btn-sm"
            onClick={() => onNavigate("compare", Array.from(compareSet).join(","))}
          >
            Lancer la comparaison →
          </button>
        </div>
      )}

      {/* Results heading */}
      <div className="results-heading">
        <h2 className="section-title">
          {results.length} destination{results.length > 1 ? "s" : ""} correspondent à votre profil
        </h2>
        <details className="score-explainer">
          <summary className="score-explainer-trigger">
            Comment ce score est calculé ?
          </summary>
          <div className="score-explainer-body">
            <p>
              Chaque score reflète la compatibilité entre votre profil et la destination,
              calculée sur <strong>10 critères</strong> : budget, saison, style de voyage,
              durée, logistique, centres d'intérêt, rythme, groupe, cadre naturel et temps de vol.
            </p>
            <p>
              Un score élevé ne signifie pas que la destination est "meilleure" —
              il signifie qu'elle correspond mieux à vos réponses. Deux profils différents
              produisent deux classements différents.
            </p>
          </div>
        </details>
      </div>

      {/* Contextual signal — at most one, priority defined in getResultSignal() */}
      {signal && (
        <div className="results-flight-signal">
          <span className="results-flight-signal-icon">{signal.icon}</span>
          <div>
            <div className="results-flight-signal-label">{signal.label}</div>
            <p className="results-flight-signal-text">{signal.text}</p>
          </div>
        </div>
      )}

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
          answers={answers}
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
                answers={answers}
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
