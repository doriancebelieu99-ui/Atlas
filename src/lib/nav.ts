// ─── Atlas — Navigation URL builder ───────────────────────────────
// Single source of truth for route construction with sid propagation.

import type { ViewName } from "./types";

export function buildUrl(view: ViewName, slug?: string, sid?: string | null): string {
  const s = sid ? `sid=${sid}` : "";

  switch (view) {
    case "home":
      return "/";
    case "quiz":
      return "/quiz";
    case "results":
      return s ? `/results?${s}` : "/quiz";
    case "destination":
      return s ? `/destination/${slug}?${s}` : `/destination/${slug}`;
    case "itinerary":
      return s ? `/itinerary/${slug}?${s}` : `/itinerary/${slug}`;
    case "compare":
      return s ? `/compare?slugs=${slug}&${s}` : `/compare?slugs=${slug}`;
    default:
      return "/";
  }
}
