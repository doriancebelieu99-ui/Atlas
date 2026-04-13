interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="hero">
      <span className="hero-badge">Copilote de voyage intelligent</span>
      <h1 className="hero-title">
        Trouvez le voyage qui vous <em>ressemble</em>
      </h1>
      <p className="hero-sub">
        Atlas analyse vos envies, qualifie les destinations et construit un
        itinéraire réaliste — en quelques minutes, pas en 40 heures.
      </p>
      <button className="hero-cta" onClick={onStart}>
        Où partez-vous ? →
      </button>
    </section>
  );
}
