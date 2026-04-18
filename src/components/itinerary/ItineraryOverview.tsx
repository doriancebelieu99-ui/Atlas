// ─── Atlas — Itinerary Overview ───────────────────────────────────
import {
  INTENSITY_COLORS,
  INTENSITY_ICONS,
  INTENSITY_LABELS,
  ACTIVITY_COLORS,
} from "@/data/ui-constants";
import type { ItineraryDay } from "@/lib/types";

interface ItineraryOverviewProps {
  days: ItineraryDay[];
  onSelectDay: (dayNumber: number) => void;
}

export default function ItineraryOverview({ days, onSelectDay }: ItineraryOverviewProps) {
  return (
    <div className="itin-overview">
      {days.map((day) => (
        <div
          key={day.number}
          className="itin-overview-card"
          style={{ animationDelay: `${day.number * 0.05}s` }}
          onClick={() => onSelectDay(day.number)}
        >
          <div
            className="itin-overview-indicator"
            style={{ background: INTENSITY_COLORS[day.intensity] }}
          />
          <div className="itin-overview-body">
            <div className="itin-overview-top">
              <span className="itin-overview-day">Jour {day.number}</span>
              <span className="itin-overview-intensity">
                <span aria-hidden="true" style={{ color: INTENSITY_COLORS[day.intensity] }}>
                  {INTENSITY_ICONS[day.intensity]}
                </span>{" "}
                {INTENSITY_LABELS[day.intensity]}
              </span>
            </div>

            <div className="itin-overview-title">{day.title}</div>
            <div className="itin-overview-zone">📍 {day.zone}</div>

            <div className="itin-overview-tags">
              {day.activities
                .filter((a) => a.type !== "logistics")
                .slice(0, 4)
                .map((a, i) => {
                  const colors = ACTIVITY_COLORS[a.type] ?? ACTIVITY_COLORS.culture;
                  return (
                    <span
                      key={i}
                      className="itin-tag"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {a.icon} {a.name}
                    </span>
                  );
                })}
            </div>

            <div className="itin-overview-meta">
              <span>⏱ {day.activities.length} activités</span>
              <span>🚶 {day.transportMinutes}′</span>
              <span>✨ {day.freeSlots} libre</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
