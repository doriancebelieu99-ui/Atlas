// ─── Atlas — Quiz Shell ───────────────────────────────────────────
import { useState, useCallback } from "react";
import QuizStep from "./QuizStep";
import { quizQuestions } from "@/data/quiz-questions";
import type { QuizAnswers, ViewName } from "@/lib/types";

interface QuizShellProps {
  onComplete: (answers: QuizAnswers) => void;
  onNavigate: (view: string) => void;
  disabled?: boolean;
}

export default function QuizShell({ onComplete, onNavigate, disabled }: QuizShellProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const question = quizQuestions[step];
  const total = quizQuestions.length;
  const progress = ((step + 1) / total) * 100;

  const handleAnswer = useCallback(
    (value: string | string[]) => {
      const updated = { ...answers, [question.id]: value };
      setAnswers(updated);

      if (step < total - 1) {
        setStep(step + 1);
      } else {
        onComplete(updated);
      }
    },
    [answers, question, step, total, onComplete],
  );

  const handleBack = useCallback(() => {
    if (step > 0) setStep(step - 1);
    else onNavigate("home");
  }, [step, onNavigate]);

  const handleSkip = useCallback(() => {
    if (step < total - 1) setStep(step + 1);
    else onComplete(answers);
  }, [step, total, answers, onComplete]);

  return (
    <div className={`quiz-overlay ${disabled ? "quiz-disabled" : ""}`}>
      {/* Progress bar */}
      <div
        className="quiz-progress-bar"
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Question ${step + 1} sur ${total}`}
      >
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Header */}
      <div className="quiz-header">
        <button className="quiz-back" onClick={handleBack}>
          ← {step === 0 ? "Quitter" : "Retour"}
        </button>
        <span className="quiz-counter">
          {step + 1} / {total}
        </span>
      </div>

      {/* Question */}
      <QuizStep
        key={question.id}
        question={question}
        currentAnswer={answers[question.id]}
        onAnswer={handleAnswer}
        onSkip={handleSkip}
        skipLabel={question.id === "budget" ? "Je ne sais pas encore" : "Passer"}
      />
    </div>
  );
}
