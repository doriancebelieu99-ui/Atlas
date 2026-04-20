import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/destinations";
import DestinationClient from "./client";

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

  const desc =
    dest.summary.length > 155
      ? dest.summary.slice(0, dest.summary.lastIndexOf(" ", 155))
      : dest.summary;

  return {
    title: `${dest.name}, ${dest.country} — Guide de voyage | Atlas`,
    description: desc,
    openGraph: {
      title: `${dest.name} — ${dest.tagline}`,
      description: desc,
      images: [dest.image],
    },
    alternates: {
      canonical: `/destination/${slug}`,
    },
  };
}

export default async function DestinationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sid } = await searchParams;

  const dest = getDestinationBySlug(slug);

  if (!dest) {
    notFound();
  }

  return <DestinationClient dest={dest} sid={sid ?? null} />;
}
