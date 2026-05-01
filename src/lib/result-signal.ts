import type { QuizAnswers } from "@/lib/types";

export type ResultSignalKey =
  | "budget_low"
  | "flight_short"
  | "departure_month"
  | "flight_long"
  | "family"
  | "duration_short";

export interface ResultSignal {
  key: ResultSignalKey;
  icon: string;
  label: string;
  text: string;
}

const MONTH_FR: Record<string, string> = {
  jan: "Janvier", feb: "Février", mar: "Mars",   apr: "Avril",
  may: "Mai",     jun: "Juin",    jul: "Juillet", aug: "Août",
  sep: "Septembre", oct: "Octobre", nov: "Novembre", dec: "Décembre",
};

// Priority: budget_low → flight_short → departure_month → flight_long → family → duration_short
// At most one signal is returned. Order reflects structural impact on ranking.
export function getResultSignal(answers: QuizAnswers): ResultSignal | null {
  if (answers.budget === "low")
    return {
      key: "budget_low",
      icon: "💶",
      label: "Budget serré",
      text: "Seules les destinations compatibles avec votre budget sont retenues — d'autres ont été écartées car leur tarif minimum dépasse votre fourchette.",
    };
  if (answers.flightTolerance === "short")
    return {
      key: "flight_short",
      icon: "⚡",
      label: "Vols courts uniquement",
      text: "Ce classement ne comprend que les destinations à moins de 3 heures de Paris. Les vols plus longs ont été exclus.",
    };
  if (answers.departurePrecision === "month" && answers.departureMonth) {
    const mLabel = MONTH_FR[answers.departureMonth as string] ?? String(answers.departureMonth);
    return {
      key: "departure_month",
      icon: "📅",
      label: `Départ en ${mLabel}`,
      text: `Ce classement privilégie les destinations les plus adaptées à un voyage en ${mLabel.toLowerCase()}.`,
    };
  }
  if (answers.flightTolerance === "long")
    return {
      key: "flight_long",
      icon: "✈",
      label: "Classement long-courrier",
      text: "Vous avez indiqué une préférence pour les trajets lointains. Les destinations les plus éloignées sont donc davantage valorisées dans ce classement.",
    };
  if (answers.group === "family")
    return {
      key: "family",
      icon: "👨‍👩‍👧‍👦",
      label: "Voyage en famille",
      text: "La facilité logistique et le rythme adapté aux familles ont plus de poids dans ce classement.",
    };
  if (answers.duration === "short")
    return {
      key: "duration_short",
      icon: "⏱",
      label: "Séjour court",
      text: "Séjour de 2 à 3 jours : les destinations pensées pour une semaine ou plus sont moins bien classées ici.",
    };
  return null;
}
