"use client";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  recording: boolean;
  busy: boolean;
  seconds: number;
  maxSeconds: number;
  onStart: () => void;
  onStop: () => void;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Big, thumb-friendly microphone control. */
export function MicButton({ recording, busy, seconds, maxSeconds, onStart, onStop }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={recording ? onStop : onStart}
        disabled={busy}
        aria-label={recording ? "Stop recording" : "Start recording"}
        className={cn(
          "flex h-28 w-28 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 disabled:opacity-50 sm:h-32 sm:w-32",
          recording && "animate-pulse ring-8 ring-primary/30",
        )}
      >
        {recording ? <Square className="h-10 w-10" aria-hidden="true" /> : <Mic className="h-12 w-12" aria-hidden="true" />}
      </button>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {recording ? `Recording… ${fmt(seconds)} / ${fmt(maxSeconds)}. Tap to finish.` : busy ? "Getting the microphone ready…" : "Tap to start speaking"}
      </p>
    </div>
  );
}
