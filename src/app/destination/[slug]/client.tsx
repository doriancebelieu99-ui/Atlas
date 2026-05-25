"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/layout/Nav";
import FicheHero from "@/components/destination/FicheHero";
import TabNav from "@/components/ui/TabNav";
import {
  TabResume,
  TabBudget,
  TabSeason,
  TabContext,
  TabSafety,
  TabCities,
} from "@/components/destination/TabPanels";
import { buildUrl } from "@/lib/nav";
import type { Destination, ViewName } from "@/lib/types";

const TABS = [
  { id: "resume", label: "Résumé" },
  { id: "budget", label: "Budget" },
  { id: "season", label: "Saison" },
  { id: "context", label: "Contexte" },
  { id: "safety", label: "Sécurité" },
  { id: "cities", label: "Lieux" },
];

interface Props {
  dest: Destination;
  sid: string | null;
}

export default function DestinationClient({ dest, sid }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("resume");

  const navigate = (view: ViewName, slug?: string) => {
    router.push(buildUrl(view, slug ?? dest.slug, sid));
  };

  return (
    <div className="atlas">
      <Nav currentView="destination" onNavigate={navigate} />
      <FicheHero dest={dest} />

      {dest.itinerary && (
        <div className="fiche-itin-strip">
          <div className="fiche-itin-strip-info">
            <div className="fiche-itin-strip-label">Plan de séjour</div>
            <div className="fiche-itin-strip-title">
              Itinéraire · {dest.itinerary.days.length} jour{dest.itinerary.days.length > 1 ? "s" : ""}
            </div>
            <div className="fiche-itin-strip-days">
              {dest.itinerary.days.map((d) => (
                <span key={d.number} className="fiche-itin-day-chip">
                  J{d.number} · {d.zone}
                </span>
              ))}
            </div>
          </div>
          <button
            className="fiche-itin-strip-cta"
            onClick={() => navigate("itinerary", dest.slug)}
          >
            Voir l'itinéraire →
          </button>
        </div>
      )}

      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div
        className="tab-content"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "resume" && <TabResume dest={dest} />}
        {activeTab === "budget" && <TabBudget dest={dest} />}
        {activeTab === "season" && <TabSeason dest={dest} />}
        {activeTab === "context" && <TabContext dest={dest} />}
        {activeTab === "safety" && <TabSafety dest={dest} />}
        {activeTab === "cities" && <TabCities dest={dest} />}
      </div>
      <div className="fiche-actions">
        <button className="btn-outline" onClick={() => navigate("results")}>
          ← Retour aux résultats
        </button>
      </div>
    </div>
  );
}
