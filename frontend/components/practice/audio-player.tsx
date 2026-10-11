"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Level, ScriptLine } from "@/types/practice";

interface Props {
  script: ScriptLine[];
  level: Level;
}

/** Reads a self-written script aloud with the browser's built-in speech (free, no audio files).
 *  Voices differ per device. In Exam mode the recording can be played once, like the real test. */
export function AudioPlayer({ script, level }: Props) {
  const [supported, setSupported] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const [rate, setRate] = useState(1);
  const [showText, setShowText] = useState(false);
  const run = useRef(0); // bumping this cancels any in-flight playback chain
  const maxPlays = level === "exam" ? 1 : Infinity;

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      run.current++;
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    run.current++;
    window.speechSynthesis.cancel();
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const mine = ++run.current;
    const voices = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
    const speakers = Array.from(new Set(script.map((l) => l.speaker)));
    setPlays((p) => p + 1);
    setPlaying(true);

    const speak = (i: number) => {
      if (mine !== run.current) return;
      if (i >= script.length) {
        setPlaying(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(script[i].text);
      u.lang = "en-GB";
      u.rate = rate;
      if (voices.length > 0) u.voice = voices[speakers.indexOf(script[i].speaker) % voices.length];
      u.onend = () => speak(i + 1);
      u.onerror = () => {
        if (mine === run.current) setPlaying(false);
      };
      synth.speak(u);
    };
    speak(0);
  }, [script, rate]);

  if (!supported) {
    return (
      <div className="space-y-3 rounded-2xl border bg-muted p-4 text-sm">
        <p>Your browser can&apos;t read the audio aloud. You can read the transcript instead (a bit easier than a real test).</p>
        <Button variant="outline" size="sm" onClick={() => setShowText((s) => !s)}>{showText ? "Hide transcript" : "Show transcript"}</Button>
        {showText && <Transcript script={script} />}
      </div>
    );
  }

  const blocked = plays >= maxPlays && !playing;
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        {playing ? (
          <Button onClick={stop} variant="outline" size="lg" aria-label="Stop audio">■ Stop</Button>
        ) : (
          <Button onClick={play} size="lg" disabled={blocked} aria-label="Play audio">▶ {plays === 0 ? "Play" : "Play again"}</Button>
        )}
        <label className="flex items-center gap-2 text-sm">
          Speed
          <select value={rate} onChange={(e) => setRate(Number(e.target.value))} disabled={playing} className="h-10 rounded-lg border border-input bg-card px-2 text-sm">
            <option value={0.8}>Slower</option>
            <option value={1}>Normal</option>
            <option value={1.2}>Faster</option>
          </select>
        </label>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {level === "exam" ? (blocked ? "Played once, as in the exam." : "Exam mode: you can play this once.") : playing ? "Playing…" : "You can replay as many times as you like."}
        </span>
      </div>
    </div>
  );
}

export function Transcript({ script }: { script: ScriptLine[] }) {
  return (
    <div className="space-y-2 rounded-xl bg-muted p-4 text-sm leading-relaxed">
      {script.map((l, i) => (
        <p key={i}><strong>{l.speaker}:</strong> {l.text}</p>
      ))}
    </div>
  );
}
