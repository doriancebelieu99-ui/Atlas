interface HeroProps {
  onStart: () => void;
  images?: string[];
}

export default function Hero({ onStart, images }: HeroProps) {
  const showMosaic = images && images.length >= 4;

  return (
    <section className={`hero${showMosaic ? " hero--split" : ""}`}>
      <div className="hero-text">
        <span className="hero-badge">Recommandations personnalisées · Itinéraires réalistes</span>
        <h1 className="hero-title">
          Trouvez le voyage qui vous <em>ressemble</em>
        </h1>
        <p className="hero-sub">
          Atlas analyse vos envies, qualifie les destinations et construit un
          itinéraire réaliste adapté à votre façon de voyager.
        </p>
        <button className="hero-cta" onClick={onStart}>
          Trouver ma destination →
        </button>
        <p className="hero-reassurance">
          Scoring multi-critères · Itinéraire jour par jour · Sélection sans logique commerciale
        </p>
      </div>

      {showMosaic && (
        <div className="hero-mosaic" aria-hidden="true">
          {images.slice(0, 4).map((src, i) => (
            <img key={i} src={src} className="hero-mosaic-img" alt="" />
          ))}
        </div>
      )}
    </section>
  );
}
