"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ErrorBlock, LoadingBlock } from "@/components/common/states";
import { api, ApiError } from "@/lib/api";
import { saveResult } from "@/lib/result-store";
import { useApi } from "@/lib/use-api";
import type { Answer, PracticeKind, TestDetail, TestResult } from "@/types/practice";
import { AudioPlayer } from "./audio-player";
import { LevelBadge } from "./level-badge";
import { QuestionInput } from "./question-input";

export function TestRunner({ kind, testId }: { kind: PracticeKind; testId: string }) {
  const router = useRouter();
  const { data: test, error, loading, reload } = useApi<TestDetail>(`/${kind}/tests/${encodeURIComponent(testId)}`);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (loading) return <LoadingBlock label="Loading test" />;
  if (error || !test) return <ErrorBlock error={error ?? { message: "Couldn't load this test." }} onRetry={reload} />;

  const answered = test.questions.filter((q) => {
    const a = answers[q.id];
    return a !== undefined && a !== "";
  }).length;

  async function submit() {
    if (!test) return;
    setSubmitting(true);
    setSubmitError(null);
    const cleaned: Record<string, Answer> = {};
    for (const [id, value] of Object.entries(answers)) {
      if (value !== "") cleaned[id] = typeof value === "string" ? value.trim() : value;
    }
    try {
      const result = await api<TestResult>(`/${kind}/submit`, { method: "POST", body: JSON.stringify({ test_id: test.id, answers: cleaned }) });
      saveResult(`${kind}:result`, { result, script: test.script });
      router.push(`/${kind}/results`);
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : "Something went wrong. Your answers are still here, so try again.");
      setSubmitting(false);
    }
  }

  const list = (
    <div className="space-y-6">
      {test.questions.map((q, i) => (
        <QuestionInput key={q.id} number={i + 1} question={q} value={answers[q.id]} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/${kind}`} className="text-sm text-primary hover:underline">← All {kind} tests</Link>
          <h1 className="mt-1 text-2xl font-bold">{test.title}</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LevelBadge level={test.level} />
          <span>Suggested time: {test.minutes} min</span>
        </div>
      </div>

      {kind === "listening" && test.script && <AudioPlayer script={test.script} level={test.level} />}

      {kind === "reading" && test.passage ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="whitespace-pre-line rounded-2xl border bg-card p-5 text-[15px] leading-relaxed lg:sticky lg:top-4 lg:max-h-[80vh] lg:overflow-y-auto" aria-label="Reading passage">
            {test.passage}
          </article>
          {list}
        </div>
      ) : (
        list
      )}

      {submitError && <Alert variant="error">{submitError}</Alert>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">{answered} of {test.questions.length} answered</p>
        <Button size="lg" onClick={submit} disabled={submitting}>{submitting ? "Marking…" : "Submit answers"}</Button>
      </div>
    </div>
  );
}
