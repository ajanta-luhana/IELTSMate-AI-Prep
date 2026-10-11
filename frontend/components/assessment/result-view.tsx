import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Disclaimer } from "@/components/layout/disclaimer";
import type { AssessmentResult, Goals, Section } from "@/types/assessment";

const LABEL: Record<Section, string> = { grammar: "Grammar", vocabulary: "Vocabulary", reading: "Reading" };

export function ResultView({ result, goals, onRetake }: { result: AssessmentResult; goals: Goals | null; onRetake: () => void }) {
  const gap = goals ? goals.target_band - result.overall_score : null;
  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-secondary">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Your estimated current band</CardTitle></CardHeader>
        <CardContent>
          <p className="text-5xl font-bold text-primary">{result.overall_score.toFixed(1)}</p>
          {gap !== null && (
            <p className="mt-2 text-sm">
              {gap > 0 ? `Your target is ${goals!.target_band.toFixed(1)} — about ${gap.toFixed(1)} band${gap === 1 ? "" : "s"} to go. That's very doable with steady practice.` : "You're already at your target level on this check. Keep practicing to stay confident."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>By skill area</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {result.sections.map((s) => (
            <div key={s.section} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{LABEL[s.section]}{s.section === result.weakest_section && <span className="ml-2 rounded-full bg-warning/20 px-2 py-0.5 text-xs">focus here</span>}</span>
                <span>{s.band.toFixed(1)}{s.total > 0 && s.correct > 0 ? ` · ${s.correct}/${s.total} correct` : ""}</span>
              </div>
              <Progress value={(s.band / 9) * 100} label={`${LABEL[s.section]} estimated band`} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">{result.speaking_note}</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" asChild><Link href="/dashboard">Go to dashboard</Link></Button>
        <Button size="lg" variant="outline" onClick={onRetake}>Retake the check</Button>
      </div>
      <Disclaimer />
    </div>
  );
}
