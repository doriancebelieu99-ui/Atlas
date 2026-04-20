import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/destinations";
import ItineraryClient from "./client";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sid?: string }>;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) return {};

  const days = dest.itinerary?.days.length ?? 0;
  const desc = `Programme jour par jour pour visiter ${dest.name} en ${days} jours : activités, rythme, budget et conseils pratiques.`;

  return {
    title: `Itinéraire ${dest.name} · ${days} jours | Atlas`,
    description: desc,
    openGraph: {
      title: `Itinéraire ${dest.name} · ${days} jours`,
      description: `${days} jours à ${dest.name} — programme détaillé.`,
      images: [dest.image],
    },
    alternates: {
      canonical: `/itinerary/${slug}`,
    },
  };
}

export default async function ItineraryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sid } = await searchParams;

  const dest = getDestinationBySlug(slug);

  if (!dest) {
    notFound();
  }

  return <ItineraryClient dest={dest} sid={sid ?? null} />;
}
