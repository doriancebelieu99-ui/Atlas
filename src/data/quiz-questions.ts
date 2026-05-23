// ─── Atlas — Quiz Questions ───────────────────────────────────────
// Extracted from atlas-unified.jsx + atlas-home.jsx
// Follows blueprint: 6-8 questions, 90 seconds max.

import type { QuizQuestion } from "@/lib/types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: "budget",
    title: "Quel budget par personne ?",
    subtitle: "On ne juge pas, on optimise.",
    options: [
      { value: "low", label: "Serré", description: "< 50€/jour", icon: "💰" },
      { value: "medium", label: "Moyen", description: "50–120€/jour", icon: "💳" },
      { value: "high", label: "Confort", description: "120–250€/jour", icon: "✨" },
      { value: "premium", label: "Premium", description: "250€+/jour", icon: "👑" },
    ],
  },
  {
    id: "duration",
    title: "Combien de temps ?",
    subtitle: "Du week-end au long voyage.",
    options: [
      { value: "short", label: "2–3 jours", description: "Week-end", icon: "⚡" },
      { value: "week", label: "4–7 jours", description: "Semaine idéale", icon: "📅" },
      { value: "long", label: "8–14 jours", description: "Grand séjour", icon: "🗓️" },
      { value: "extended", label: "15+", description: "Aventure", icon: "🌍" },
    ],
  },
  {
    id: "durationExact",
    title: "Combien de jours exactement ?",
    subtitle: "De 1 à 14 jours. Passez si le chiffre exact ne change rien pour vous.",
    options: [
      { value: "1",  label: "1 jour",   icon: "⚡" },
      { value: "2",  label: "2 jours",  icon: "⚡" },
      { value: "3",  label: "3 jours",  icon: "📅" },
      { value: "4",  label: "4 jours",  icon: "📅" },
      { value: "5",  label: "5 jours",  icon: "📅" },
      { value: "6",  label: "6 jours",  icon: "🗓️" },
      { value: "7",  label: "7 jours",  icon: "🗓️" },
      { value: "8",  label: "8 jours",  icon: "🗓️" },
      { value: "9",  label: "9 jours",  icon: "🗓️" },
      { value: "10", label: "10 jours", icon: "🗓️" },
      { value: "11", label: "11 jours", icon: "🌍" },
      { value: "12", label: "12 jours", icon: "🌍" },
      { value: "13", label: "13 jours", icon: "🌍" },
      { value: "14", label: "14 jours", icon: "🌍" },
    ],
  },
  {
    id: "departurePrecision",
    title: "Quand partez-vous ?",
    subtitle: "Indiquez votre contrainte réelle.",
    options: [
      { value: "month",  label: "Je connais mon mois exact",      description: "Ex. : août, janvier…",              icon: "📅" },
      { value: "season", label: "Je connais seulement la période", description: "Printemps, été, automne, hiver",    icon: "🗓️" },
    ],
  },
  {
    id: "departureMonth",
    title: "Quel mois ?",
    subtitle: "Votre mois de départ.",
    visibleWhen: (a) => a.departurePrecision === "month",
    options: [
      { value: "jan", label: "Janvier",   icon: "❄️" },
      { value: "feb", label: "Février",   icon: "❄️" },
      { value: "mar", label: "Mars",      icon: "🌸" },
      { value: "apr", label: "Avril",     icon: "🌸" },
      { value: "may", label: "Mai",       icon: "🌸" },
      { value: "jun", label: "Juin",      icon: "☀️" },
      { value: "jul", label: "Juillet",   icon: "☀️" },
      { value: "aug", label: "Août",      icon: "☀️" },
      { value: "sep", label: "Septembre", icon: "🍂" },
      { value: "oct", label: "Octobre",   icon: "🍂" },
      { value: "nov", label: "Novembre",  icon: "🍂" },
      { value: "dec", label: "Décembre",  icon: "❄️" },
    ],
  },
  {
    id: "period",
    title: "Quelle période ?",
    subtitle: "La saison change tout.",
    visibleWhen: (a) => a.departurePrecision === "season",
    options: [
      { value: "spring", label: "Printemps", description: "Mars–Mai",   icon: "🌸" },
      { value: "summer", label: "Été",        description: "Juin–Août",  icon: "☀️" },
      { value: "autumn", label: "Automne",    description: "Sept–Nov",   icon: "🍂" },
      { value: "winter", label: "Hiver",      description: "Déc–Fév",    icon: "❄️" },
    ],
  },
  {
    id: "group",
    title: "Avec qui ?",
    subtitle: "Ça change tout.",
    options: [
      { value: "solo", label: "Solo", icon: "🎒" },
      { value: "couple", label: "Couple", icon: "💕" },
      { value: "friends", label: "Amis", icon: "🎉" },
      { value: "family", label: "Famille", icon: "👨‍👩‍👧‍👦" },
    ],
  },
  {
    id: "pace",
    title: "Quel rythme ?",
    subtitle: "Soyez honnête.",
    options: [
      { value: "relaxed", label: "Relax", description: "Max 2 activités/jour", icon: "🐢" },
      { value: "balanced", label: "Équilibré", description: "Mix visites et repos", icon: "⚖️" },
      { value: "dense", label: "Dense", description: "Chaque heure compte", icon: "🚀" },
    ],
  },
  {
    id: "environment",
    title: "Quel cadre vous attire ?",
    subtitle: "Ville, mer ou grand air.",
    options: [
      { value: "urban",   label: "Ville & culture",  description: "Architecture, quartiers, vie urbaine",     icon: "🏙️" },
      { value: "coastal", label: "Mer & côtes",       description: "Plages, bord de mer, lumière",             icon: "🏖️" },
      { value: "nature",  label: "Nature & paysages", description: "Montagne, volcans, forêts, horizons",      icon: "🏔️" },
      { value: "any",     label: "Peu importe",       description: "Je suis ouvert à tout",                    icon: "🌍" },
    ],
  },
  {
    id: "flightTolerance",
    title: "Jusqu'où êtes-vous prêt à aller ?",
    subtitle: "En vol depuis Paris.",
    options: [
      { value: "short",  label: "Vol court",          description: "Moins de 3 heures",                          icon: "⚡" },
      { value: "medium", label: "Vol moyen",           description: "3 à 7 heures",                               icon: "✈️" },
      { value: "long",   label: "Long-courrier",       description: "Je veux voyager loin, plus de 7 heures",     icon: "🌏" },
      { value: "any",    label: "Peu importe",         description: "Ouvert à tout, sans préférence de distance", icon: "🌐" },
    ],
  },
  {
    id: "flightBudget",
    title: "Quel budget pour le billet d'avion ?",
    subtitle: "Aller-retour depuis Paris.",
    options: [
      { value: "low",      label: "Économique",  description: "Je cherche les meilleures offres (< 200€)", icon: "💰" },
      { value: "medium",   label: "Raisonnable", description: "Confort sans excès (< 400€)",               icon: "✈️" },
      { value: "flexible", label: "Peu importe", description: "Le billet n'est pas un frein",               icon: "🌐" },
    ],
  },
  {
    id: "styles",
    title: "Quelle atmosphère vous attire ?",
    subtitle: "Jusqu'à 2.",
    multi: true,
    maxSelect: 2,
    options: [
      { value: "authentic_local",     label: "Authentique & local",      description: "Quartiers vrais, rythme local, atmosphère simple",          icon: "🏘️" },
      { value: "culture_patrimoine",  label: "Culture & patrimoine",      description: "Temples, monuments, histoire, héritage",                    icon: "🏛️" },
      { value: "food_artdevivre",     label: "Food & art de vivre",       description: "Cuisine, marchés, cafés, plaisir de vivre",                 icon: "🍷" },
      { value: "energie_urbaine",     label: "Énergie & vie urbaine",     description: "Ville animée, contraste, mouvement, soirées",               icon: "⚡" },
      { value: "calme_contemplation", label: "Calme & contemplation",     description: "Beauté, lenteur, respiration, atmosphère paisible",         icon: "🧘" },
      { value: "nature_grand_air",    label: "Nature & grand air",        description: "Paysages, éléments, horizons, sensation d'espace",          icon: "🌿" },
    ],
  },
  {
    id: "interests",
    title: "Qu'est-ce qui vous attire ?",
    subtitle: "Jusqu'à 3.",
    multi: true,
    maxSelect: 3,
    options: [
      { value: "architecture", label: "Architecture", icon: "🏛️" },
      { value: "food", label: "Gastronomie", icon: "🍜" },
      { value: "history", label: "Histoire", icon: "📜" },
      { value: "nightlife", label: "Vie nocturne", icon: "🌙" },
      { value: "nature", label: "Paysages", icon: "🏔️" },
      { value: "art", label: "Art & musées", icon: "🎨" },
    ],
  },
];

// ─── Labels for displaying answers ───────────────────────────────

export const answerLabels: Record<string, Record<string, string>> = {
  budget: { low: "Budget serré", medium: "Budget moyen", high: "Confort", premium: "Premium" },
  duration: { short: "2-3 jours", week: "4-7 jours", long: "8-14 jours", extended: "15+ jours" },
  durationExact: {
    "1": "1 jour", "2": "2 jours", "3": "3 jours", "4": "4 jours", "5": "5 jours",
    "6": "6 jours", "7": "7 jours", "8": "8 jours", "9": "9 jours", "10": "10 jours",
    "11": "11 jours", "12": "12 jours", "13": "13 jours", "14": "14 jours",
  },
  departurePrecision: { month: "Mois précis", season: "Par saison" },
  departureMonth: {
    jan: "Janvier", feb: "Février", mar: "Mars",   apr: "Avril",
    may: "Mai",     jun: "Juin",    jul: "Juillet", aug: "Août",
    sep: "Septembre", oct: "Octobre", nov: "Novembre", dec: "Décembre",
  },
  period: { spring: "Printemps", summer: "Été", autumn: "Automne", winter: "Hiver" },
  group: { solo: "Solo", couple: "Couple", friends: "Amis", family: "Famille" },
  pace: { relaxed: "Relax", balanced: "Équilibré", dense: "Dense" },
  environment: { urban: "Ville & culture", coastal: "Mer & côtes", nature: "Nature & paysages", any: "Peu importe" },
  flightTolerance: { short: "Vol court (< 3h)", medium: "Vol moyen (3-7h)", long: "Long-courrier (> 7h)", any: "Peu importe" },
  flightBudget: { low: "Billet économique (< 200€)", medium: "Billet raisonnable (< 400€)", flexible: "Peu importe" },
  styles: {
    authentic_local: "Authentique & local",
    culture_patrimoine: "Culture & patrimoine",
    food_artdevivre: "Food & art de vivre",
    energie_urbaine: "Énergie urbaine",
    calme_contemplation: "Calme & contemplation",
    nature_grand_air: "Nature & grand air",
  },
  interests: {
    architecture: "Architecture",
    food: "Gastronomie",
    history: "Histoire",
    nightlife: "Vie nocturne",
    nature: "Paysages",
    art: "Art & musées",
  },
};

// ─── Envies tiles for home page ───────────────────────────────────

export const envies = [
  { icon: "☀️", label: "Soleil" },
  { icon: "🏛️", label: "Culture" },
  { icon: "🌿", label: "Nature" },
  { icon: "🏙️", label: "City-trip" },
  { icon: "⛰️", label: "Aventure" },
  { icon: "🧘", label: "Détente" },
  { icon: "🍷", label: "Gastro" },
  { icon: "🎶", label: "Vie nocturne" },
];
