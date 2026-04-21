"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import type { Destination } from "@/lib/types";

interface GlobePoint {
  lat: number;
  lng: number;
  slug: string;
  name: string;
  country: string;
  image: string;
}

interface GlobeExplorerProps {
  destinations: Destination[];
}

export default function GlobeExplorer({ destinations }: GlobeExplorerProps) {
  const globeRef = useRef<GlobeMethods>(null!);
  const router = useRouter();
  const [hovered, setHovered] = useState<GlobePoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(680);

  const points: GlobePoint[] = destinations.map((d) => ({
    lat: d.coordinates.lat,
    lng: d.coordinates.lng,
    slug: d.slug,
    name: d.name,
    country: d.country,
    image: d.image,
  }));

  // Responsive size
  useEffect(() => {
    const update = () => setSize(Math.min(680, window.innerWidth * 0.9));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Enable auto-rotate once globe is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      if (globeRef.current) {
        globeRef.current.controls().autoRotate = true;
        globeRef.current.controls().autoRotateSpeed = 0.4;
        globeRef.current.controls().enableDamping = true;
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="globe-wrapper" onMouseMove={handleMouseMove}>
      <Globe
        ref={globeRef}
        width={size}
        height={size}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "#C9A84C"}
        pointRadius={0.6}
        pointAltitude={0.012}
        onPointHover={(point) => setHovered(point as GlobePoint | null)}
        onPointClick={(point) => {
          const p = point as GlobePoint;
          if (p?.slug) router.push(`/destination/${p.slug}`);
        }}
      />
      {hovered && (
        <div
          className="globe-tooltip"
          style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 56 }}
        >
          <img
            src={hovered.image}
            alt={hovered.name}
            className="globe-tooltip-img"
          />
          <div className="globe-tooltip-text">
            <span className="globe-tooltip-name">{hovered.name}</span>
            <span className="globe-tooltip-country">{hovered.country}</span>
          </div>
        </div>
      )}
    </div>
  );
}
