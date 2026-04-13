"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Hero from "@/components/layout/Hero";
import { envies } from "@/data/quiz-questions";
import { scoreColor } from "@/data/ui-constants";
import type { Destination, ViewName } from "@/lib/types";

interface HomeClientProps {
  destinations: Destination[];
}

export default function HomeClient({ destinations }: HomeClientProps) {
  const router = useRouter();

  const handleNavigate = (view: ViewName) => {
    router.push(view === "home" ? "/" : `/${view}`);
  };

  return (
    <div className="atlas">
      <Nav currentView="home" onNavigate={handleNavigate} />
      <Hero onStart={() => router.push("/quiz")} />

      <section className="section">
        <div className="section-label">Explorer</div>
        <h2 className="section-title">Par envie</h2>
        <div className="envies-grid">
          {envies.map((e) => (
            <Link key={e.label} href="/quiz" className="envie-card">
              <span className="envie-icon">{e.icon}</span>
              <span className="envie-label">{e.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-label">Destinations</div>
        <h2 className="section-title">Populaires</h2>
        <div className="dest-grid">
          {destinations.map((d) => (
            <Link key={d.slug} href={`/destination/${d.slug}`} className="dest-card">
              <div className="dest-card-img-wrap">
                <img src={d.image} alt={d.name} className="dest-card-img" loading="lazy" />
                <div className="dest-card-score" style={{ color: scoreColor(d.score) }}>
                  {d.score}%
                </div>
              </div>
              <div className="dest-card-body">
                <div className="dest-card-country">{d.country}</div>
                <div className="dest-card-name">{d.name}</div>
                <div className="dest-card-tagline">{d.tagline}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
