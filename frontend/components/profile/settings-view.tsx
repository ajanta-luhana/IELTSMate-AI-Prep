"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBlock, LoadingBlock } from "@/components/common/states";
import { Disclaimer } from "@/components/layout/disclaimer";
import { useProfile } from "@/hooks/use-profile";
import { api, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/profile";

const LEVELS: { value: Profile["confidence_level"]; label: string; hint: string }[] = [
  { value: "easy", label: "Easy", hint: "Gentle practice, no pressure." },
  { value: "intermediate", label: "Intermediate", hint: "A bit more challenge." },
  { value: "exam", label: "Exam mode", hint: "Full exam-style difficulty." },
];

export function SettingsView() {
  const router = useRouter();
  const { profile, error, loading, reload } = useProfile();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (loading) return <LoadingBlock label="Loading settings" />;
  if (error || !profile) return <ErrorBlock error={error ?? { message: "Couldn't load your settings." }} onRetry={reload} />;

  async function choose(level: Profile["confidence_level"]) {
    setSaving(true);
    setMessage(null);
    try {
      await api("/auth/profile", { method: "POST", body: JSON.stringify({ confidence_level: level }) });
      setMessage({ ok: true, text: "Confidence level updated." });
      await reload();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof ApiError ? err.message : "Couldn't save." });
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Confidence Mode</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Choose the level practice lists start with.</p>
          <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Confidence level">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                disabled={saving}
                aria-pressed={profile.confidence_level === l.value}
                onClick={() => choose(l.value)}
                className={cn("rounded-lg border p-3 text-left transition-colors hover:bg-accent disabled:opacity-60", profile.confidence_level === l.value && "border-primary bg-secondary")}
              >
                <span className="block text-sm font-medium">{l.label}</span>
                <span className="block text-xs text-muted-foreground">{l.hint}</span>
              </button>
            ))}
          </div>
          {message && <Alert variant={message.ok ? "success" : "error"}>{message.text}</Alert>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Privacy</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Your speaking recordings are not stored. Audio is turned into text and then discarded; only the transcript and feedback are saved to your account.</p>
          <p>Your essays, scores and progress are visible only to you.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent><Button variant="outline" onClick={signOut}>Sign out</Button></CardContent>
      </Card>

      <Disclaimer />
    </div>
  );
}
