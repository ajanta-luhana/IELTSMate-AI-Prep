"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ErrorBlock, LoadingBlock } from "@/components/common/states";
import { api, ApiError } from "@/lib/api";
import { useRecorder } from "@/hooks/use-recorder";
import type { SessionResponse, SpeakingMode, SpeakingQuestion, SpeakingResult, TranscribeResponse } from "@/types/speaking";
import { FeedbackCard } from "./feedback-card";
import { MicButton } from "./mic-button";

type Phase = "loading" | "ready" | "transcribing" | "review" | "evaluating" | "feedback" | "failed";

const PART_LABEL = { 1: "Part 1 · Interview", 2: "Part 2 · Cue card", 3: "Part 3 · Discussion" } as const;

function messageOf(e: unknown): string {
  return e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
}

export function SpeakingSession() {
  const router = useRouter();
  const raw = useSearchParams().get("mode");
  const mode: SpeakingMode = raw === "practice" || raw === "mock" ? raw : "confidence";

  const [questions, setQuestions] = useState<SpeakingQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SpeakingResult[]>([]);
  const [prepLeft, setPrepLeft] = useState<number | null>(null);

  const q: SpeakingQuestion | undefined = questions[index];
  const recorder = useRecorder(q?.speak_seconds ?? 60);

  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    api<SessionResponse>("/speaking/session", { method: "POST", body: JSON.stringify({ mode }) })
      .then((r) => {
        setQuestions(r.questions);
        setPhase("ready");
      })
      .catch((e: unknown) => {
        setError(messageOf(e));
        setPhase("failed");
      });
  }, [mode]);

  useEffect(() => {
    if (prepLeft === null) return;
    if (prepLeft <= 0) {
      setPrepLeft(null);
      return;
    }
    const t = setTimeout(() => setPrepLeft((p) => (p === null ? null : p - 1)), 1000);
    return () => clearTimeout(t);
  }, [prepLeft]);

  async function onRecorded(blob: Blob, secs: number) {
    setPhase("transcribing");
    setError(null);
    try {
      const fd = new FormData();
      fd.append("audio", blob, "answer.webm");
      const r = await api<TranscribeResponse>("/speaking/transcribe", { method: "POST", body: fd });
      if (!r.transcript.trim()) {
        setError("We didn't hear any speech. Check your microphone and try again, or type your answer.");
        setPhase("ready");
        return;
      }
      setTranscript(r.transcript);
      setDuration(r.duration_seconds ?? secs);
      setPhase("review");
    } catch (e) {
      if (e instanceof ApiError && e.code === "stt_unavailable") {
        setTyping(true);
        setError("Speech-to-text isn't set up on this computer yet, so please type your answer instead. The README explains how to turn it on.");
      } else {
        setError(messageOf(e));
      }
      setPhase("ready");
    }
  }

  async function evaluate(text: string, secs: number | null) {
    if (!q) return;
    setPhase("evaluating");
    setError(null);
    try {
      const r = await api<SpeakingResult>("/speaking/evaluate", {
        method: "POST",
        body: JSON.stringify({ mode, part: q.part, question: q.text, transcript: text, duration_seconds: secs }),
      });
      setResults((prev) => [...prev, r]);
      setPhase("feedback");
    } catch (e) {
      setError(messageOf(e));
      setPhase(typing ? "ready" : "review");
    }
  }

  function next() {
    if (index + 1 >= questions.length) {
      router.push(`/speaking/results?n=${results.length}`);
      return;
    }
    setIndex((i) => i + 1);
    setTranscript("");
    setDuration(null);
    setError(null);
    setPrepLeft(null);
    setPhase("ready");
  }

  if (phase === "loading") return <LoadingBlock label="Preparing your questions" />;
  if (phase === "failed" || !q) return <ErrorBlock error={{ message: error ?? "Couldn't start the session." }} onRetry={() => router.refresh()} />;

  const last = index + 1 >= questions.length;
  const recording = recorder.state === "recording";
  const shownError = error ?? recorder.error;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{PART_LABEL[q.part]}</span>
          <span>Question {index + 1} of {questions.length}</span>
        </div>
        <Progress value={(index / questions.length) * 100} label="Session progress" />
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-semibold leading-snug">{q.text}</h1>
          {q.points.length > 0 && (
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">You should say:</p>
              <ul className="list-disc space-y-0.5 pl-5">{q.points.map((p) => <li key={p}>{p}</li>)}</ul>
              {phase === "ready" && (
                <div className="pt-2">
                  {prepLeft === null ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => setPrepLeft(q.prep_seconds)}>Take {q.prep_seconds} seconds to prepare</Button>
                  ) : (
                    <p className="font-medium text-primary" aria-live="polite">Preparing… {prepLeft}s (speak whenever you are ready)</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {shownError && <Alert variant="error">{shownError}</Alert>}

      {phase === "ready" && !typing && recorder.supported && (
        <div className="space-y-4 py-2">
          <MicButton
            recording={recording}
            busy={recorder.state === "requesting"}
            seconds={recorder.seconds}
            maxSeconds={q.speak_seconds}
            onStart={() => void recorder.start(onRecorded)}
            onStop={recorder.stop}
          />
          {!recording && (
            <p className="text-center text-xs text-muted-foreground">
              Your recording is turned into text and then discarded. It is not saved. {" "}
              <button type="button" className="text-primary underline" onClick={() => setTyping(true)}>Type instead</button>
            </p>
          )}
        </div>
      )}

      {phase === "ready" && (typing || !recorder.supported) && (
        <div className="space-y-3">
          {!recorder.supported && <Alert variant="warning">This browser can&apos;t record audio, so type your answer below.</Alert>}
          <label htmlFor="typed" className="text-sm font-medium">Type what you would say</label>
          <textarea id="typed" rows={6} maxLength={6000} value={transcript} onChange={(e) => setTranscript(e.target.value)} className="w-full rounded-lg border border-input bg-card p-3 text-sm" placeholder="Answer in full sentences, as if you were speaking." />
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => void evaluate(transcript, null)} disabled={!transcript.trim()}>Get feedback</Button>
            {recorder.supported && <Button variant="ghost" onClick={() => setTyping(false)}>Use the microphone</Button>}
          </div>
        </div>
      )}

      {phase === "transcribing" && <Alert variant="info">Turning your speech into text… this can take a little while the first time.</Alert>}

      {phase === "review" && (
        <div className="space-y-3">
          <label htmlFor="heard" className="text-sm font-medium">This is what we heard. Fix any mistakes before we give feedback.</label>
          <textarea id="heard" rows={6} maxLength={6000} value={transcript} onChange={(e) => setTranscript(e.target.value)} className="w-full rounded-lg border border-input bg-card p-3 text-sm" />
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => void evaluate(transcript, duration)} disabled={!transcript.trim()}>Get feedback</Button>
            <Button variant="outline" onClick={() => { setTranscript(""); setError(null); setPhase("ready"); }}>Record again</Button>
          </div>
        </div>
      )}

      {phase === "evaluating" && <Alert variant="info">Your coach is listening to your answer… A small AI model on your own computer can take a minute or two. Please keep this page open.</Alert>}

      {phase === "feedback" && results.length > 0 && (
        <div className="space-y-4">
          <FeedbackCard r={results[results.length - 1]} />
          <Button size="lg" className="w-full" onClick={next}>{last ? "Finish and see all results" : "Next question"}</Button>
        </div>
      )}
    </div>
  );
}
