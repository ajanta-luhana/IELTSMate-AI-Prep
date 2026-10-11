"use client";
import { useCallback, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ErrorBlock, LoadingBlock } from "@/components/common/states";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";
import type { AnswerResult, DrillKind, PracticeItem, PracticeProgress } from "@/types/practice";

const COPY: Record<DrillKind, { title: string; intro: string }> = {
  vocabulary: { title: "Vocabulary practice", intro: "Short quizzes by topic, with a quick explanation after every answer." },
  grammar: { title: "Grammar practice", intro: "Practise the grammar IELTS examiners listen and look for." },
};
const SESSION_SIZE = 5;

type Phase = "pick" | "loading" | "run" | "done";

export function Drill({ kind }: { kind: DrillKind }) {
  const topics = useApi<string[]>(`/vocabulary/topics?kind=${kind}`);
  const progress = useApi<PracticeProgress>(`/vocabulary/progress?kind=${kind}`);

  const [phase, setPhase] = useState<Phase>("pick");
  const [items, setItems] = useState<PracticeItem[]>([]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(
    async (topic: string | null) => {
      setPhase("loading");
      setError(null);
      try {
        const q = new URLSearchParams({ kind, limit: String(SESSION_SIZE) });
        if (topic) q.set("topic", topic);
        const list = await api<PracticeItem[]>(`/vocabulary?${q.toString()}`);
        if (list.length === 0) throw new ApiError(404, "empty", "No questions found for that topic.");
        setItems(list);
        setIndex(0);
        setScore(0);
        setChosen(null);
        setFeedback(null);
        setPhase("run");
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Couldn't load questions. Please try again.");
        setPhase("pick");
      }
    },
    [kind],
  );

  async function answer(choice: number) {
    if (feedback || busy) return;
    const item = items[index];
    setBusy(true);
    setChosen(choice);
    setError(null);
    try {
      const res = await api<AnswerResult>("/vocabulary/answer", { method: "POST", body: JSON.stringify({ item_id: item.id, choice }) });
      setFeedback(res);
      if (res.correct) setScore((s) => s + 1);
    } catch (e) {
      setChosen(null);
      setError(e instanceof ApiError ? e.message : "Couldn't check that answer. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (index + 1 >= items.length) {
      setPhase("done");
      progress.reload();
      return;
    }
    setIndex((i) => i + 1);
    setChosen(null);
    setFeedback(null);
  }

  if (phase === "loading") return <LoadingBlock label="Loading questions" />;

  if (phase === "run") {
    const item = items[index];
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground"><span>{item.topic}</span><span>{index + 1} / {items.length}</span></div>
            <Progress value={(index / items.length) * 100} label="Session progress" />
          </div>
          <h2 className="text-lg font-semibold">{item.prompt}</h2>
          {error && <Alert variant="error">{error}</Alert>}
          <div className="space-y-2" role="group" aria-label="Answer choices">
            {item.options.map((opt, i) => {
              const showRight = feedback && i === feedback.correct_index;
              const showWrong = feedback && chosen === i && !feedback.correct;
              return (
                <button
                  key={`${item.id}-${i}`}
                  type="button"
                  disabled={!!feedback || busy}
                  onClick={() => answer(i)}
                  className={cn(
                    "flex min-h-12 w-full items-center rounded-lg border px-4 py-2 text-left text-sm transition-colors",
                    showRight ? "border-success bg-success/10 font-medium" : showWrong ? "border-destructive bg-destructive/10" : chosen === i ? "border-primary bg-secondary" : "bg-card hover:bg-accent",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {feedback && (
            <div className="space-y-3" aria-live="polite">
              <Alert variant={feedback.correct ? "success" : "warning"}>
                <strong>{feedback.correct ? "Correct! " : "Not quite. "}</strong>
                {feedback.explanation}
              </Alert>
              <Button onClick={next} className="w-full" size="lg">{index + 1 >= items.length ? "See results" : "Next question"}</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (phase === "done") {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-5 p-6 text-center sm:p-8">
          <p className="text-5xl font-bold text-primary">{score} / {items.length}</p>
          <p className="text-muted-foreground">{score === items.length ? "Perfect round. Great work!" : score >= items.length / 2 ? "Good effort. A little more practice and these will stick." : "Every mistake you read the explanation for is progress. Try another round."}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => start(items[0]?.topic ?? null)}>Same topic again</Button>
            <Button size="lg" variant="outline" onClick={() => setPhase("pick")}>Choose a topic</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const byTopic = new Map((progress.data?.topics ?? []).map((t) => [t.topic, t]));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{COPY[kind].title}</h1>
        <p className="text-muted-foreground">{COPY[kind].intro}</p>
      </div>
      {error && <Alert variant="error">{error}</Alert>}

      {progress.data && progress.data.weak_topics.length > 0 && (
        <Alert variant="warning">
          <strong>Focus here: </strong>{progress.data.weak_topics.join(", ")}. These are below 60% so far.
        </Alert>
      )}

      <Button size="lg" onClick={() => start(null)}>Quick mixed round ({SESSION_SIZE} questions)</Button>

      {topics.loading && <LoadingBlock label="Loading topics" />}
      {topics.error && <ErrorBlock error={topics.error} onRetry={topics.reload} />}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(topics.data ?? []).map((t) => {
          const p = byTopic.get(t);
          return (
            <Card key={t}>
              <CardHeader className="pb-2"><CardTitle className="text-base">{t}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {p && p.accuracy !== null ? (
                  <>
                    <Progress value={p.accuracy * 100} label={`${t} accuracy`} />
                    <p className="text-xs text-muted-foreground">{Math.round(p.accuracy * 100)}% correct · {p.attempts} answered{p.weak ? " · needs practice" : ""}</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Not practised yet</p>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={() => start(t)}>Practise</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
