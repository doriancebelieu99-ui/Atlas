import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/destinations";
import ItineraryClient from "./client";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sid?: string }>;
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
