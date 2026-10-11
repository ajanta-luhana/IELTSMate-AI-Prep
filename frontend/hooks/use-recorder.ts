"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "requesting" | "recording";

function pickMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return undefined;
}

export function micErrorMessage(e: unknown): string {
  const name = e instanceof DOMException ? e.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Microphone access is blocked. Click the lock icon in your browser's address bar, allow the microphone, then try again. You can also type your answer instead.";
  }
  if (name === "NotFoundError") return "No microphone was found. Plug one in, or type your answer instead.";
  if (name === "NotReadableError") return "Your microphone is being used by another app. Close it and try again.";
  return "We couldn't start the microphone. You can type your answer instead.";
}

/** Records microphone audio in the browser. Audio only leaves the device when the student submits it. */
export function useRecorder(maxSeconds: number) {
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined");
  }, []);

  const cleanup = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  useEffect(
    () => () => {
      if (recorder.current) recorder.current.onstop = null; // leaving the page: don't deliver a recording
      if (recorder.current?.state === "recording") recorder.current.stop();
      cleanup();
    },
    [cleanup],
  );

  const start = useCallback(
    async (onDone: (blob: Blob, seconds: number) => void) => {
      setError(null);
      setState("requesting");
      try {
        const media = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.current = media;
        const mime = pickMime();
        const rec = new MediaRecorder(media, mime ? { mimeType: mime } : undefined);
        chunks.current = [];
        rec.ondataavailable = (e: BlobEvent) => {
          if (e.data.size > 0) chunks.current.push(e.data);
        };
        rec.onstop = () => {
          const secs = (Date.now() - startedAt.current) / 1000;
          const blob = new Blob(chunks.current, { type: rec.mimeType || mime || "audio/webm" });
          cleanup();
          setState("idle");
          onDone(blob, secs);
        };
        recorder.current = rec;
        startedAt.current = Date.now();
        rec.start();
        setSeconds(0);
        setState("recording");
        timer.current = setInterval(() => {
          const s = Math.floor((Date.now() - startedAt.current) / 1000);
          setSeconds(s);
          if (s >= maxSeconds && rec.state === "recording") rec.stop();
        }, 500);
      } catch (e) {
        cleanup();
        setError(micErrorMessage(e));
        setState("idle");
      }
    },
    [cleanup, maxSeconds],
  );

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  return { state, seconds, error, supported, start, stop };
}
