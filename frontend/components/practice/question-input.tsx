"use client";
import { cn } from "@/lib/utils";
import type { Answer, PublicQuestion } from "@/types/practice";

interface Props {
  number: number;
  question: PublicQuestion;
  value: Answer | undefined;
  onChange: (value: Answer) => void;
}

export function QuestionInput({ number, question: q, value, onChange }: Props) {
  const inputId = `q-${q.id}`;
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium leading-relaxed">
        <span className="mr-2 text-muted-foreground">{number}.</span>
        {q.prompt}
      </legend>

      {q.type === "completion" ? (
        <div className="space-y-1">
          <input
            id={inputId}
            type="text"
            maxLength={100}
            autoComplete="off"
            spellCheck={false}
            aria-label={`Answer to question ${number}`}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
            placeholder="Type your answer"
          />
          {q.hint && <p className="text-xs text-muted-foreground">{q.hint}</p>}
        </div>
      ) : (
        <div className="space-y-2" role="radiogroup" aria-label={`Choices for question ${number}`}>
          {q.options.map((opt, i) => (
            <button
              key={`${q.id}-${i}`}
              type="button"
              role="radio"
              aria-checked={value === i}
              onClick={() => onChange(i)}
              className={cn(
                "flex min-h-11 w-full items-center rounded-lg border px-4 py-2 text-left text-sm transition-colors",
                value === i ? "border-primary bg-secondary font-medium" : "bg-card hover:bg-accent",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  );
}
