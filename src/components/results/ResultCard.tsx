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

const PERIOD_ADJ: Record<string, string> = {
  spring: "printanière",
  summer: "estivale",
  autumn: "automnale",
  winter: "hivernale",
};

const MONTH_FR: Record<string, string> = {
  jan: "Janvier", feb: "Février", mar: "Mars",   apr: "Avril",
  may: "Mai",     jun: "Juin",    jul: "Juillet", aug: "Août",
  sep: "Septembre", oct: "Octobre", nov: "Novembre", dec: "Décembre",
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

const STYLE_LABELS: Record<string, string> = {
  authentic_local: "Authentique & local",
  culture_patrimoine: "Culture & patrimoine",
  food_artdevivre: "Food & art de vivre",
  energie_urbaine: "Énergie urbaine",
  calme_contemplation: "Calme & contemplation",
  nature_grand_air: "Nature & grand air",
};

const INTEREST_LABELS: Record<string, string> = {
  architecture: "Architecture",
  food: "Gastronomie",
  history: "Histoire",
  nightlife: "Vie nocturne",
  nature: "Paysages",
  art: "Art & musées",
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
  const departurePrecision = answers?.departurePrecision as string | undefined;
  const departureMonth = answers?.departureMonth as string | undefined;
  const duration = answers?.duration as string | undefined;
  const group = answers?.group as string | undefined;
  const pace = answers?.pace as string | undefined;
  const environment = answers?.environment as string | undefined;
  const rawInterests = Array.isArray(answers?.interests) ? (answers.interests as string[]) : [];
  const rawStyles = Array.isArray(answers?.styles) ? (answers.styles as string[]) : [];

  const interests = rawInterests.slice(0, 2).map((v) => INTEREST_LABELS[v] ?? v);
  const styles = rawStyles.slice(0, 2).map((v) => STYLE_LABELS[v] ?? v);

  switch (key) {
    case "budget": {
      const days = DURATION_DAYS[duration ?? "week"] ?? 5;
      const { min, max } = result.budgetEstimate;
      if (budget === "low")
        return `Budget accessible : comptez ${min}–${max} € pour ${days} jours, dans votre fourchette serrée.`;
      if (budget === "medium")
        return `Bon rapport qualité/prix : environ ${min}–${max} € pour ${days} jours.`;
      if (budget === "high")
        return `Excellent niveau de prestation dans votre fourchette confort : ${min}–${max} € pour ${days} jours.`;
      if (budget === "premium")
        return `Le niveau de confort premium est bien soutenu : ${min}–${max} € pour ${days} jours.`;
      return `Budget ajusté : environ ${min}–${max} € pour ${days} jours.`;
    }
    case "season":
      if (departurePrecision === "month" && departureMonth)
        return `${MONTH_FR[departureMonth] ?? departureMonth} est l'une des meilleures périodes pour visiter.`;
      return period
        ? `La saison ${PERIOD_ADJ[period] ?? period} est l'une des meilleures pour visiter.`
        : `Bonne météo sur la majorité de l'année.`;
    case "style":
      return styles.length > 0
        ? `L'ambiance correspond à votre style : ${styles.join(" et ")}.`
        : `Le profil de la destination correspond bien à vos envies.`;
    case "duration": {
      const days = DURATION_DAYS[duration ?? "week"] ?? 5;
      return `Format idéal pour un séjour de ${days} jours : rien ne sera précipité, rien ne manquera.`;
    }
    case "logistics":
      return score >= 85
        ? `Organisation simplissime : aucune formalité lourde, facile à prendre en main depuis Paris.`
        : `Destination facile à organiser, bien balisée pour les voyageurs francophones.`;
    case "interests":
      return interests.length > 0
        ? `Riche en expériences pour vos centres d'intérêt : ${interests.join(" et ")}.`
        : `Forte densité d'activités variées.`;
    case "pace":
      return pace
        ? `Le rythme naturel de la destination est ${PACE_FR[pace] ?? pace} — exactement ce que vous cherchez.`
        : `Le rythme naturel de la destination est bien adapté.`;
    case "group":
      return group
        ? `Destination particulièrement appréciée des voyageurs ${GROUP_FR[group] ?? group}.`
        : `Bien adaptée à votre configuration de voyage.`;
    case "environment":
      return environment && environment !== "any"
        ? `Le cadre ${environment} que vous recherchez, sans compromis.`
        : `Cadre naturel varié et bien équilibré.`;
    case "flightTime": {
      const ft = answers?.flightTolerance as string | undefined;
      if (ft === "short") return `Vol court depuis Paris — dans votre préférence de trajet.`;
      if (ft === "medium") return `Temps de vol raisonnable, dans votre tolérance de trajet.`;
      if (ft === "long") return `Long-courrier depuis Paris — exactement le dépaysement que vous cherchez.`;
      return `Facilement accessible depuis Paris.`;
    }
    default:
      return CRITERION_LABEL[key] ?? key;
  }
}

// ─── Watchout builder ─────────────────────────────────────────────

function buildWatchout(
  result: DestinationScoreResult,
  answers: QuizAnswers | undefined,
): string | null {
  const cs = result.criteriaScores;
  const period = answers?.period as string | undefined;
  const departurePrecision = answers?.departurePrecision as string | undefined;
  const departureMonth = answers?.departureMonth as string | undefined;
  const duration = answers?.duration as string | undefined;
  const group = answers?.group as string | undefined;
  const pace = answers?.pace as string | undefined;
  const environment = answers?.environment as string | undefined;
  const budget = answers?.budget as string | undefined;
  const flightTol = answers?.flightTolerance as string | undefined;

  const temporalLabel =
    departurePrecision === "month" && departureMonth
      ? (MONTH_FR[departureMonth] ?? departureMonth)
      : period ? `la saison ${PERIOD_ADJ[period] ?? period}` : null;

  // Criterion-specific thresholds for high-signal cases
  if (budget === "low" && cs.budget < 70) {
    const { min, max } = result.budgetEstimate;
    return `Budget potentiellement serré : ${min}–${max} € pour ce séjour — vérifiez que cela reste dans votre enveloppe.`;
  }
  if (temporalLabel && cs.season < 65) {
    return `${temporalLabel} n'est pas la période idéale ici — consultez le calendrier saisonnier avant de réserver.`;
  }
  if (flightTol === "long" && cs.flightTime < 55) {
    return `Destination plus proche que ce que vous cherchez — pensez à l'associer à une autre étape.`;
  }
  if (flightTol && flightTol !== "any" && flightTol !== "long" && cs.flightTime < 55) {
    return `Le vol est plus long que votre préférence — anticipez la fatigue de trajet dans votre planning.`;
  }
  if (environment && environment !== "any" && cs.environment < 65) {
    return `Le cadre ne correspond pas entièrement à votre préférence de type ${environment} — mais la destination reste très riche.`;
  }

  // General worst-criterion check
  const sorted = (Object.entries(cs) as [keyof CriteriaScores, number][]).sort(
    ([, a], [, b]) => a - b,
  );
  const worst = sorted.find(([, s]) => s < 55);
  if (!worst) return null;

  const [key] = worst;

  switch (key) {
    case "budget": {
      const { min, max } = result.budgetEstimate;
      return `Budget à surveiller : ${min}–${max} € pour ce séjour — vérifiez votre enveloppe.`;
    }
    case "season":
      return temporalLabel
        ? `${temporalLabel} n'est pas la période optimale — consultez le calendrier saisonnier.`
        : `La saisonnalité peut jouer contre vous — vérifiez les mois disponibles.`;
    case "duration": {
      const days = DURATION_DAYS[duration ?? "week"] ?? 5;
      if (days <= 5)
        return `${days} jours, c'est un peu court pour profiter pleinement — prévoyez idéalement plus de temps.`;
      return `${days} jours, c'est plus qu'il n'en faut ici — pensez à compléter avec une étape voisine.`;
    }
    case "logistics":
      return `La logistique sur place est plus complexe — anticipez davantage l'organisation.`;
    case "flightTime":
      return `Le vol est long depuis Paris — anticipez la fatigue de trajet dans votre planning.`;
    case "environment":
      return environment && environment !== "any"
        ? `Le cadre ne correspond pas entièrement à votre préférence ${environment}, mais la destination reste riche.`
        : `Le cadre naturel peut s'éloigner de ce que vous recherchez.`;
    case "pace":
      if (pace === "relaxed")
        return `La destination peut s'avérer chargée pour un rythme relax — prévoyez des temps libres.`;
      if (pace === "very_active")
        return `Le rythme naturel est plus posé que votre profil très actif.`;
      return `Le rythme de la destination diffère légèrement du vôtre.`;
    case "style":
      return `L'ambiance de la destination ne correspond pas parfaitement à votre style.`;
    case "group":
      return group
        ? `La destination est moins calibrée pour les voyageurs ${GROUP_FR[group] ?? group}.`
        : `Moins adaptée à votre configuration de voyage.`;
    case "interests":
      return `Moins d'activités correspondant directement à vos centres d'intérêt principaux.`;
    default:
      return result.limitations?.[0] ?? null;
  }
}

// ─── Reason list builder ──────────────────────────────────────────

function buildReasons(
  result: DestinationScoreResult,
  answers: QuizAnswers | undefined,
): { reasons: string[]; watchout: string | null } {
  const cs = result.criteriaScores;
  const rawStyles = Array.isArray(answers?.styles) ? (answers.styles as string[]) : [];
  const rawInterests = Array.isArray(answers?.interests) ? (answers.interests as string[]) : [];
  const flightTol = answers?.flightTolerance as string | undefined;
  const environment = answers?.environment as string | undefined;
  const budget = answers?.budget as string | undefined;

  // Sort by score desc; deprioritize "duration" when tied (it's a weak signal)
  const sorted = (Object.entries(cs) as [keyof CriteriaScores, number][]).sort(([ka, a], [kb, b]) => {
    if (b !== a) return b - a;
    if (ka === "duration") return 1;
    if (kb === "duration") return -1;
    return 0;
  });

  // Filter: skip criteria the user didn't express a preference for (they'll score 100 artificially)
  const filtered = sorted.filter(([k, s]) => {
    if (s < 65) return false;
    if (k === "flightTime" && (flightTol === "any" || !flightTol)) return false;
    if (k === "environment" && (environment === "any" || !environment)) return false;
    if (k === "style" && rawStyles.length === 0) return false;
    if (k === "interests" && rawInterests.length === 0) return false;
    if (k === "budget" && !budget) return false;
    return true;
  });

  const reasons = filtered
    .slice(0, 3)
    .map(([k, s]) => buildReason(k, s, result, answers));

  return { reasons, watchout: buildWatchout(result, answers) };
}

// ─── Why-#1 builder ───────────────────────────────────────────────

function buildWhy1(result: DestinationScoreResult, answers: QuizAnswers | undefined): string {
  const cs = result.criteriaScores;
  const period = answers?.period as string | undefined;
  const departurePrecision = answers?.departurePrecision as string | undefined;
  const departureMonth = answers?.departureMonth as string | undefined;
  const group = answers?.group as string | undefined;
  const environment = answers?.environment as string | undefined;
  const budget = answers?.budget as string | undefined;
  const flightTol = answers?.flightTolerance as string | undefined;
  const rawStyles = Array.isArray(answers?.styles) ? (answers.styles as string[]) : [];
  const rawInterests = Array.isArray(answers?.interests) ? (answers.interests as string[]) : [];

  // Temporal context: either a specific month or a season
  const monthLabel = departurePrecision === "month" && departureMonth
    ? (MONTH_FR[departureMonth] ?? departureMonth)
    : null;
  const temporalStr = monthLabel
    ? `en ${monthLabel.toLowerCase()}`
    : period ? PERIOD_FR[period] : null;

  // Helper — score >= 75 AND user expressed a preference for that criterion
  const has = (k: keyof CriteriaScores): boolean => {
    if (cs[k] < 75) return false;
    if (k === "flightTime" && (flightTol === "any" || !flightTol)) return false;
    if (k === "environment" && (environment === "any" || !environment)) return false;
    if (k === "style" && rawStyles.length === 0) return false;
    if (k === "interests" && rawInterests.length === 0) return false;
    if (k === "budget" && !budget) return false;
    return true;
  };

  // Narrative combinations — ordered by specificity
  if (has("season") && has("environment") && environment !== "any")
    return `Cadre ${environment} et météo ${monthLabel ? `de ${monthLabel.toLowerCase()}` : (PERIOD_ADJ[period ?? ""] ?? "favorable")} réunis : deux exigences clés satisfaites en même temps.`;

  if (group === "family" && has("group") && has("logistics"))
    return `Logistique adaptée aux familles, rythme ajustable — le choix le moins stressant du classement.`;

  if (group === "family" && has("group"))
    return `La destination la mieux notée pour un séjour en famille dans votre classement.`;

  if (group === "couple" && has("group") && has("season") && temporalStr)
    return `Idéale pour un séjour en couple ${temporalStr} : ambiance, rythme et météo jouent en sa faveur.`;

  if (has("season") && has("budget") && temporalStr)
    return `Période optimale ${temporalStr} et budget maîtrisé : deux contraintes fondamentales résolues d'un coup.`;

  if (has("flightTime") && has("season") && temporalStr)
    return `Vol accessible depuis Paris et excellente météo ${temporalStr} : le meilleur rapport effort/récompense du classement.`;

  if (has("interests") && has("environment") && environment && environment !== "any")
    return `Cadre ${environment} et richesse pour vos centres d'intérêt : elle correspond à ce que vous cherchez et à ce que vous aimez faire.`;

  if (has("interests") && has("season") && temporalStr)
    return `Meilleure période et densité d'expériences sur vos centres d'intérêt : un alignement rare dans votre classement.`;

  if (has("pace") && has("group") && group)
    return `Rythme et configuration de voyage parfaitement calibrés — moins d'adaptation, plus d'expérience immédiate.`;

  if (has("logistics") && has("budget"))
    return `Facile à organiser et parfaitement ajustée à votre budget : deux facteurs de stress éliminés.`;

  if (has("budget") && has("interests") && budget === "premium")
    return `Forte densité d'activités pour vos centres d'intérêt, à la hauteur de vos attentes premium.`;

  if (has("budget") && has("interests"))
    return `Forte densité d'activités pour vos centres d'intérêt, dans votre budget : le meilleur rendement du classement.`;

  if (has("environment") && has("logistics") && environment && environment !== "any")
    return `Cadre ${environment} accessible et bien organisé : idéal pour un séjour sans friction.`;

  if (budget === "low" && has("budget"))
    return `Meilleur rapport qualité/prix du classement — une ambiance authentique sans sacrifier votre budget.`;

  // Fallback — vary by group
  if (group === "family")
    return `Elle concentre le plus de points forts pour un séjour en famille dans votre classement.`;
  if (group === "couple")
    return `Elle offre le meilleur équilibre pour un voyage en couple sur l'ensemble de vos critères.`;
  return `Elle offre le meilleur équilibre global sur l'ensemble de vos critères.`;
}

// ─── Month season badge ───────────────────────────────────────────

export function monthSeasonBadge(
  seasonScore: number,
  monthLabel: string,
): { dot: string; label: string; level: "top" | "ok" | "off" } {
  if (seasonScore >= 80) return { dot: "●", label: `${monthLabel} · Très favorable`, level: "top" };
  if (seasonScore >= 60) return { dot: "○", label: `${monthLabel} · Correct`, level: "ok" };
  return { dot: "◐", label: `${monthLabel} · Période difficile`, level: "off" };
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

  const isMonthMode = answers?.departurePrecision === "month" && Boolean(answers?.departureMonth);
  const rawMonthLabel = isMonthMode
    ? (MONTH_FR[answers!.departureMonth as string] ?? String(answers!.departureMonth))
    : null;
  const badge = rawMonthLabel
    ? monthSeasonBadge(result.criteriaScores.season, rawMonthLabel)
    : null;

  return (
    <div
      className={`result-card${featured ? " result-card--featured" : ""}`}
      style={{ animationDelay: `${rank * 0.08}s` }}
      data-slug={result.slug}
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
            <p className="result-card-why1">{buildWhy1(result, answers)}</p>

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

        {badge && (
          <div className={`result-card-month-badge result-card-month-badge--${badge.level}`}>
            <span aria-hidden="true">{badge.dot}</span>{" "}
            {badge.label}
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
