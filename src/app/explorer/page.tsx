import dynamic from "next/dynamic";
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
            Faites tourner le globe et cliquez sur un point pour découvrir une destination.
          </p>
        </div>
        <GlobeExplorer destinations={destinations} />
      </div>
    </div>
  );
}
