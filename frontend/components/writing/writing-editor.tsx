"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorBlock, LoadingBlock } from "@/components/common/states";
import { api, ApiError } from "@/lib/api";
import { loadResult, saveResult } from "@/lib/result-store";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";
import { MIN_WORDS, SAMPLE_PROMPTS, TASK_LABELS } from "@/lib/writing-samples";
import type { WritingResult, WritingTask } from "@/types/writing";

const TASKS: WritingTask[] = ["task2", "general_task1", "academic_task1"];
const DRAFT_KEY = "writing:draft";
interface Draft {
  task: WritingTask;
  prompt: string;
  essay: string;
}

const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export function WritingEditor() {
  const router = useRouter();
  const history = useApi<WritingResult[]>("/writing/history");
  const [task, setTask] = useState<WritingTask>("task2");
  const [prompt, setPrompt] = useState("");
  const [essay, setEssay] = useState("");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const restored = useRef(false);

  // Restore an unsent draft (e.g. after a failed attempt or accidental refresh).
  useEffect(() => {
    const d = loadResult<Draft>(DRAFT_KEY);
    if (d) {
      setTask(d.task);
      setPrompt(d.prompt);
      setEssay(d.essay);
    }
    restored.current = true;
  }, []);
  useEffect(() => {
    if (restored.current) saveResult(DRAFT_KEY, { task, prompt, essay } satisfies Draft);
  }, [task, prompt, essay]);

  useEffect(() => {
    if (!busy) return;
    setSeconds(0);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  const words = countWords(essay);
  const min = MIN_WORDS[task];

  function fillSample() {
    const list = SAMPLE_PROMPTS[task];
    setPrompt(list[Math.floor(Math.random() * list.length)]);
  }

  async function submit() {
    setError(null);
    if (words === 0) return setError("Please write or paste your answer first.");
    setBusy(true);
    try {
      const result = await api<WritingResult>("/writing/evaluate", {
        method: "POST",
        body: JSON.stringify({ task_type: task, prompt: prompt.trim() || null, essay }),
      });
      saveResult("writing:result", result);
      saveResult(DRAFT_KEY, null);
      router.push("/writing/results");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Your answer is still here, so try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Writing Coach</h1>
        <p className="text-muted-foreground">Write or paste your answer and get an estimated band with friendly, specific feedback.</p>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div role="group" aria-label="Task type" className="flex flex-wrap gap-2">
            {TASKS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={task === t}
                disabled={busy}
                onClick={() => setTask(t)}
                className={cn("h-10 rounded-full border px-4 text-sm transition-colors", task === t ? "border-primary bg-secondary font-medium" : "bg-card hover:bg-accent")}
              >
                {TASK_LABELS[t]}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="wq" className="text-sm font-medium">Question <span className="font-normal text-muted-foreground">(optional, but gives better feedback)</span></label>
              <Button type="button" variant="ghost" size="sm" onClick={fillSample} disabled={busy}>Use a sample question</Button>
            </div>
            <textarea id="wq" rows={3} maxLength={800} value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={busy} className="w-full rounded-lg border border-input bg-card p-3 text-sm" placeholder="Paste the question here" />
          </div>

          <div className="space-y-2">
            <label htmlFor="we" className="text-sm font-medium">Your answer</label>
            <textarea id="we" rows={14} maxLength={10000} value={essay} onChange={(e) => setEssay(e.target.value)} disabled={busy} className="w-full rounded-lg border border-input bg-card p-3 text-sm leading-relaxed" placeholder="Start writing here…" />
            <p className={cn("text-sm", words >= min ? "text-success" : "text-muted-foreground")} aria-live="polite">
              {words} words {words >= min ? "(minimum reached)" : `(aim for at least ${min})`}
            </p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}
          {busy && (
            <Alert variant="info">
              Your coach is reading your answer… {seconds}s. A small AI model running on your own computer can take a minute or two. Please keep this page open.
            </Alert>
          )}
          <Button size="lg" className="w-full sm:w-auto" onClick={submit} disabled={busy}>{busy ? "Evaluating…" : "Get feedback"}</Button>
        </CardContent>
      </Card>

      <section aria-label="Past answers" className="space-y-3">
        <h2 className="text-xl font-semibold">Your past answers</h2>
        {history.loading && <LoadingBlock label="Loading history" />}
        {history.error && <ErrorBlock error={history.error} onRetry={history.reload} />}
        {!history.loading && !history.error && (history.data ?? []).length === 0 && <EmptyState title="Nothing yet. Your first piece of feedback will appear here." />}
        <div className="grid gap-3 sm:grid-cols-2">
          {(history.data ?? []).slice(0, 6).map((h) => (
            <Link key={h.id ?? h.created_at} href={`/writing/results?id=${encodeURIComponent(h.id ?? "")}`} className="rounded-2xl border bg-card p-4 transition-colors hover:bg-accent">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{TASK_LABELS[h.task_type]}</span>
                <span className="text-lg font-bold text-primary">{h.overall_score.toFixed(1)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{h.word_count} words{h.created_at ? ` · ${new Date(h.created_at).toLocaleDateString()}` : ""}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
