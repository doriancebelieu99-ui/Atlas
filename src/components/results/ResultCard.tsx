// ─── Atlas — Result Card ──────────────────────────────────────────
// Receives pre-computed results and quiz answers. No scoring logic here.

import { scoreColor } from "@/data/ui-constants";
import type { CriteriaScores, DestinationScoreResult, QuizAnswers, ViewName } from "@/lib/types";

interface ResultCardProps {
  result: DestinationScoreResult;
  rank: number;
  featured?: boolean;
  onNavigate: (view: ViewName, slug: string) => void;
  onCompareToggle?: (slug: string) => void;
  isCompareSelected?: boolean;
  answers?: QuizAnswers;
}

// ─── Label maps ───────────────────────────────────────────────────

const PERIOD_FR: Record<string, string> = {
  spring: "au printemps",
  summer: "en été",
  autumn: "en automne",
  winter: "en hiver",
};

const DURATION_DAYS: Record<string, number> = {
  short: 3,
  week: 5,
  long: 10,
  extended: 18,
};

const GROUP_FR: Record<string, string> = {
  solo: "en solo",
  couple: "en couple",
  family: "en famille",
  friends: "entre amis",
};

const PACE_FR: Record<string, string> = {
  relaxed: "relax",
  balanced: "équilibré",
  dense: "dense",
  very_active: "très actif",
};

const CRITERION_LABEL: Record<string, string> = {
  budget: "budget",
  season: "saisonnalité",
  style: "style de voyage",
  duration: "durée de séjour",
  logistics: "facilité logistique",
  interests: "centres d'intérêt",
  pace: "rythme",
  group: "configuration de voyage",
  environment: "cadre naturel",
  flightTime: "temps de vol",
};

// ─── Reason builder ───────────────────────────────────────────────

function buildReason(
  key: keyof CriteriaScores,
  score: number,
  result: DestinationScoreResult,
  answers: QuizAnswers | undefined,
): string {
  const budget = answers?.budget as string | undefined;
  const period = answers?.period as string | undefined;
  const duration = answers?.duration as string | undefined;
  const group = answers?.group as string | undefined;
  const pace = answers?.pace as string | undefined;
  const environment = answers?.environment as string | undefined;
  const interests = Array.isArray(answers?.interests) ? (answers.interests as string[]) : [];
  const styles = Array.isArray(answers?.styles) ? (answers.styles as string[]) : [];

  switch (key) {
    case "budget": {
      const days = DURATION_DAYS[duration ?? "week"] ?? 5;
      const { min, max } = result.budgetEstimate;
      if (budget === "low")
        return `Budget accessible : comptez ${min}–${max} € pour ${days} jours, dans votre fourchette serrée.`;
      if (budget === "medium")
        return `Bon rapport qualité/prix : environ ${min}–${max} € pour ${days} jours.`;
      if (budget === "premium")
        return `Le niveau de confort premium est bien soutenu, avec ${min}–${max} € pour ${days} jours.`;
      return `Budget ajusté : environ ${min}–${max} € pour ${days} jours.`;
    }
    case "season": {
      if (period) return `La période ${PERIOD_FR[period] ?? period} est l'une des meilleures pour visiter.`;
      return `Bonne météo sur la majorité de l'année.`;
    }
    case "style": {
      if (styles.length > 0) {
        const label = styles.slice(0, 2).join(" et ");
        return `L'ambiance correspond à votre style : ${label}.`;
      }
      return `Le profil de la destination correspond bien à vos envies.`;
    }
    case "duration": {
      const days = DURATION_DAYS[duration ?? "week"] ?? 5;
      return `La durée idéale sur place correspond à votre séjour de ${days} jours.`;
    }
    case "logistics": {
      if (score >= 85)
        return `Organisation simplissime : destination très facile d'accès et sans formalités lourdes.`;
      return `Destination facile à organiser, bien balisée pour les voyageurs francophones.`;
    }
    case "interests": {
      if (interests.length > 0) {
        const label = interests.slice(0, 2).join(" et ");
        return `Riche en activités pour vos centres d'intérêt : ${label}.`;
      }
      return `Forte densité d'expériences variées.`;
    }
    case "pace": {
      if (pace) return `Le rythme ${PACE_FR[pace] ?? pace} de la destination correspond exactement au vôtre.`;
      return `Le rythme naturel de la destination est bien adapté.`;
    }
    case "group": {
      if (group)
        return `Destination appréciée des voyageurs ${GROUP_FR[group] ?? group} — expérience bien calibrée.`;
      return `Bien adaptée à votre configuration de voyage.`;
    }
    case "environment": {
      if (environment && environment !== "any")
        return `Le cadre ${environment} que vous recherchez, sans compromis.`;
      return `Cadre naturel varié et bien équilibré.`;
    }
    case "flightTime": {
      const flightTolerance = answers?.flightTolerance as string | undefined;
      if (flightTolerance === "short") return `Vol court depuis Paris, dans votre préférence de trajet.`;
      if (flightTolerance === "medium") return `Temps de vol raisonnable, dans votre tolérance de trajet.`;
      return `Facilement accessible depuis Paris.`;
    }
    default:
      return CRITERION_LABEL[key] ?? key;
  }
}

function buildWatchout(
  result: DestinationScoreResult,
  answers: QuizAnswers | undefined,
): string | null {
  const sorted = (Object.entries(result.criteriaScores) as [keyof CriteriaScores, number][]).sort(
    ([, a], [, b]) => a - b,
  );

  const worst = sorted.find(([, s]) => s < 55);
  if (!worst) return null;

  const [key] = worst;
  const period = answers?.period as string | undefined;
  const duration = answers?.duration as string | undefined;
  const group = answers?.group as string | undefined;
  const pace = answers?.pace as string | undefined;
  const environment = answers?.environment as string | undefined;

  switch (key) {
    case "budget": {
      const { min, max } = result.budgetEstimate;
      return `Budget potentiellement serré : ${min}–${max} € pour ce séjour, vérifiez que cela reste dans votre enveloppe.`;
    }
    case "season": {
      if (period)
        return `La période ${PERIOD_FR[period] ?? period} n'est pas optimale — consultez le calendrier saisonnier avant de réserver.`;
      return `La saisonnalité peut jouer contre vous — vérifiez les mois disponibles.`;
    }
    case "duration": {
      const days = DURATION_DAYS[duration ?? "week"] ?? 5;
      return `Votre séjour de ${days} jours ne correspond pas à la durée idéale — vous risquez de manquer des incontournables.`;
    }
    case "logistics":
      return `La logistique sur place est plus complexe — anticipez davantage l'organisation.`;
    case "flightTime":
      return `Le vol est long depuis Paris — anticipez la fatigue de trajet dans votre planning.`;
    case "environment": {
      if (environment && environment !== "any")
        return `Le cadre ne correspond pas entièrement à votre préférence ${environment}, mais la destination reste riche.`;
      return `Le cadre naturel peut s'éloigner de ce que vous recherchez.`;
    }
    case "pace": {
      if (pace === "relaxed")
        return `La destination peut s'avérer un peu chargée pour un rythme relax — prévoyez des temps libres.`;
      if (pace === "very_active")
        return `Le rythme naturel de la destination est plus posé que votre profil très actif.`;
      return `Le rythme de la destination diffère légèrement du vôtre.`;
    }
    case "style":
      return `L'ambiance de la destination ne correspond pas parfaitement à votre style de voyage.`;
    case "group": {
      if (group) return `La destination est moins calibrée pour les voyageurs ${GROUP_FR[group] ?? group}.`;
      return `Moins adaptée à votre configuration de voyage.`;
    }
    case "interests":
      return `Moins de lieux correspondant directement à vos centres d'intérêt principaux.`;
    default:
      return result.limitations?.[0] ?? null;
  }
}

function buildReasons(
  result: DestinationScoreResult,
  answers: QuizAnswers | undefined,
): { reasons: string[]; watchout: string | null } {
  const sorted = (Object.entries(result.criteriaScores) as [keyof CriteriaScores, number][]).sort(
    ([, a], [, b]) => b - a,
  );

  const reasons = sorted
    .filter(([, s]) => s >= 65)
    .slice(0, 3)
    .map(([k, s]) => buildReason(k, s, result, answers));

  return { reasons, watchout: buildWatchout(result, answers) };
}

function buildWhy1(result: DestinationScoreResult): string {
  const sorted = (Object.entries(result.criteriaScores) as [keyof CriteriaScores, number][]).sort(
    ([, a], [, b]) => b - a,
  );

  const top = sorted.filter(([, s]) => s >= 80).slice(0, 2);

  if (top.length >= 2) {
    const k1 = CRITERION_LABEL[top[0][0]] ?? top[0][0];
    const k2 = CRITERION_LABEL[top[1][0]] ?? top[1][0];
    return `Elle se distingue sur vos deux critères clés : ${k1} et ${k2}.`;
  }
  if (top.length === 1) {
    const k1 = CRITERION_LABEL[top[0][0]] ?? top[0][0];
    return `Elle excelle notamment sur votre critère prioritaire : ${k1}.`;
  }
  return `Elle offre le meilleur équilibre global sur l'ensemble de vos critères.`;
}

// ─── Component ────────────────────────────────────────────────────

export default function ResultCard({
  result,
  rank,
  featured = false,
  onNavigate,
  onCompareToggle,
  isCompareSelected,
  answers,
}: ResultCardProps) {
  const { reasons, watchout } = buildReasons(result, answers);

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

        {featured ? (
          <div className="result-card-decisional">
            <div className="result-card-section-label">Pourquoi elle ressort en #1</div>
            <p className="result-card-why1">{buildWhy1(result)}</p>

            {reasons.length > 0 && (
              <>
                <div className="result-card-section-label">Ce que tu y gagnes</div>
                <ul className="result-card-gains-list">
                  {reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            )}

            {watchout && (
              <div className="result-card-watchout-block">
                <div className="result-card-section-label result-card-section-label--warn">
                  Le compromis à accepter
                </div>
                <p className="result-card-watchout">{watchout}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="result-card-reasons">
            {reasons.map((r, i) => (
              <div key={i} className="result-card-reason">
                {r}
              </div>
            ))}
            {watchout && (
              <div className="result-card-reason result-card-reason--watchout">{watchout}</div>
            )}
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
              aria-label={
                isCompareSelected
                  ? `Retirer ${result.name} de la comparaison`
                  : `Ajouter ${result.name} à la comparaison`
              }
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
