// ─── Atlas — Fiche Hero ───────────────────────────────────────────
import { scoreColor } from "@/data/ui-constants";
import type { Destination } from "@/lib/types";

interface FicheHeroProps {
  dest: Destination;
}

export default function FicheHero({ dest }: FicheHeroProps) {
  const heroImageStyle = dest.slug === "reykjavik" ? { objectPosition: "center 68%" } : undefined;
  return (
    <div className="fiche-hero">
      <img src={dest.image} alt={dest.name} className="fiche-hero-img" style={heroImageStyle} />
      <div className="fiche-hero-overlay">
        <span className="fiche-hero-region">{dest.region}, {dest.country}</span>
        <h1 className="fiche-hero-name">{dest.name}</h1>
        <p className="fiche-hero-tagline">{dest.tagline}</p>
        <div className="fiche-hero-score" style={{ color: scoreColor(dest.score) }}>
          Compatibilité {dest.score}%
        </div>
      </div>
    </div>
  );
}
