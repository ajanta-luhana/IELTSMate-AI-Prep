"use client";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const QUESTION = {
  prompt: "Choose the sentence that is grammatically correct.",
  options: [
    "If I would have more time, I would study every day.",
    "If I had more time, I would study every day.",
    "If I will have more time, I would study every day.",
  ],
  answer: 1,
  why: "In a second conditional, use the past simple after \"if\" and \"would\" in the main clause.",
};

/** Hero demo: one real question with instant feedback, no sign-up needed. */
export function TryQuestion() {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;
  const right = picked === QUESTION.answer;

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-[0_20px_50px_-20px_rgba(30,41,120,0.35)]">
      <p className="text-sm font-medium text-muted-foreground">Try a question now</p>
      <h2 className="mt-1 text-lg font-semibold">{QUESTION.prompt}</h2>
      <ul className="mt-4 space-y-2">
        {QUESTION.options.map((o, i) => {
          const isAnswer = done && i === QUESTION.answer;
          const isWrongPick = done && i === picked && !right;
          return (
            <li key={o}>
              <button
                type="button"
                disabled={done}
                onClick={() => setPicked(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                  !done && "hover:border-primary hover:bg-accent",
                  isAnswer && "border-success bg-success/10",
                  isWrongPick && "border-destructive bg-destructive/10",
                )}
              >
                <span>{o}</span>
                {isAnswer && <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-label="Correct answer" />}
                {isWrongPick && <XCircle className="h-5 w-5 shrink-0 text-destructive" aria-label="Your answer, incorrect" />}
              </button>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite" className="mt-4 min-h-12 text-sm">
        {done && (
          <>
            <p className="font-medium">{right ? "Correct." : "Not quite."}</p>
            <p className="text-muted-foreground">{QUESTION.why}</p>
            <button type="button" onClick={() => setPicked(null)} className="mt-2 text-primary hover:underline">Try again</button>
          </>
        )}
      </div>
    </div>
  );
}
