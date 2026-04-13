"use client";

import { useRouter } from "next/navigation";
import Nav from "@/components/layout/Nav";
import ResultsList from "@/components/results/ResultsList";
import { buildUrl } from "@/lib/nav";
import type { QuizAnswers, DestinationScoreResult, ViewName } from "@/lib/types";

interface Props {
  results: DestinationScoreResult[];
  answers: QuizAnswers;
  sid: string;
}

export default function ResultsPageClient({ results, answers, sid }: Props) {
  const router = useRouter();

  const navigate = (view: ViewName, slug?: string) => {
    router.push(buildUrl(view, slug, sid));
  };

  return (
    <div className="atlas">
      <Nav currentView="results" onNavigate={navigate} />
      <ResultsList results={results} answers={answers} onNavigate={navigate} />
    </div>
  );
}
