// ─── Atlas — Day View ─────────────────────────────────────────────
import {
  INTENSITY_COLORS,
  INTENSITY_ICONS,
  ACTIVITY_COLORS,
  ACTIVITY_TYPE_LABELS,
} from "@/data/ui-constants";
import type { ItineraryDay } from "@/lib/types";

interface DayViewProps {
  day: ItineraryDay;
}

export default function DayView({ day }: DayViewProps) {
  const slots = ["morning", "afternoon", "evening"] as const;
  const slotLabels = { morning: "Matin", afternoon: "Après-midi", evening: "Soirée" };

  const activitiesBySlot = (slot: string) => {
    return day.activities.filter((a) => {
      const h = parseInt(a.slot);
      if (slot === "morning") return h < 12;
      if (slot === "afternoon") return h >= 12 && h < 18;
      return h >= 18;
    });
  };

  return (
    <div className="day-view">
      {/* Day header */}
      <div className="day-header">
        <div>
          <div className="day-number">Jour {day.number}</div>
          <div className="day-title">{day.title}</div>
          <div className="day-zone">📍 {day.zone}</div>
        </div>
        <div className="day-stats">
          <div className="day-stat">
            <div
              className="day-stat-value"
              style={{ color: INTENSITY_COLORS[day.intensity] }}
            >
              {INTENSITY_ICONS[day.intensity]} {day.intensity}/5
            </div>
            <div className="day-stat-label">Intensité</div>
          </div>
          <div className="day-stat">
            <div className="day-stat-value">🚶 {day.transportMinutes}′</div>
            <div className="day-stat-label">Transport</div>
          </div>
          <div className="day-stat">
            <div className="day-stat-value">✨ {day.freeSlots}</div>
            <div className="day-stat-label">Libre</div>
          </div>
        </div>
      </div>

      {/* Timeline by slot */}
      <div className="day-timeline">
        {slots.map((slot) => {
          const acts = activitiesBySlot(slot);
          if (acts.length === 0) return null;
          return (
            <div key={slot} className="day-slot-group">
              <div className="day-slot-label">{slotLabels[slot]}</div>
              {acts.map((a, i) => {
                const colors = ACTIVITY_COLORS[a.type] ?? ACTIVITY_COLORS.culture;
                return (
                  <div key={i} className={`day-activity ${a.type === "free" ? "free" : ""}`}>
                    <div className="day-activity-top">
                      <div style={{ flex: 1 }}>
                        <div className="day-activity-slot">{a.slot}</div>
                        <div className="day-activity-name">
                          <span className="day-activity-icon">{a.icon}</span>
                          {a.name}
                        </div>
                        <span
                          className="day-activity-type"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {ACTIVITY_TYPE_LABELS[a.type] ?? a.type}
                        </span>
                      </div>
                      <div className="day-activity-duration">⏱ {a.duration}′</div>
                    </div>
                    {a.note && <div className="day-activity-note">{a.note}</div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
