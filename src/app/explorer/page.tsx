import Nav from "@/components/layout/Nav";
import { destinations as destMap } from "@/data/destinations";
import type { Destination } from "@/lib/types";
import ExplorerClient from "@/components/explorer/ExplorerClient";

export const metadata = { title: "Explorer — Atlas" };

export default function ExplorerPage() {
  const destinations: Destination[] = Object.values(destMap);
  return (
    <div className="atlas">
      <Nav currentView="explorer" onNavigate={() => {}} />
      <ExplorerClient destinations={destinations} />
    </div>
  );
}
