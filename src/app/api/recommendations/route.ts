import { NextRequest, NextResponse } from "next/server";
import { getAllDestinations } from "@/lib/destinations";
import { rankDestinations, quizAnswersToPreferences } from "@/lib/scoring";
import { createSession } from "@/lib/sessions";
import type { QuizAnswers } from "@/lib/types";

// ─── Validation ───────────────────────────────────────────────────

const VALID_VALUES: Record<string, string[]> = {
  budget: ["low", "medium", "high", "premium"],
  duration: ["short", "week", "long", "extended"],
  period: ["spring", "summer", "autumn", "winter"],
  group: ["solo", "couple", "friends", "family"],
  pace: ["relaxed", "balanced", "dense"],
};

const VALID_INTERESTS = [
  "architecture", "food", "history", "nightlife", "nature", "art",
];

const VALID_STYLES = [
  "authentic_local", "culture_patrimoine", "food_artdevivre",
  "energie_urbaine", "calme_contemplation", "nature_grand_air",
];

function validateAnswers(
  body: unknown,
): { valid: true; answers: QuizAnswers } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Le corps de la requête doit être un objet JSON." };
  }

  const answers = body as Record<string, unknown>;

  if (!answers.budget || !VALID_VALUES.budget.includes(answers.budget as string)) {
    return { valid: false, error: "Champ 'budget' manquant ou invalide." };
  }

  for (const field of ["duration", "period", "group", "pace"] as const) {
    const val = answers[field];
    if (val !== undefined && val !== null) {
      if (typeof val !== "string" || !VALID_VALUES[field].includes(val)) {
        return { valid: false, error: `Champ '${field}' invalide: ${val}` };
      }
    }
  }

  if (answers.styles !== undefined) {
    if (!Array.isArray(answers.styles)) {
      return { valid: false, error: "'styles' doit être un tableau." };
    }
    if (answers.styles.length > 2) {
      return { valid: false, error: "'styles' : 2 maximum." };
    }
    for (const style of answers.styles) {
      if (typeof style !== "string" || !VALID_STYLES.includes(style)) {
        return { valid: false, error: `Style invalide: ${style}` };
      }
    }
  }

  if (answers.interests !== undefined) {
    if (!Array.isArray(answers.interests)) {
      return { valid: false, error: "'interests' doit être un tableau." };
    }
    if (answers.interests.length > 3) {
      return { valid: false, error: "'interests' : 3 maximum." };
    }
    for (const interest of answers.interests) {
      if (typeof interest !== "string" || !VALID_INTERESTS.includes(interest)) {
        return { valid: false, error: `Intérêt invalide: ${interest}` };
      }
    }
  }

  return { valid: true, answers: answers as QuizAnswers };
}

// ─── Handler ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const validation = validateAnswers(body);

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 422 });
  }

  const preferences = quizAnswersToPreferences(validation.answers);
  const results = rankDestinations(preferences, getAllDestinations());

  // Persist session in SQLite
  const sessionId = await createSession(validation.answers, preferences, results);

  return NextResponse.json({ sessionId });
}
