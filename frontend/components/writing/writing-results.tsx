"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Disclaimer } from "@/components/layout/disclaimer";
import { EmptyState, ErrorBlock, LoadingBlock } from "@/components/common/states";
import { loadResult } from "@/lib/result-store";
import { useApi } from "@/lib/use-api";
import { TASK_LABELS } from "@/lib/writing-samples";
import type { WritingResult } from "@/types/writing";

export function WritingResults() {
  const id = useSearchParams().get("id");
  const history = useApi<WritingResult[]>(id ? "/writing/history" : null);
  const [stored, setStored] = useState<WritingResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStored(loadResult<WritingResult>("writing:result"));
    setReady(true);
  }, []);

  if (id) {
    if (history.loading) return <LoadingBlock label="Loading feedback" />;
    if (history.error) return <ErrorBlock error={history.error} onRetry={history.reload} />;
    const found = (history.data ?? []).find((h) => h.id === id);
    return found ? <View r={found} /> : <None />;
  }
  if (!ready) return <LoadingBlock label="Loading feedback" />;
  return stored ? <View r={stored} /> : <None />;
}

function None() {
  return (
    <EmptyState title="No feedback to show">
      <Button asChild className="mt-3"><Link href="/writing">Write an answer</Link></Button>
    </EmptyState>
  );
}

const CRITERIA: { key: "task_response" | "coherence" | "vocabulary" | "grammar"; label: string }[] = [
  { key: "task_response", label: "Task Response" },
  { key: "coherence", label: "Coherence & Cohesion" },
  { key: "vocabulary", label: "Lexical Resource" },
  { key: "grammar", label: "Grammatical Range & Accuracy" },
];

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          {items.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </CardContent>
    </Card>
  );
}

function View({ r }: { r: WritingResult }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-primary/30 bg-secondary">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">{TASK_LABELS[r.task_type]} · {r.word_count} words</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-5xl font-bold text-primary">{r.overall_score.toFixed(1)}</p>
          <p className="text-sm font-medium">Estimated band</p>
          <p className="text-sm">{r.summary}</p>
        </CardContent>
      </Card>

      {r.note && <Alert variant="warning">{r.note}</Alert>}

      <Card>
        <CardHeader><CardTitle>Your four criteria</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {CRITERIA.map((c) => (
            <div key={c.key} className="space-y-1.5">
              <div className="flex justify-between text-sm"><span className="font-medium">{c.label}</span><span>{r[c.key].toFixed(1)}</span></div>
              <Progress value={(r[c.key] / 9) * 100} label={`${c.label} estimated band`} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <List title="What went well" items={r.strengths} />
        <List title="What to improve" items={r.improvements} />
      </div>

      {r.sentence_fixes.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Sentences to polish</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {r.sentence_fixes.map((f, i) => (
              <div key={i} className="space-y-1 text-sm">
                <p className="rounded-lg bg-destructive/10 p-2"><span className="font-medium">Yours: </span>{f.original}</p>
                <p className="rounded-lg bg-success/10 p-2"><span className="font-medium">Better: </span>{f.improved}</p>
                <p className="text-muted-foreground">{f.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {r.vocabulary_upgrades.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Vocabulary upgrades</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {r.vocabulary_upgrades.map((v, i) => <li key={i}><span className="text-muted-foreground">{v.original}</span> → <strong>{v.better}</strong></li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      <List title="Steps to reach the next band" items={r.next_band_steps} />

      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg"><Link href="/writing">Write another</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
      </div>
      <p className="text-xs text-muted-foreground">Feedback is written by an AI model and can make mistakes. Use it as a guide, not a final verdict.</p>
      <Disclaimer />
    </div>
  );
}
