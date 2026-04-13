import { redirect } from "next/navigation";
import { getDestinationsBySlugs } from "@/lib/destinations";
import CompareClient from "./client";

interface Props {
  searchParams: Promise<{ slugs?: string; sid?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const slugsParam = params.slugs ?? "";
  const sid = params.sid ?? null;
  const slugs = slugsParam.split(",").filter(Boolean);

  if (slugs.length < 2) {
    redirect("/quiz");
  }

  const destinations = getDestinationsBySlugs(slugs);

  if (destinations.length < 2) {
    redirect("/quiz");
  }

  return <CompareClient destinations={destinations} sid={sid} />;
}
