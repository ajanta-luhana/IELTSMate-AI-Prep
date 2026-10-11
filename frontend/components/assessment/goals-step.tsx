"use client";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Goals } from "@/types/assessment";
import type { Skill } from "@/types/profile";

const BANDS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];
const SKILLS: { value: Skill; label: string }[] = [
  { value: "speaking", label: "Speaking" },
  { value: "writing", label: "Writing" },
  { value: "reading", label: "Reading" },
  { value: "listening", label: "Listening" },
];

export function GoalsStep({ loading, onSubmit }: { loading: boolean; onSubmit: (g: Goals) => void }) {
  const [target, setTarget] = useState<number>(7);
  const [examDate, setExamDate] = useState("");
  const [skill, setSkill] = useState<Skill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!skill) return setError("Pick the skill you find hardest.");
    if (examDate && examDate < today) return setError("Exam date can't be in the past.");
    setError(null);
    onSubmit({ target_band: target, exam_date: examDate || null, hardest_skill: skill });
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <div>
        <h1 className="text-2xl font-bold">Let&apos;s find your starting point</h1>
        <p className="text-sm text-muted-foreground">Three quick questions, then a short check of about 17 questions. No pressure — this is just practice.</p>
      </div>
      {error && <Alert variant="error">{error}</Alert>}

      <div className="space-y-2">
        <label htmlFor="target" className="text-sm font-medium">Your target band</label>
        <select id="target" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm">
          {BANDS.map((b) => <option key={b} value={b}>{b.toFixed(1)}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="exam" className="text-sm font-medium">Exam date <span className="font-normal text-muted-foreground">(optional)</span></label>
        <input id="exam" type="date" min={today} value={examDate} onChange={(e) => setExamDate(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm" />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Which skill feels hardest?</legend>
        <div className="grid grid-cols-2 gap-2">
          {SKILLS.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={skill === s.value}
              onClick={() => setSkill(s.value)}
              className={cn("h-12 rounded-lg border text-sm font-medium transition-colors", skill === s.value ? "border-primary bg-secondary text-secondary-foreground" : "bg-card hover:bg-accent")}
            >
              {s.label}
            </button>
          ))}
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Loading questions…" : "Start the check"}</Button>
    </form>
  );
}
