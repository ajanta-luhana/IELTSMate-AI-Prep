"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** 0–4 rough strength: length plus character variety. For guidance only; Supabase enforces the real rules. */
export function passwordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}
const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];
const COLORS = ["bg-muted", "bg-destructive", "bg-warning", "bg-primary", "bg-success"];

interface Props {
  label: string;
  name: string;
  autoComplete: string;
  showStrength?: boolean;
  minLength?: number;
}

export function PasswordField({ label, name, autoComplete, showStrength = false, minLength }: Props) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const score = passwordStrength(value);
  const level = value && value.length < 8 ? 0 : score;

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {showStrength && value && (
        <div aria-live="polite" className="space-y-1">
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= level ? COLORS[level] : "bg-muted")} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Password strength: {LABELS[level]}. Use 8+ characters; mixing letters, numbers and symbols helps.</p>
        </div>
      )}
    </div>
  );
}
