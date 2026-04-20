const steps = [
  {
    num: "01",
    title: "Votre profil",
    desc: "Répondez à 9 questions sur votre façon de voyager.",
  },
  {
    num: "02",
    title: "L'analyse",
    desc: "Atlas évalue chaque destination sur 10 critères personnalisés.",
  },
  {
    num: "03",
    title: "Votre résultat",
    desc: "Recevez un classement expliqué et un itinéraire réaliste.",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="how-it-works-inner">
        <div className="section-label how-it-works-label">Comment ça marche</div>
        <div className="how-it-works-steps">
          {steps.map((s) => (
            <div key={s.num} className="how-step">
              <div className="how-step-num">{s.num}</div>
              <div className="how-step-title">{s.title}</div>
              <p className="how-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
