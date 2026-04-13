import { redirect } from "next/navigation";
import { loadResultsData } from "@/lib/results";
import ResultsPageClient from "./client";

interface ResultsPageProps {
  searchParams: Promise<{ sid?: string }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const outcome = loadResultsData(params.sid);

  if (!outcome.ok) {
    redirect("/quiz");
  }

  return (
    <ResultsPageClient
      results={outcome.session.results}
      answers={outcome.session.answers}
      sid={outcome.session.id}
    />
  );
}
