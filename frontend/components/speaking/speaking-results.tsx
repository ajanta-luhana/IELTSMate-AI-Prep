"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Disclaimer } from "@/components/layout/disclaimer";
import { EmptyState, ErrorBlock, LoadingBlock } from "@/components/common/states";
import { useApi } from "@/lib/use-api";
import type { SpeakingResult } from "@/types/speaking";
import { FeedbackCard } from "./feedback-card";

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const round = (x: number) => Math.floor(x * 2 + 0.5) / 2;

function Row({ r, open }: { r: SpeakingResult; open?: boolean }) {
  return (
    <details open={open} className="rounded-2xl border bg-card p-4">
      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm">
        <span className="font-medium">Part {r.part}: {r.question}</span>
        <span className="shrink-0 text-lg font-bold text-primary">{r.overall_score.toFixed(1)}</span>
      </summary>
      <div className="mt-4"><FeedbackCard r={r} /></div>
    </details>
  );
}

export function SpeakingResults() {
  const n = Math.max(0, Number(useSearchParams().get("n") ?? 0) || 0);
  const { data, error, loading, reload } = useApi<SpeakingResult[]>("/speaking/history");

  if (loading) return <LoadingBlock label="Loading your results" />;
  if (error) return <ErrorBlock error={error} onRetry={reload} />;
  const all = data ?? [];
  if (all.length === 0) {
    return (
      <EmptyState title="No speaking answers yet">
        <Button asChild className="mt-3"><Link href="/speaking">Start speaking practice</Link></Button>
      </EmptyState>
    );
  }
  const run = all.slice(0, n); // history is newest first
  const earlier = all.slice(n, n + 10);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {run.length > 0 && (
        <>
          <Card className="border-primary/30 bg-secondary">
            <CardContent className="space-y-1 p-6">
              <p className="text-sm text-muted-foreground">This session · {run.length} answer{run.length === 1 ? "" : "s"}</p>
              <p className="text-5xl font-bold text-primary">{round(avg(run.map((r) => r.overall_score))).toFixed(1)}</p>
              <p className="text-sm font-medium">Estimated band</p>
              <p className="pt-1 text-sm">
                Fluency {round(avg(run.map((r) => r.fluency))).toFixed(1)} · Coherence {round(avg(run.map((r) => r.coherence))).toFixed(1)} · Vocabulary {round(avg(run.map((r) => r.vocabulary))).toFixed(1)} · Grammar {round(avg(run.map((r) => r.grammar))).toFixed(1)}
              </p>
            </CardContent>
          </Card>
          <section className="space-y-3" aria-label="This session">
            <h2 className="text-xl font-semibold">Your answers</h2>
            {run.map((r, i) => <Row key={r.id ?? i} r={r} open={run.length === 1} />)}
          </section>
        </>
      )}
      {earlier.length > 0 && (
        <section className="space-y-3" aria-label="Earlier answers">
          <h2 className="text-xl font-semibold">{run.length > 0 ? "Earlier answers" : "Your recent answers"}</h2>
          {earlier.map((r, i) => <Row key={r.id ?? i} r={r} />)}
        </section>
      )}
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg"><Link href="/speaking">Practise again</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
      </div>
      <Disclaimer />
    </div>
  );
}
