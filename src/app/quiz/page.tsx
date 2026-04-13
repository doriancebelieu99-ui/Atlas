"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import QuizShell from "@/components/quiz/QuizShell";
import type { QuizAnswers } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = useCallback(
    async (answers: QuizAnswers) => {
      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(answers),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Erreur serveur (${res.status})`);
        }

        const { sessionId } = await res.json();
        router.push(`/results?sid=${sessionId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inattendue.");
        setSubmitting(false);
      }
    },
    [router],
  );

  const handleNavigate = useCallback(
    (view: string) => {
      router.push(view === "home" ? "/" : `/${view}`);
    },
    [router],
  );

  return (
    <>
      <QuizShell
        onComplete={handleComplete}
        onNavigate={handleNavigate}
        disabled={submitting}
      />
      {submitting && (
        <div className="quiz-loading">
          <div className="quiz-loading-inner">Analyse en cours...</div>
        </div>
      )}
      {error && (
        <div className="quiz-error">
          <p>{error}</p>
          <button className="btn-primary" onClick={() => setError(null)}>
            Réessayer
          </button>
        </div>
      )}
    </>
  );
}
