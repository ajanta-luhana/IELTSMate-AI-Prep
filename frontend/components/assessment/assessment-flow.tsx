"use client";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import type { AssessmentResult, AssessmentStart, Goals } from "@/types/assessment";
import { GoalsStep } from "./goals-step";
import { QuestionStep } from "./question-step";
import { ResultView } from "./result-view";

type Stage = "goals" | "questions" | "result";

export function AssessmentFlow() {
  const [stage, setStage] = useState<Stage>("goals");
  const [goals, setGoals] = useState<Goals | null>(null);
  const [data, setData] = useState<AssessmentStart | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const message = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

  async function begin(g: Goals) {
    setLoading(true);
    setError(null);
    try {
      setData(await api<AssessmentStart>("/assessment/start", { method: "POST" }));
      setGoals(g);
      setStage("questions");
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }

  async function finish(answers: Record<string, number | null>) {
    if (!goals) return;
    setLoading(true);
    setError(null);
    try {
      setResult(await api<AssessmentResult>("/assessment/submit", { method: "POST", body: JSON.stringify({ ...goals, answers }) }));
      setStage("result");
    } catch (e) {
      setError(message(e)); // answers stay on screen so nothing is lost; the student can press Finish again
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="p-6 sm:p-8">
        {stage === "goals" && (
          <div className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            <GoalsStep loading={loading} onSubmit={begin} />
          </div>
        )}
        {stage === "questions" && data && (
          <QuestionStep questions={data.questions} passages={data.passages} submitting={loading} error={error} onFinish={finish} />
        )}
        {stage === "result" && result && (
          <ResultView result={result} goals={goals} onRetake={() => { setResult(null); setData(null); setStage("goals"); }} />
        )}
      </CardContent>
    </Card>
  );
}
