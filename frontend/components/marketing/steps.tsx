"use client";
import { useState } from "react";
import { STEPS } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

/** A real sequence, so numbers are meaningful. Click a step to read it. */
export function Steps() {
  const [active, setActive] = useState(0);
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
      <ol className="space-y-2">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              aria-current={i === active ? "step" : undefined}
              onClick={() => setActive(i)}
              className={cn("flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors", i === active ? "border-primary bg-secondary" : "bg-card hover:bg-accent")}
            >
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full font-semibold", i <= active ? "bg-primary text-primary-foreground" : "bg-muted")}>{i + 1}</span>
              <span className="font-medium">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="rounded-xl border bg-card p-6" aria-live="polite">
        <h3 className="text-xl font-semibold">{STEPS[active].title}</h3>
        <p className="mt-2 text-muted-foreground">{STEPS[active].text}</p>
      </div>
    </div>
  );
}
