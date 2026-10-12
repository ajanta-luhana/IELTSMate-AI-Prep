"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LEVELS } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

const DETAIL = [
  "Short prompts, hints switched on, and gentle feedback. Good for the first week.",
  "Longer answers and less common topics. Hints stay, but you work more on your own.",
  "Full IELTS-style tasks with real timing and no hints. Use it once you feel ready.",
];

export function ConfidencePicker() {
  const [i, setI] = useState(0);
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
      <div role="radiogroup" aria-label="Confidence level" className="space-y-2">
        {LEVELS.map((l, idx) => (
          <button
            key={l.name}
            type="button"
            role="radio"
            aria-checked={idx === i}
            onClick={() => setI(idx)}
            className={cn("flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors", idx === i ? "border-primary bg-secondary" : "bg-card hover:bg-accent")}
          >
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold", idx === i ? "bg-primary text-primary-foreground" : "bg-muted")}>{idx + 1}</span>
            <span><span className="block font-medium">{l.name}</span><span className="block text-sm text-muted-foreground">{l.text}</span></span>
          </button>
        ))}
      </div>
      <div className="flex flex-col justify-between rounded-xl border bg-card p-6">
        <div>
          <h3 className="text-xl font-semibold">{LEVELS[i].name}</h3>
          <p className="mt-2 text-muted-foreground">{DETAIL[i]}</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((i + 1) / LEVELS.length) * 100}%` }} />
          </div>
        </div>
        <Button className="mt-6 self-start" asChild><Link href="/signup">Start at {LEVELS[i].name.toLowerCase()}</Link></Button>
      </div>
    </div>
  );
}
