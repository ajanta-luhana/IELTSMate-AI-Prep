"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/layout/disclaimer";
import { ErrorBlock, LoadingBlock } from "@/components/common/states";
import { LevelBadge } from "@/components/practice/level-badge";
import { api, ApiError } from "@/lib/api";
import { todaysTasks } from "@/lib/plan-today";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";
import type { StudyPlan } from "@/types/plan";

export function PlanView() {
  const { data, error, loading, reload } = useApi<StudyPlan>("/study-plan");
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [week, setWeek] = useState(0);
  const [busy, setBusy] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setPlan(data);
  }, [data]);

  async function generate() {
    setBusy(true);
    setGenError(null);
    try {
      setPlan(await api<StudyPlan>("/study-plan/generate", { method: "POST" }));
      setWeek(0);
    } catch (e) {
      setGenError(e instanceof ApiError ? e.message : "Couldn't build your plan. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingBlock label="Loading your study plan" />;
  const noPlan = error?.code === "no_plan";
  if (error && !noPlan) return <ErrorBlock error={error} onRetry={reload} />;

  if (!plan) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-bold">Your personal study plan</h1>
          <p className="text-muted-foreground">We use your level test, target band, exam date, hardest skill, daily time and practice results to plan your weeks.</p>
          {genError && <Alert variant="error">{genError}</Alert>}
          <Button size="lg" onClick={generate} disabled={busy}>{busy ? "Building your plan…" : "Create my study plan"}</Button>
          <p className="text-xs text-muted-foreground">Tip: take the <Link href="/assessment" className="text-primary underline">level test</Link> first for a better plan.</p>
        </CardContent>
      </Card>
    );
  }

  const today = todaysTasks(plan);
  const current = plan.weeks[Math.min(week, plan.weeks.length - 1)];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Your study plan</h1>
          <p className="max-w-2xl text-muted-foreground">{plan.summary}</p>
        </div>
        <Button variant="outline" onClick={generate} disabled={busy}>{busy ? "Updating…" : "Update my plan"}</Button>
      </div>
      {genError && <Alert variant="error">{genError}</Alert>}
      {plan.coach_note && <Alert variant="info"><strong>Coach: </strong>{plan.coach_note}</Alert>}

      {today && (
        <Card className="border-primary/30 bg-secondary">
          <CardHeader className="pb-2"><CardTitle>Today · {today.label}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {today.tasks.map((t, i) => (
              <Link key={i} href={t.href} className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 text-sm transition-colors hover:bg-accent">
                <span>{t.title}</span><span className="shrink-0 text-muted-foreground">{t.minutes} min</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div role="tablist" aria-label="Weeks" className="flex gap-2 overflow-x-auto pb-1">
        {plan.weeks.map((w, i) => (
          <button key={w.week} role="tab" aria-selected={week === i} type="button" onClick={() => setWeek(i)} className={cn("h-9 shrink-0 rounded-full border px-4 text-sm transition-colors", week === i ? "border-primary bg-secondary font-medium" : "bg-card hover:bg-accent")}>Week {w.week}</button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{current.focus}</h2>
        <LevelBadge level={current.level} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {current.days.map((d) => (
          <Card key={d.day}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{d.day}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {d.tasks.map((t, i) => (
                <Link key={i} href={t.href} className="block rounded-lg border p-2.5 text-sm transition-colors hover:bg-accent">
                  <span className="block">{t.title}</span>
                  <span className="text-xs text-muted-foreground">{t.minutes} min</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Plans are guidance based on estimated bands. Listen to your own pace and rest days matter too.</p>
      <Disclaimer />
    </div>
  );
}
