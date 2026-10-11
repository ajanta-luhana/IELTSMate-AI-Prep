import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import type { SpeakingResult } from "@/types/speaking";

const CRITERIA: { key: "fluency" | "vocabulary" | "grammar" | "coherence"; label: string }[] = [
  { key: "fluency", label: "Fluency" },
  { key: "coherence", label: "Coherence" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "grammar", label: "Grammar" },
];

export function FeedbackCard({ r }: { r: SpeakingResult }) {
  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-secondary">
        <CardContent className="flex flex-wrap items-center gap-5 p-5">
          <div>
            <p className="text-4xl font-bold text-primary">{r.overall_score.toFixed(1)}</p>
            <p className="text-xs font-medium">Estimated band</p>
          </div>
          <p className="min-w-[12rem] flex-1 text-sm">{r.summary}</p>
        </CardContent>
      </Card>

      {r.note && <Alert variant="warning">{r.note}</Alert>}

      <Card>
        <CardContent className="space-y-3 p-5">
          {CRITERIA.map((c) => (
            <div key={c.key} className="space-y-1">
              <div className="flex justify-between text-sm"><span>{c.label}</span><span className="font-medium">{r[c.key].toFixed(1)}</span></div>
              <Progress value={(r[c.key] / 9) * 100} label={`${c.label} estimated band`} />
            </div>
          ))}
          <p className="pt-1 text-xs text-muted-foreground">
            {r.stats.word_count} words
            {r.stats.words_per_minute !== null ? ` · about ${Math.round(r.stats.words_per_minute)} words per minute` : ""}
            {r.stats.filler_count > 0 ? ` · ${r.stats.filler_count} filler word${r.stats.filler_count === 1 ? "" : "s"} (${r.stats.fillers.join(", ")})` : ""}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">What went well</CardTitle></CardHeader>
          <CardContent><ul className="list-disc space-y-1 pl-5 text-sm">{r.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Work on next</CardTitle></CardHeader>
          <CardContent><ul className="list-disc space-y-1 pl-5 text-sm">{r.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul></CardContent>
        </Card>
      </div>

      {r.mistakes.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Words to fix</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {r.mistakes.map((m, i) => (
              <div key={i} className="space-y-1">
                <p className="rounded-lg bg-destructive/10 p-2"><span className="font-medium">You said: </span>{m.said}</p>
                <p className="rounded-lg bg-success/10 p-2"><span className="font-medium">Better: </span>{m.better}</p>
                <p className="text-muted-foreground">{m.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {r.better_answer && (
        <details className="rounded-2xl border bg-card p-4 text-sm">
          <summary className="cursor-pointer font-medium">See an example answer</summary>
          <p className="mt-2 leading-relaxed">{r.better_answer}</p>
        </details>
      )}
      <details className="rounded-2xl border bg-card p-4 text-sm">
        <summary className="cursor-pointer font-medium">What we heard (transcript)</summary>
        <p className="mt-2 leading-relaxed">{r.transcript}</p>
      </details>
      <p className="text-xs text-muted-foreground">{r.pronunciation_note} Feedback is written by an AI model and can make mistakes.</p>
    </div>
  );
}
