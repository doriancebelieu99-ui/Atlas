import dynamic from "next/dynamic";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import { destinations as destMap } from "@/data/destinations";
import type { Destination } from "@/lib/types";

const GlobeExplorer = dynamic(
  () => import("@/components/explorer/GlobeExplorer"),
  { ssr: false }
);

export const metadata = { title: "Explorer — Atlas" };

export default function ExplorerPage() {
  const destinations: Destination[] = Object.values(destMap);

  return (
    <div className="atlas">
      <Nav currentView="explorer" onNavigate={() => {}} />
      <div className="explorer-page">
        <div className="explorer-header">
          <div className="section-label">Explorer</div>
          <h1 className="explorer-title">Toutes les destinations</h1>
          <p className="explorer-sub">
            Survolez un point doré pour l&apos;identifier, cliquez pour ouvrir la fiche.
          </p>
        </div>
        <GlobeExplorer destinations={destinations} />
        <div className="explorer-fallback">
          <p className="explorer-fallback-label">Toutes les destinations</p>
          <div className="explorer-fallback-grid">
            {destinations.map((d) => (
              <Link
                key={d.slug}
                href={`/destination/${d.slug}`}
                className="explorer-fallback-card"
              >
                <img
                  src={d.image}
                  alt={d.name}
                  className="explorer-fallback-img"
                  loading="lazy"
                />
                <div className="explorer-fallback-info">
                  <span className="explorer-fallback-name">{d.name}</span>
                  <span className="explorer-fallback-country">{d.country}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
