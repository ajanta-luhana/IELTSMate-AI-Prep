import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MODES = [
  { id: "confidence", title: "Confidence Mode", blurb: "3 easy, friendly questions. No pressure, just get talking.", length: "About 5 minutes", tag: "Start here" },
  { id: "practice", title: "Practice Mode", blurb: "A short taste of all three parts, with a cue card.", length: "About 8 minutes", tag: null },
  { id: "mock", title: "Mock Test", blurb: "The full shape of the real test: Part 1, a Part 2 cue card, then Part 3.", length: "About 12 minutes", tag: null },
] as const;

export function ModePicker() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Speaking Coach</h1>
        <p className="text-muted-foreground">Answer out loud, read what we heard, and get an estimated band with clear tips.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {MODES.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                {m.title}
                {m.tag && <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">{m.tag}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{m.blurb}</p>
              <p className="text-xs text-muted-foreground">{m.length}</p>
              <Button asChild className="w-full" size="lg"><Link href={`/speaking/session?mode=${m.id}`}>Start</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>Privacy: your voice is turned into text and the audio is not stored. Only the text and your feedback are saved.</p>
        <p>Pronunciation isn&apos;t scored. Fluency is estimated from your words, not from how they sound.</p>
        <p><Link href="/speaking/results?n=0" className="text-primary hover:underline">See your past answers</Link></p>
      </div>
    </div>
  );
}
