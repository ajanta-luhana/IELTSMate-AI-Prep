"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBlock } from "@/components/common/states";
import { useProfile } from "@/hooks/use-profile";
import { useApi } from "@/lib/use-api";
import { todaysTasks } from "@/lib/plan-today";
import type { ProgressData } from "@/types/progress";
import type { StudyPlan } from "@/types/plan";

const fmt = (n: number | null | undefined) => (n === null || n === undefined ? "—" : n.toFixed(1));

const SKILL_LINKS: Record<string, string> = {
  reading: "/reading",
  listening: "/listening",
  speaking: "/speaking",
  writing: "/writing",
};

function Kpi({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums">
          {value}
          {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
        </p>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview() {
  const { profile, error, loading, reload } = useProfile();
  const progress = useApi<ProgressData>("/progress");
  const plan = useApi<StudyPlan | null>("/study-plan");

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3" aria-busy="true" aria-label="Loading your dashboard">
        {[0, 1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)}
      </div>
    );
  }
  if (error || !profile) return <ErrorBlock error={error ?? { message: "Couldn't load your profile." }} onRetry={reload} />;

  const p = progress.data;
  const firstName = profile.name.split(" ")[0] || "there";
  const current = p?.current_band ?? profile.current_band;
  const target = p?.target_band ?? profile.target_band;
  const today = plan.data ? todaysTasks(plan.data) : null;
  const goalPct = current !== null && target !== null && target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-gradient-to-r from-sidebar to-primary p-6 text-white sm:p-8">
        <p className="text-sm text-white/70">{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Welcome back, {firstName}</h1>
        <p className="mt-1 max-w-xl text-sm text-white/80">
          {p?.practiced_today ? "You have practised today. Great work, keep the streak alive." : "Small steps every day. A short session today keeps your streak going."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm"><Link href={today?.tasks[0]?.href ?? "/assessment"}>{today ? "Start today's practice" : "Take level test"}</Link></Button>
          <Button asChild size="sm" className="bg-white/15 hover:bg-white/25"><Link href="/progress">View progress</Link></Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Estimated current band" value={fmt(current)} />
        <Kpi label="Target band" value={fmt(target)} />
        <Kpi label="Practice streak" value={String(p?.streak_days ?? 0)} unit="days" />
        <Kpi label={p?.days_to_exam != null ? "Days to exam" : "Daily goal"} value={p?.days_to_exam != null ? String(p.days_to_exam) : String(profile.daily_goal_minutes)} unit={p?.days_to_exam != null ? undefined : "min"} />
      </div>

      {current === null ? (
        <Card className="border-primary/30 bg-secondary">
          <CardHeader><CardTitle>Find your starting level</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">Take the short level test to get your estimated band and a personal plan.</p>
            <Button asChild><Link href="/assessment">Take level test</Link></Button>
          </CardContent>
        </Card>
      ) : (
        target !== null && (
          <Card>
            <CardContent className="space-y-2 p-6">
              <div className="flex justify-between text-sm">
                <span>Progress to your goal</span>
                <span className="text-muted-foreground">{fmt(current)} → {fmt(target)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={goalPct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to target band">
                <div className="h-full rounded-full bg-primary" style={{ width: `${goalPct}%` }} />
              </div>
            </CardContent>
          </Card>
        )
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Today&apos;s practice</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {plan.loading && <div className="h-16 animate-pulse rounded-lg bg-muted" aria-busy="true" />}
            {!plan.loading && today && (
              <>
                <p className="text-sm text-muted-foreground">{today.label}</p>
                <ul className="space-y-2">
                  {today.tasks.map((t, i) => (
                    <li key={`${t.href}-${i}`} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.minutes} min</p>
                      </div>
                      <Button asChild size="sm" variant="outline"><Link href={t.href}>Start</Link></Button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {!plan.loading && !today && (
              <>
                <p className="text-sm text-muted-foreground">You don&apos;t have a study plan yet. Make one to get daily tasks.</p>
                <Button asChild><Link href="/study-plan">Create study plan</Link></Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Your skills</CardTitle></CardHeader>
          <CardContent>
            {progress.loading && <div className="h-16 animate-pulse rounded-lg bg-muted" aria-busy="true" />}
            {progress.error && <ErrorBlock error={progress.error} onRetry={progress.reload} />}
            {p && (
              <ul className="grid grid-cols-2 gap-3">
                {p.skills.filter((s) => SKILL_LINKS[s.skill]).map((s) => (
                  <li key={s.skill}>
                    <Link href={SKILL_LINKS[s.skill]} className="block rounded-lg border p-3 transition-colors hover:bg-accent">
                      <p className="text-xs capitalize text-muted-foreground">{s.skill}</p>
                      <p className="text-2xl font-bold">{fmt(s.latest)}</p>
                      <p className="text-xs text-muted-foreground">{s.attempts} attempt{s.attempts === 1 ? "" : "s"}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {p && p.recommendations.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Suggestions for you</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {p.recommendations.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link href="/vocabulary">Vocabulary</Link></Button>
        <Button asChild variant="outline"><Link href="/grammar">Grammar</Link></Button>
        <Button asChild variant="outline"><Link href="/progress">Full progress</Link></Button>
        <Button asChild variant="outline"><Link href="/study-plan">Study plan</Link></Button>
      </div>
    </div>
  );
}
