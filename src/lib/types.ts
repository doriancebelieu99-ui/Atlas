// ─── Atlas — Shared Types ─────────────────────────────────────────

export type BudgetLevel = "low" | "medium" | "high" | "premium";
export type Period = "spring" | "summer" | "autumn" | "winter";
export type GroupType = "solo" | "couple" | "family" | "friends";
export type Pace = "relaxed" | "balanced" | "dense" | "very_active";
export type BudgetVariant = "economy" | "comfort" | "premium";
export type TimeSlot = "morning" | "afternoon" | "evening";
export type ActivityType = "culture" | "food" | "logistics" | "free";
export type Severity = "info" | "caution" | "warning";
export type ItineraryViewMode = "overview" | "day";
export type ViewName = "home" | "quiz" | "results" | "destination" | "compare" | "itinerary" | "explorer";

export type Environment = "urban" | "coastal" | "nature" | "mixed";
export type FlightTolerance = "short" | "medium" | "any" | "long";
export type DestinationType = "compact" | "city_plus" | "territory";
export type DepartureMonth = "jan" | "feb" | "mar" | "apr" | "may" | "jun" | "jul" | "aug" | "sep" | "oct" | "nov" | "dec";

// ─── User Preferences (quiz output) ──────────────────────────────

export interface PreferencesInput {
  budget?: BudgetLevel;
  durationDays: number;
  period?: Period;
  month?: number;
  groupType: GroupType;
  pace: Pace;
  styles?: string[];
  interests?: string[];
  environment?: string;
  flightTolerance?: FlightTolerance;
  maxTransportHoursPerDay?: number;
  comfortLevel?: string;
  excludeDestinations?: string[];
}

// ─── Destination Data ─────────────────────────────────────────────

export interface BudgetRange {
  min: number;
  max: number;
}

export interface BudgetDetail {
  label: string;
  economy: string;
  comfort: string;
  premium: string;
}

export interface BudgetProfile {
  economy: BudgetRange;
  comfort: BudgetRange;
  premium: BudgetRange;
  flight: BudgetRange;
  costIndex: number;
  freshness: string;
  details: BudgetDetail[];
}

export interface SeasonMonth {
  name: string;
  score: number;
  temp: number;
  rain: number;
  crowd?: number;
}

export interface SeasonProfile {
  months: SeasonMonth[];
  best: string;
  avoid: string;
  note: string;
}

export interface ContextProfile {
  culture: string;
  tips: string;
  surprises: string;
  history: string;
}

export interface SafetyPoint {
  category: string;
  level: string;
  text: string;
}

export interface SafetyProfile {
  overall: string;
  logisticsScore: number;
  freshness: string;
  points: SafetyPoint[];
}

export interface Constraint {
  text: string;
  severity: Severity;
}

export interface WhyGoItem {
  title: string;
  description: string;
}

export interface CityInfo {
  name: string;
  type: string;
  duration: string;
  description: string;
  vibe: string;
}

export interface ItineraryActivity {
  slot: string;
  name: string;
  type: ActivityType;
  duration: number;
  icon: string;
  note: string;
}

export interface ItineraryDay {
  number: number;
  title: string;
  zone: string;
  intensity: number;
  transportMinutes: number;
  freeSlots: number;
  activities: ItineraryActivity[];
}

export interface ItineraryData {
  days: ItineraryDay[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Destination {
  slug: string;
  name: string;
  country: string;
  region: string;
  tagline: string;
  score: number;
  image: string;
  summary: string;
  mainInterest: string;
  idealDuration: string;
  destinationType: DestinationType;
  pace: string;
  ambiance: string[];
  targetProfiles: string[];
  environment: Environment;
  flightHoursFromParis: number;
  coordinates: Coordinates;
  whyGo: WhyGoItem[];
  constraints: Constraint[];
  budget: BudgetProfile;
  season: SeasonProfile;
  context: ContextProfile;
  safety: SafetyProfile;
  cities: CityInfo[];
  itinerary: ItineraryData | null;
}

// ─── Scoring ──────────────────────────────────────────────────────

export interface CriteriaScores {
  budget: number;
  season: number;
  style: number;
  duration: number;
  logistics: number;
  interests: number;
  pace: number;
  group: number;
  environment: number;
  flightTime: number;
}

export interface ScoringWeights {
  budget: number;
  season: number;
  style: number;
  duration: number;
  logistics: number;
  interests: number;
  pace: number;
  group: number;
  environment: number;
  flightTime: number;
}

export interface DestinationScoreResult {
  slug: string;
  name: string;
  country: string;
  image: string;
  totalScore: number;
  criteriaScores: CriteriaScores;
  highlights: string[];
  limitations: string[];
  budgetEstimate: { min: number; max: number; variant: string };
  ambiance: string[];
  hasItinerary: boolean;
}

// ─── Quiz ─────────────────────────────────────────────────────────

export interface QuizOption {
  value: string;
  label: string;
  description?: string;
  icon: string;
}

export interface QuizQuestion {
  id: string;
  title: string;
  subtitle: string;
  multi?: boolean;
  maxSelect?: number;
  options: QuizOption[];
  visibleWhen?: (answers: Record<string, string | string[]>) => boolean;
}

export type QuizAnswers = Record<string, string | string[]>;
