"use client";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { ErrorBlock, LoadingBlock } from "@/components/common/states";
import { useProfile } from "@/hooks/use-profile";
import { api, ApiError } from "@/lib/api";

const BANDS = Array.from({ length: 13 }, (_, i) => 3 + i * 0.5); // 3.0 … 9.0

export function ProfileForm() {
  const { profile, error, loading, reload } = useProfile();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [examDate, setExamDate] = useState("");
  const [minutes, setMinutes] = useState("30");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setTarget(profile.target_band === null ? "" : String(profile.target_band));
    setExamDate(profile.exam_date ?? "");
    setMinutes(String(profile.daily_goal_minutes));
  }, [profile]);

  if (loading) return <LoadingBlock label="Loading profile" />;
  if (error || !profile) return <ErrorBlock error={error ?? { message: "Couldn't load your profile." }} onRetry={reload} />;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const mins = Number(minutes);
    if (!Number.isInteger(mins) || mins < 5 || mins > 480) {
      setMessage({ ok: false, text: "Daily goal must be between 5 and 480 minutes." });
      return;
    }
    const body: Record<string, unknown> = { name: name.trim(), daily_goal_minutes: mins };
    if (target) body.target_band = Number(target);
    if (examDate) body.exam_date = examDate;
    setSaving(true);
    try {
      await api("/auth/profile", { method: "POST", body: JSON.stringify(body) });
      setMessage({ ok: true, text: "Profile saved." });
      await reload();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof ApiError ? err.message : "Couldn't save your profile." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your profile</h1>
        <p className="text-muted-foreground">{profile.email}</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={save} className="space-y-4" noValidate>
            <Field label="Name" name="name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <div className="space-y-1.5">
              <label htmlFor="target" className="text-sm font-medium">Target band</label>
              <select id="target" value={target} onChange={(e) => setTarget(e.target.value)} className="h-10 w-full rounded-lg border bg-background px-3 text-sm">
                <option value="">Not set</option>
                {BANDS.map((b) => <option key={b} value={b}>{b.toFixed(1)}</option>)}
              </select>
            </div>
            <Field label="Exam date (optional)" name="exam_date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            <Field label="Daily goal (minutes)" name="daily_goal" type="number" min={5} max={480} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
            {message && <Alert variant={message.ok ? "success" : "error"}>{message.text}</Alert>}
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
