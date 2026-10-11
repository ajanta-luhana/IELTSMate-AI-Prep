"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Disclaimer } from "@/components/layout/disclaimer";
import { EmptyState, LoadingBlock } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadResult } from "@/lib/result-store";
import type { PracticeKind, ScriptLine, TestResult } from "@/types/practice";
import { Transcript } from "./audio-player";

interface Stored {
  result: TestResult;
  script: ScriptLine[] | null;
}

export function ResultsPage({ kind }: { kind: PracticeKind }) {
  const [stored, setStored] = useState<Stored | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStored(loadResult<Stored>(`${kind}:result`));
    setReady(true);
  }, [kind]);

  if (!ready) return <LoadingBlock label="Loading results" />;
  if (!stored) {
    return (
      <EmptyState title="No recent results to show">
        <Button asChild className="mt-3"><Link href={`/${kind}`}>Go to {kind} tests</Link></Button>
      </EmptyState>
    );
  }

  const { result, script } = stored;
  const pct = Math.round((result.correct / result.total) * 100);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-primary/30 bg-secondary">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">{result.title}</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-5xl font-bold text-primary">{result.estimated_band.toFixed(1)}</p>
            <p className="text-sm">Estimated band</p>
          </div>
          <p className="text-lg font-medium">{result.correct} / {result.total} correct ({pct}%)</p>
        </CardContent>
      </Card>

      <section aria-label="Answer review" className="space-y-3">
        <h2 className="text-xl font-semibold">Review your answers</h2>
        {result.results.map((r, i) => (
          <Card key={r.id}>
            <CardContent className="space-y-1.5 p-4 text-sm">
              <p className="font-medium"><span aria-label={r.correct ? "Correct" : "Incorrect"} className={r.correct ? "text-success" : "text-destructive"}>{r.correct ? "✓" : "✗"}</span> {i + 1}. {r.prompt}</p>
              <p>Your answer: <span className={r.correct ? "text-success" : "text-destructive"}>{r.your_answer ?? "No answer"}</span></p>
              {!r.correct && <p>Correct answer: <strong>{r.correct_answer}</strong></p>}
              {r.explanation && <p className="text-muted-foreground">{r.explanation}</p>}
            </CardContent>
          </Card>
        ))}
      </section>

      {kind === "listening" && script && (
        <details className="rounded-2xl border bg-card p-4">
          <summary className="cursor-pointer text-sm font-medium">Show the transcript</summary>
          <div className="mt-3"><Transcript script={script} /></div>
        </details>
      )}

      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg"><Link href={`/${kind}`}>More {kind} tests</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
      </div>
      <Disclaimer />
    </div>
  );
}
