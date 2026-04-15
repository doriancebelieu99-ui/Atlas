import { redirect } from "next/navigation";
import { loadResultsData } from "@/lib/results";
import ResultsPageClient from "./client";

interface ResultsPageProps {
  searchParams: {
    sid?: string;
  };
}

export default async function ResultsPage({
  searchParams,
}: ResultsPageProps) {
  const outcome = await loadResultsData(searchParams.sid);

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