const pillars = [
  {
    title: "Recommandations personnalisées",
    desc: "Chaque résultat est calculé à partir de votre profil réel : budget, rythme, style de voyage, période. Pas un classement générique.",
  },
  {
    title: "Lecture multi-critères",
    desc: "Dix paramètres sont évalués simultanément. La destination retenue n'est pas forcément la plus connue — c'est la plus adaptée à vous.",
  },
  {
    title: "Itinéraires réalistes",
    desc: "Les programmes jour par jour tiennent compte des distances, durées de visite et du rythme demandé. Conçus pour être suivis, pas seulement lus.",
  },
  {
    title: "Approche éditoriale sobre",
    desc: "Sélection fondée sur la pertinence. Aucun critère commercial n'influence le classement des destinations.",
  },
];

export default function Reassurance() {
  return (
    <section className="reassurance">
      <div className="reassurance-inner">
        <div className="section-label reassurance-label">Pourquoi Atlas</div>
        <div className="reassurance-grid">
          {pillars.map((p) => (
            <div key={p.title} className="reassurance-item">
              <div className="reassurance-title">{p.title}</div>
              <p className="reassurance-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
