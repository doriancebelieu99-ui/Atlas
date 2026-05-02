"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/layout/Nav";
import ItineraryOverview from "@/components/itinerary/ItineraryOverview";
import DayView from "@/components/itinerary/DayView";
import { INTENSITY_COLORS, INTENSITY_ICONS } from "@/data/ui-constants";
import { buildUrl } from "@/lib/nav";
import type { Destination, ViewName, ItineraryViewMode } from "@/lib/types";
import type { AdaptedItinerary } from "@/lib/itinerary-builder";

const ADAPTATION_LABEL: Record<string, string> = {
  compressed_best_of: "Meilleurs jours sélectionnés",
  extended_with_cities: "Étendu avec zones secondaires",
  exhausted_content: "Contenu affiché intégralement",
};

interface Props {
  dest: Destination;
  sid: string | null;
  adaptedItinerary: AdaptedItinerary | null;
}

export default function ItineraryClient({ dest, sid, adaptedItinerary }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<ItineraryViewMode>("overview");
  const [selectedDay, setSelectedDay] = useState(1);

  const navigate = (view: ViewName, slug?: string) => {
    router.push(buildUrl(view, slug ?? dest.slug, sid));
  };

  if (!dest.itinerary) {
    return (
      <div className="atlas">
        <Nav currentView="itinerary" onNavigate={navigate} />
        <div className="page-empty">
          <h2>Itinéraire non disponible</h2>
          <p>
            L'itinéraire pour {dest.name} n'est pas encore disponible.
          </p>
          <button className="btn-primary" onClick={() => navigate("destination", dest.slug)}>
            ← Retour à la fiche
          </button>
        </div>
      </div>
    );
  }

  const days = adaptedItinerary?.days ?? dest.itinerary.days;
  const adaptationMode = adaptedItinerary?.adaptationMode ?? "exact_template";
  const durationWarning = adaptedItinerary?.durationWarning;
  const requestedDays = adaptedItinerary?.requestedDays;
  const generatedDays = adaptedItinerary?.generatedDays ?? days.length;

  const avg = (days.reduce((s, d) => s + d.intensity, 0) / days.length).toFixed(1);
  const currentDay = days.find((d) => d.number === selectedDay);

  const handleSelectDay = (n: number) => {
    setSelectedDay(n);
    setMode("day");
  };

  const showAdaptation = adaptationMode !== "exact_template" && ADAPTATION_LABEL[adaptationMode];
  const showDayMismatch = requestedDays !== undefined && requestedDays !== generatedDays;

  return (
    <div className="atlas">
      <Nav currentView="itinerary" onNavigate={navigate} />
      <div className="itinerary-page">
        <div className="itin-header">
          <h1 className="itin-dest">{dest.name}, {dest.country}</h1>
          <div className="itin-title">
            Votre itinéraire · {generatedDays} jour{generatedDays > 1 ? "s" : ""}
          </div>
          {showAdaptation && (
            <div className="itin-adaptation">
              {showDayMismatch && `${requestedDays} jours demandés · `}
              {ADAPTATION_LABEL[adaptationMode]}
            </div>
          )}
          <div className="itin-meta">{dest.pace} · Intensité moy. {avg}/5</div>
          {adaptedItinerary?.paceProfile && (
            <div className="itin-pace-profile">
              <strong>{adaptedItinerary.paceProfile.label}</strong>
              {" · "}
              {adaptedItinerary.paceProfile.hint}
            </div>
          )}
        </div>

        {durationWarning && (
          <div className="itin-duration-warning" role="note">
            {durationWarning}
          </div>
        )}

        <div className="itin-day-nav" role="tablist" aria-label="Navigation par jour">
          <button
            id="itin-tab-overview"
            role="tab"
            className={`itin-day-btn ${mode === "overview" ? "active" : ""}`}
            onClick={() => setMode("overview")}
            aria-selected={mode === "overview"}
            aria-controls="itin-panel"
            tabIndex={mode === "overview" ? 0 : -1}
          >
            Vue d'ensemble
          </button>
          {days.map((d) => (
            <button
              key={d.number}
              id={`itin-tab-day-${d.number}`}
              role="tab"
              className={`itin-day-btn ${mode === "day" && selectedDay === d.number ? "active" : ""}`}
              onClick={() => handleSelectDay(d.number)}
              aria-selected={mode === "day" && selectedDay === d.number}
              aria-controls="itin-panel"
              tabIndex={mode === "day" && selectedDay === d.number ? 0 : -1}
            >
              J{d.number}{" "}
              <span
                aria-hidden="true"
                style={{
                  marginLeft: 3,
                  fontSize: 10,
                  color: mode === "day" && selectedDay === d.number ? "#fff" : INTENSITY_COLORS[d.intensity],
                }}
              >
                {INTENSITY_ICONS[d.intensity]}
              </span>
            </button>
          ))}
        </div>

        <div
          id="itin-panel"
          role="tabpanel"
          aria-labelledby={mode === "overview" ? "itin-tab-overview" : `itin-tab-day-${selectedDay}`}
        >
          {mode === "overview" && <ItineraryOverview days={days} onSelectDay={handleSelectDay} />}
          {mode === "day" && currentDay && <DayView day={currentDay} />}
        </div>

        <div className="itin-actions">
          <button
            className="btn-outline"
            onClick={() => navigate("destination", dest.slug)}
            aria-label={`← Retour à la fiche ${dest.name}`}
          >
            ← Retour à la destination
          </button>
        </div>
      </div>
    </div>
  );
}
