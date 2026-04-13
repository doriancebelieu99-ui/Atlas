"use client";

import { useRouter } from "next/navigation";
import Nav from "@/components/layout/Nav";
import ComparatorTable from "@/components/compare/ComparatorTable";
import { buildUrl } from "@/lib/nav";
import type { Destination, ViewName } from "@/lib/types";

interface Props {
  destinations: Destination[];
  sid: string | null;
}

export default function CompareClient({ destinations, sid }: Props) {
  const router = useRouter();

  const navigate = (view: ViewName, slug?: string) => {
    router.push(buildUrl(view, slug, sid));
  };

  return (
    <div className="atlas">
      <Nav currentView="compare" onNavigate={navigate} />
      <div className="section">
        <button
          className="btn-outline btn-sm"
          onClick={() => navigate("results")}
          style={{ marginBottom: 16 }}
        >
          ← Retour aux résultats
        </button>
        <ComparatorTable destinations={destinations} onNavigate={navigate} />
      </div>
    </div>
  );
}
