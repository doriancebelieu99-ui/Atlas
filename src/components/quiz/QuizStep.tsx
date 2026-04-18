// ─── Atlas — Quiz Step ────────────────────────────────────────────
import { useState, useCallback } from "react";
import type { QuizQuestion } from "@/lib/types";

interface QuizStepProps {
  question: QuizQuestion;
  currentAnswer: string | string[] | undefined;
  onAnswer: (value: string | string[]) => void;
  onSkip?: () => void;
  skipLabel?: string;
}

export default function QuizStep({ question, currentAnswer, onAnswer, onSkip, skipLabel }: QuizStepProps) {
  const [multiSelection, setMultiSelection] = useState<string[]>(
    Array.isArray(currentAnswer) ? currentAnswer : [],
  );

  const handleSingleSelect = useCallback(
    (value: string) => {
      onAnswer(value);
    },
    [onAnswer],
  );

  const handleMultiToggle = useCallback(
    (value: string) => {
      setMultiSelection((prev) => {
        const exists = prev.includes(value);
        if (exists) return prev.filter((v) => v !== value);
        if (question.maxSelect && prev.length >= question.maxSelect) return prev;
        return [...prev, value];
      });
    },
    [question.maxSelect],
  );

  const handleMultiConfirm = useCallback(() => {
    if (multiSelection.length > 0) {
      onAnswer(multiSelection);
    }
  }, [multiSelection, onAnswer]);

  return (
    <div className="quiz-step">
      <h2 className="quiz-title">{question.title}</h2>
      <p className="quiz-subtitle">{question.subtitle}</p>

      <div className="quiz-options">
        {question.options.map((opt) => {
          const isSelected = question.multi
            ? multiSelection.includes(opt.value)
            : currentAnswer === opt.value;

          return (
            <button
              key={opt.value}
              className={`quiz-option ${isSelected ? "selected" : ""}`}
              onClick={() =>
                question.multi
                  ? handleMultiToggle(opt.value)
                  : handleSingleSelect(opt.value)
              }
            >
              <span className="quiz-option-icon">{opt.icon}</span>
              <span className="quiz-option-label">{opt.label}</span>
              {opt.description && (
                <span className="quiz-option-desc">{opt.description}</span>
              )}
            </button>
          );
        })}
      </div>

      {onSkip && (
        <button className="quiz-skip" onClick={onSkip}>
          {skipLabel ?? "Passer"}
        </button>
      )}

      {question.multi && (
        <button
          className="quiz-confirm"
          onClick={handleMultiConfirm}
          disabled={multiSelection.length === 0}
        >
          Valider ({multiSelection.length})
        </button>
      )}
    </div>
  );
}
