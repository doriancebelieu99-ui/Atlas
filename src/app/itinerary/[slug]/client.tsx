"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/layout/Nav";
import ItineraryOverview from "@/components/itinerary/ItineraryOverview";
import DayView from "@/components/itinerary/DayView";
import { INTENSITY_COLORS, INTENSITY_ICONS } from "@/data/ui-constants";
import { buildUrl } from "@/lib/nav";
import type { Destination, ViewName, ItineraryViewMode } from "@/lib/types";

interface Props {
  dest: Destination;
  sid: string | null;
}

export default function ItineraryClient({ dest, sid }: Props) {
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
            L'itinéraire pour {dest.name} n'est pas encore généré.
            Disponible actuellement pour Lisbonne.
          </p>
          <button className="btn-primary" onClick={() => navigate("destination", dest.slug)}>
            ← Retour à la fiche
          </button>
        </div>
      </div>
    );
  }

  const days = dest.itinerary.days;
  const avg = (days.reduce((s, d) => s + d.intensity, 0) / days.length).toFixed(1);
  const currentDay = days.find((d) => d.number === selectedDay);

  const handleSelectDay = (n: number) => {
    setSelectedDay(n);
    setMode("day");
  };

  return (
    <div className="atlas">
      <Nav currentView="itinerary" onNavigate={navigate} />
      <div className="itinerary-page">
        <div className="itin-header">
          <div className="itin-dest">{dest.name}, {dest.country}</div>
          <div className="itin-title">Votre itinéraire · {days.length} jours</div>
          <div className="itin-meta">⚖️ Équilibré · 💕 Couple · Intensité moy. {avg}/5</div>
          <div className="itin-budget">
            💰 <strong>920–1 420€</strong>{" "}
            <span className="itin-budget-note">(2 pers.)</span>
          </div>
        </div>

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
            ← Fiche
          </button>
          <button className="btn-primary"><span aria-hidden="true">💾</span> Sauvegarder</button>
          <button className="btn-outline"><span aria-hidden="true">📤</span> Partager</button>
        </div>
      </div>
    </div>
  );
}
