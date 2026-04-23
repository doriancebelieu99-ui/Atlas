"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Destination } from "@/lib/types";

const GlobeExplorer = dynamic(
  () => import("@/components/explorer/GlobeExplorer"),
  { ssr: false }
);

// ─── Filter types ─────────────────────────────────────────────

type BudgetFilter = "all" | "low" | "medium" | "high" | "premium";
type DurationFilter = "all" | "short" | "medium" | "long";
type FlightFilter = "all" | "short" | "medium" | "long";
type EnvironmentFilter = "all" | "urban" | "coastal" | "nature" | "mixed";

interface Filters {
  query: string;
  budget: BudgetFilter;
  duration: DurationFilter;
  flight: FlightFilter;
  environment: EnvironmentFilter;
}

const INITIAL: Filters = {
  query: "",
  budget: "all",
  duration: "all",
  flight: "all",
  environment: "all",
};

// ─── Filter logic ─────────────────────────────────────────────

function parseMaxDays(idealDuration: string): number {
  const nums = idealDuration.match(/\d+/g) ?? [];
  return nums.length ? parseInt(nums[nums.length - 1], 10) : 0;
}

function filterDestinations(destinations: Destination[], f: Filters): Destination[] {
  return destinations.filter((d) => {
    if (f.query) {
      const q = f.query.toLowerCase();
      if (!d.name.toLowerCase().includes(q) && !d.country.toLowerCase().includes(q)) return false;
    }
    if (f.budget !== "all") {
      const ci = d.budget.costIndex;
      if (f.budget === "low" && ci > 45) return false;
      if (f.budget === "medium" && (ci <= 45 || ci > 65)) return false;
      if (f.budget === "high" && (ci <= 65 || ci > 80)) return false;
      if (f.budget === "premium" && ci <= 80) return false;
    }
    if (f.duration !== "all") {
      const max = parseMaxDays(d.idealDuration);
      if (f.duration === "short" && max > 6) return false;
      if (f.duration === "medium" && (max <= 6 || max > 8)) return false;
      if (f.duration === "long" && max <= 8) return false;
    }
    if (f.flight !== "all") {
      const h = d.flightHoursFromParis;
      if (f.flight === "short" && h > 4) return false;
      if (f.flight === "medium" && (h <= 4 || h > 10)) return false;
      if (f.flight === "long" && h <= 10) return false;
    }
    if (f.environment !== "all" && d.environment !== f.environment) return false;
    return true;
  });
}

// ─── Constants ────────────────────────────────────────────────

const ENV_OPTIONS: { value: EnvironmentFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "urban", label: "Urbain" },
  { value: "coastal", label: "Côtier" },
  { value: "nature", label: "Nature" },
  { value: "mixed", label: "Mixte" },
];

// ─── Component ────────────────────────────────────────────────

interface Props {
  destinations: Destination[];
}

export default function ExplorerClient({ destinations }: Props) {
  const [filters, setFilters] = useState<Filters>(INITIAL);

  const filtered = useMemo(
    () => filterDestinations(destinations, filters),
    [destinations, filters]
  );

  const isActive =
    filters.query !== "" ||
    filters.budget !== "all" ||
    filters.duration !== "all" ||
    filters.flight !== "all" ||
    filters.environment !== "all";

  const reset = () => setFilters(INITIAL);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const countLabel =
    filtered.length === 0
      ? "Aucun résultat"
      : isActive
      ? `${filtered.length} destination${filtered.length !== 1 ? "s" : ""} trouvée${filtered.length !== 1 ? "s" : ""}`
      : `${filtered.length} destinations`;

  return (
    <div className="explorer-page">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="explorer-header">
        <div className="section-label">Explorer</div>
        <h1 className="explorer-title">Toutes les destinations</h1>
        <p className="explorer-sub">
          Survolez un point doré pour l&apos;identifier, cliquez pour ouvrir la fiche.
        </p>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="explorer-filters">
        <div className="explorer-filters-row">
          <div className="explorer-search-wrap">
            <input
              type="text"
              className="explorer-search"
              placeholder="Rechercher une destination..."
              value={filters.query}
              onChange={(e) => set("query", e.target.value)}
              aria-label="Rechercher une destination"
            />
          </div>
          <select
            className={`explorer-select${filters.budget !== "all" ? " is-active" : ""}`}
            value={filters.budget}
            onChange={(e) => set("budget", e.target.value as BudgetFilter)}
            aria-label="Filtrer par budget"
          >
            <option value="all">Budget</option>
            <option value="low">Économique</option>
            <option value="medium">Modéré</option>
            <option value="high">Élevé</option>
            <option value="premium">Premium</option>
          </select>
          <select
            className={`explorer-select${filters.duration !== "all" ? " is-active" : ""}`}
            value={filters.duration}
            onChange={(e) => set("duration", e.target.value as DurationFilter)}
            aria-label="Filtrer par durée de séjour"
          >
            <option value="all">Durée</option>
            <option value="short">Court séjour (4-6 j)</option>
            <option value="medium">Moyen séjour (7-8 j)</option>
            <option value="long">Long séjour (9 j et +)</option>
          </select>
          <select
            className={`explorer-select${filters.flight !== "all" ? " is-active" : ""}`}
            value={filters.flight}
            onChange={(e) => set("flight", e.target.value as FlightFilter)}
            aria-label="Filtrer par temps de vol"
          >
            <option value="all">Temps de vol</option>
            <option value="short">Court-courrier (moins de 4 h)</option>
            <option value="medium">Moyen-courrier (4 à 10 h)</option>
            <option value="long">Long-courrier (plus de 10 h)</option>
          </select>
          {isActive && (
            <button
              className="explorer-reset"
              onClick={reset}
              aria-label="Réinitialiser les filtres"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <div className="explorer-env-row">
          {ENV_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`explorer-env-pill${filters.environment === opt.value ? " is-active" : ""}`}
              onClick={() => set("environment", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="explorer-count">{countLabel}</p>
      </div>

      {/* ── Globe ──────────────────────────────────────────── */}
      <GlobeExplorer destinations={filtered} />

      {/* ── Empty state ────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="explorer-empty">
          <p className="explorer-empty-text">
            Aucune destination ne correspond à ces filtres.
          </p>
          <button className="explorer-empty-reset" onClick={reset}>
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* ── Fallback grid ──────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="explorer-fallback">
          <p className="explorer-fallback-label">
            {isActive
              ? `${filtered.length} résultat${filtered.length !== 1 ? "s" : ""}`
              : "Toutes les destinations"}
          </p>
          <div className="explorer-fallback-grid">
            {filtered.map((d) => (
              <Link
                key={d.slug}
                href={`/destination/${d.slug}`}
                className="explorer-fallback-card"
              >
                <img
                  src={d.image}
                  alt={d.name}
                  className="explorer-fallback-img"
                  loading="lazy"
                />
                <div className="explorer-fallback-info">
                  <span className="explorer-fallback-name">{d.name}</span>
                  <span className="explorer-fallback-country">{d.country}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
