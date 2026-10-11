"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBlock, LoadingBlock } from "@/components/common/states";
import { useProfile } from "@/hooks/use-profile";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";
import type { Level, PracticeKind, TestSummary } from "@/types/practice";
import { LevelBadge, levelLabel } from "./level-badge";

const COPY: Record<PracticeKind, { title: string; intro: string }> = {
  reading: { title: "Reading practice", intro: "Original passages with IELTS-style questions. Marked instantly, no AI needed." },
  listening: { title: "Listening practice", intro: "Self-written conversations and talks, read aloud by your browser. Marked instantly." },
};
const FILTERS: (Level | "all")[] = ["all", "easy", "intermediate", "exam"];

export function TestList({ kind }: { kind: PracticeKind }) {
  const { data, error, loading, reload } = useApi<TestSummary[]>(`/${kind}/tests`);
  const { profile } = useProfile();
  const [filter, setFilter] = useState<Level | "all">("all");
  const [touched, setTouched] = useState(false);
  // Confidence Mode: start at the student's chosen level until they pick a filter themselves.
  useEffect(() => {
    if (profile && !touched) setFilter(profile.confidence_level);
  }, [profile, touched]);
  const tests = (data ?? []).filter((t) => filter === "all" || t.level === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{COPY[kind].title}</h1>
        <p className="text-muted-foreground">{COPY[kind].intro}</p>
        <p className="mt-1 text-sm text-muted-foreground">Confidence Mode: start with Easy, move to Intermediate, then try Exam mode when you feel ready.</p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by level">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => { setTouched(true); setFilter(f); }}
            className={cn("h-9 rounded-full border px-4 text-sm transition-colors", filter === f ? "border-primary bg-secondary font-medium" : "bg-card hover:bg-accent")}
          >
            {f === "all" ? "All levels" : levelLabel(f)}
          </button>
        ))}
      </div>

      {loading && <LoadingBlock label="Loading tests" />}
      {error && <ErrorBlock error={error} onRetry={reload} />}
      {!loading && !error && tests.length === 0 && <EmptyState title="No tests at this level yet." />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tests.map((t) => (
          <Card key={t.id}>
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center justify-between">
                <LevelBadge level={t.level} />
                <span className="text-xs text-muted-foreground">{t.minutes} min · {t.question_count} questions</span>
              </div>
              <h2 className="text-lg font-semibold leading-snug">{t.title}</h2>
              <p className="text-sm text-muted-foreground">{t.best_band === null ? "Not attempted yet" : `Best estimated band: ${t.best_band.toFixed(1)}`}</p>
              <Button asChild className="w-full"><Link href={`/${kind}/test?id=${encodeURIComponent(t.id)}`}>{t.best_band === null ? "Start" : "Practice again"}</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
