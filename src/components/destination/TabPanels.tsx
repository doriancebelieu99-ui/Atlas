// ─── Atlas — Destination Tab Panels ───────────────────────────────
import { SEVERITY_STYLES, scoreColor } from "@/data/ui-constants";
import type { Destination } from "@/lib/types";

// ─── Résumé ───────────────────────────────────────────────────────

export function TabResume({ dest }: { dest: Destination }) {
  return (
    <div className="tab-panel">
      <p className="tab-summary">{dest.summary}</p>

      <div className="tab-meta-row">
        <span>Thème · {dest.mainInterest}</span>
        <span>Durée · {dest.idealDuration}</span>
        <span>Rythme · {dest.pace}</span>
      </div>

      <div className="tag-list">
        {dest.ambiance.map((a) => (
          <span key={a} className="tag">{a}</span>
        ))}
      </div>

      <h3 className="tab-section-title">Pourquoi y aller</h3>
      <div className="why-go-list">
        {dest.whyGo.map((w, i) => (
          <div key={i} className="why-go-item">
            <div className="why-go-title">{w.title}</div>
            <div className="why-go-desc">{w.description}</div>
          </div>
        ))}
      </div>

      <h3 className="tab-section-title">Points d'attention</h3>
      <div className="constraints-list">
        {dest.constraints.map((c, i) => {
          const style = SEVERITY_STYLES[c.severity] ?? SEVERITY_STYLES.info;
          return (
            <div
              key={i}
              className="constraint-item"
              style={{ background: style.bg, borderLeft: `3px solid ${style.border}` }}
            >
              <span>{style.icon}</span> {c.text}
            </div>
          );
        })}
      </div>

      <h3 className="tab-section-title">Pour quel voyageur</h3>
      <div className="tag-list">
        {dest.targetProfiles.map((p) => (
          <span key={p} className="tag tag-profile">{p}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Budget ───────────────────────────────────────────────────────

export function TabBudget({ dest }: { dest: Destination }) {
  const b = dest.budget;
  return (
    <div className="tab-panel">
      <div className="budget-grid">
        {(["economy", "comfort", "premium"] as const).map((variant) => {
          const range = b[variant];
          const label = variant === "economy" ? "Économique" : variant === "comfort" ? "Confort" : "Premium";
          return (
            <div key={variant} className={`budget-card ${variant}`}>
              <div className="budget-card-label">{label}</div>
              <div className="budget-card-range">{range.min}–{range.max}€</div>
              <div className="budget-card-per">/jour/pers.</div>
            </div>
          );
        })}
      </div>

      <div className="budget-flight">
        Vol A/R depuis l'Europe : {b.flight.min}–{b.flight.max}€
      </div>

      <table className="budget-table">
        <thead>
          <tr>
            <th>Poste</th>
            <th>Éco</th>
            <th>Confort</th>
            <th>Premium</th>
          </tr>
        </thead>
        <tbody>
          {b.details.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{d.economy}</td>
              <td>{d.comfort}</td>
              <td>{d.premium}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="budget-meta">
        <span>Indice coût de vie : {b.costIndex}/200 (100 = France)</span>
        <span>Données : {b.freshness}</span>
      </div>

      <p className="budget-disclaimer">
        Estimation indicative. Les prix varient selon la saison et vos choix.
      </p>
    </div>
  );
}

// ─── Saison ───────────────────────────────────────────────────────

export function TabSeason({ dest }: { dest: Destination }) {
  const s = dest.season;
  return (
    <div className="tab-panel">
      <div className="season-grid">
        {s.months.map((m) => (
          <div key={m.name} className="season-cell">
            <div className="season-month">{m.name}</div>
            <div className="season-bar-bg">
              <div
                className="season-bar-fill"
                style={{ height: `${m.score}%`, background: scoreColor(m.score) }}
              />
            </div>
            <div className="season-score">{m.score}</div>
            <div className="season-temp">{m.temp}°</div>
          </div>
        ))}
      </div>

      <div className="season-info">
        <div className="season-info-item">
          <strong>Meilleure période :</strong> {s.best}
        </div>
        <div className="season-info-item">
          <strong>À éviter :</strong> {s.avoid}
        </div>
        <div className="season-info-item">
          <strong>Notre avis :</strong> {s.note}
        </div>
      </div>
    </div>
  );
}

// ─── Contexte ─────────────────────────────────────────────────────

export function TabContext({ dest }: { dest: Destination }) {
  const c = dest.context;
  return (
    <div className="tab-panel">
      <p className="tab-intro">Quelques clés pour mieux comprendre où vous allez.</p>

      <div className="context-block">
        <h4>Culture locale</h4>
        <p>{c.culture}</p>
      </div>
      <div className="context-block">
        <h4>Conseils pratiques</h4>
        <p>{c.tips}</p>
      </div>
      <div className="context-block">
        <h4>Ce qui surprend</h4>
        <p>{c.surprises}</p>
      </div>
      <div className="context-block">
        <h4>Repère historique</h4>
        <p>{c.history}</p>
      </div>
    </div>
  );
}

// ─── Sécurité ─────────────────────────────────────────────────────

const CONTEXT_TOPIC_LABELS: Record<string, string> = {
  solo: "Voyage en solo",
  socialNorms: "Usages locaux",
  identityContext: "À savoir selon le contexte",
};

export function TabSafety({ dest }: { dest: Destination }) {
  const s = dest.safety;
  return (
    <div className="tab-panel">
      <div className="safety-header">
        <span className="safety-level">Facilité : {s.overall}</span>
        <span className="safety-logistics">Logistique : {s.logisticsScore}/100</span>
        <span className="safety-fresh">Données : {s.freshness}</span>
      </div>

      <div className="safety-points">
        {s.points.map((p, i) => (
          <div key={i} className="safety-point">
            <div className="safety-point-cat">{p.category}</div>
            <div className="safety-point-text">{p.text}</div>
          </div>
        ))}
      </div>

      {s.contextNotes && s.contextNotes.length > 0 && (
        <div className="safety-context">
          {s.contextNotes.map((note, i) => (
            <div key={i} className="safety-context-note">
              <span className="safety-context-label">
                {CONTEXT_TOPIC_LABELS[note.topic] ?? note.topic}
              </span>
              <p className="safety-context-text">{note.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Lieux clés ───────────────────────────────────────────────────

export function TabCities({ dest }: { dest: Destination }) {
  return (
    <div className="tab-panel">
      <div className="section-label">Lieux clés</div>
      <h3 className="section-title">Que voir à {dest.name} ?</h3>

      <div className="cities-grid">
        {dest.cities.map((c, i) => (
          <div key={i} className="city-card">
            <div className="city-type">{c.type}</div>
            <div className="city-header">
              <span className="city-name">{c.name}</span>
              <span className="city-duration">{c.duration}</span>
            </div>
            <div className="city-desc">{c.description}</div>
            <div className="city-vibe">Ambiance : {c.vibe}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
