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
    id: "period",
    title: "Quand ?",
    subtitle: "La saison change tout.",
    options: [
      { value: "spring", label: "Printemps", description: "Mars–Mai", icon: "🌸" },
      { value: "summer", label: "Été", description: "Juin–Août", icon: "☀️" },
      { value: "autumn", label: "Automne", description: "Sept–Nov", icon: "🍂" },
      { value: "winter", label: "Hiver", description: "Déc–Fév", icon: "❄️" },
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
  period: { spring: "Printemps", summer: "Été", autumn: "Automne", winter: "Hiver" },
  group: { solo: "Solo", couple: "Couple", friends: "Amis", family: "Famille" },
  pace: { relaxed: "Relax", balanced: "Équilibré", dense: "Dense" },
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
