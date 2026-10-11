"use client";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AssessmentQuestion } from "@/types/assessment";

const SECTION_LABEL = { grammar: "Grammar", vocabulary: "Vocabulary", reading: "Reading" } as const;

interface Props {
  questions: AssessmentQuestion[];
  passages: Record<string, string>;
  submitting: boolean;
  error: string | null;
  onFinish: (answers: Record<string, number | null>) => void;
}

export function QuestionStep({ questions, passages, submitting, error, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const q = questions[index];
  const last = index === questions.length - 1;
  const chosen = answers[q.id];

  function next() {
    if (last) onFinish(answers);
    else setIndex((i) => i + 1);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{SECTION_LABEL[q.section]}</span>
          <span>{index + 1} / {questions.length}</span>
        </div>
        <Progress value={(index / questions.length) * 100} label="Level test progress" />
      </div>

      {q.passage_id && passages[q.passage_id] && (
        <div className="max-h-56 overflow-y-auto rounded-xl bg-muted p-4 text-sm leading-relaxed">{passages[q.passage_id]}</div>
      )}

      <h2 className="text-lg font-semibold">{q.prompt}</h2>
      {error && <Alert variant="error">{error}</Alert>}

      <div className="space-y-2" role="radiogroup" aria-label="Answer choices">
        {q.options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={chosen === i}
            onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
            className={cn("flex min-h-12 w-full items-center rounded-lg border px-4 py-2 text-left text-sm transition-colors", chosen === i ? "border-primary bg-secondary font-medium" : "bg-card hover:bg-accent")}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="ghost" disabled={index === 0 || submitting} onClick={() => setIndex((i) => i - 1)}>Back</Button>
        <Button type="button" onClick={next} disabled={submitting}>
          {submitting ? "Scoring…" : last ? "Finish" : chosen === undefined ? "Skip" : "Next"}
        </Button>
      </div>
    </div>
  );
}
