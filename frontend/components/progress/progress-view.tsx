"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Disclaimer } from "@/components/layout/disclaimer";
import { ErrorBlock, LoadingBlock } from "@/components/common/states";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";
import type { ProgressData } from "@/types/progress";
import { LineChart } from "./line-chart";

const TABS = [
  { key: "overall", label: "Overall" },
  { key: "speaking", label: "Speaking" },
  { key: "writing", label: "Writing" },
  { key: "reading", label: "Reading" },
  { key: "listening", label: "Listening" },
];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const pct = (x: number | null) => (x === null ? "Not practised yet" : `${Math.round(x * 100)}% correct`);

export function ProgressView() {
  const { data, error, loading, reload } = useApi<ProgressData>("/progress");
  const [tab, setTab] = useState("overall");

  if (loading) return <LoadingBlock label="Loading your progress" />;
  if (error || !data) return <ErrorBlock error={error ?? { message: "Couldn't load your progress." }} onRetry={reload} />;

  const gap = data.current_band !== null && data.target_band !== null ? data.target_band - data.current_band : null;
  const maxCount = Math.max(1, ...data.activity_last_7_days.map((d) => d.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your progress</h1>
        <p className="text-muted-foreground">All bands are estimates from your practice, not official IELTS scores.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Estimated band now</CardTitle></CardHeader><CardContent className="text-4xl font-bold">{data.current_band?.toFixed(1) ?? "—"}</CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Target</CardTitle></CardHeader><CardContent className="text-4xl font-bold">{data.target_band?.toFixed(1) ?? "—"}{gap !== null && gap > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">{gap.toFixed(1)} to go</span>}</CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground">Practice streak</CardTitle></CardHeader><CardContent className="text-4xl font-bold">{data.streak_days}<span className="ml-2 text-sm font-normal text-muted-foreground">day{data.streak_days === 1 ? "" : "s"}</span></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Band over time (weekly average)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div role="tablist" aria-label="Skill" className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button key={t.key} role="tab" aria-selected={tab === t.key} type="button" onClick={() => setTab(t.key)} className={cn("h-9 rounded-full border px-4 text-sm transition-colors", tab === t.key ? "border-primary bg-secondary font-medium" : "bg-card hover:bg-accent")}>{t.label}</button>
            ))}
          </div>
          <LineChart points={data.series[tab] ?? []} label={`${cap(tab)} estimated band by week`} target={data.target_band} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {data.skills.map((s) => (
              <div key={s.skill} className="space-y-1.5">
                <div className="flex justify-between text-sm"><span className="font-medium">{cap(s.skill)}</span><span>{s.latest === null ? "Not tried yet" : `${s.latest.toFixed(1)} latest · ${s.attempts} attempt${s.attempts === 1 ? "" : "s"}`}</span></div>
                <Progress value={((s.recent_average ?? 0) / 9) * 100} label={`${s.skill} recent average`} />
              </div>
            ))}
            <p className="text-sm text-muted-foreground">Vocabulary: {pct(data.vocabulary_accuracy)} · Grammar: {pct(data.grammar_accuracy)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Last 7 days</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-32 items-end gap-2" role="img" aria-label={`Practice activity: ${data.activity_last_7_days.map((d) => `${d.date} ${d.count}`).join(", ")}`}>
              {data.activity_last_7_days.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <div className={cn("w-full rounded-t-md", d.count > 0 ? "bg-success" : "bg-muted")} style={{ height: `${Math.max(6, (d.count / maxCount) * 100)}%` }} />
                  <span className="text-[10px] text-muted-foreground">{new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}</span>
                </div>
              ))}
            </div>
            {data.days_to_exam !== null && data.days_to_exam >= 0 && <p className="mt-3 text-sm text-muted-foreground">{data.days_to_exam} days until your exam.</p>}
          </CardContent>
        </Card>
      </div>

      {data.recommendations.length > 0 && (
        <Card className="border-primary/30 bg-secondary">
          <CardHeader><CardTitle>What to do next</CardTitle></CardHeader>
          <CardContent><ul className="list-disc space-y-1.5 pl-5 text-sm">{data.recommendations.map((r) => <li key={r}>{r}</li>)}</ul></CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg"><Link href="/study-plan">My study plan</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
      </div>
      <Disclaimer />
    </div>
  );
}
