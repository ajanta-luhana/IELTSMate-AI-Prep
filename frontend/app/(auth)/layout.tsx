import { CheckCircle2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

const POINTS = [
  "Feedback on Writing and Speaking in minutes",
  "Reading and Listening marked instantly",
  "A study plan built around your target band",
];
const TRUST = [
  { icon: Sparkles, title: "Free to use", text: "No credit card, no trial timer." },
  { icon: Lock, title: "Recordings not stored", text: "Audio becomes text, then it is deleted." },
  { icon: ShieldCheck, title: "Original questions", text: "Written for IELTSMate, not copied." },
];
const SAMPLE = [
  { label: "Speaking", value: 6.0 },
  { label: "Writing", value: 6.5 },
  { label: "Reading", value: 7.0 },
  { label: "Listening", value: 6.5 },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 bg-gradient-to-b from-secondary/70 to-background">
        <div className="container grid items-center gap-12 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          {/* Left: pitch and sample result (desktop) */}
          <section className="hidden space-y-8 lg:block" aria-label="About IELTSMate">
            <div className="space-y-4">
              <h2 className="max-w-lg text-4xl font-bold leading-tight tracking-tight">Know your weak spots. Fix them one practice at a time.</h2>
              <ul className="space-y-2">
                {POINTS.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <figure className="max-w-md rounded-2xl border bg-card p-6 shadow-[0_20px_50px_-20px_rgba(30,41,120,0.3)]">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated overall band</p>
                  <p className="text-5xl font-bold tabular-nums">6.5</p>
                </div>
                <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">+0.5 this month</span>
              </div>
              <ul className="mt-5 space-y-3">
                {SAMPLE.map((s) => (
                  <li key={s.label} className="grid grid-cols-[5rem_1fr_2rem] items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${(s.value / 9) * 100}%` }} />
                    </span>
                    <span className="text-right font-medium tabular-nums">{s.value.toFixed(1)}</span>
                  </li>
                ))}
              </ul>
              <figcaption className="mt-4 text-xs text-muted-foreground">Example of a progress view. Bands in IELTSMate are estimates, not official scores.</figcaption>
            </figure>
          </section>

          {/* Right: the form */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border bg-card p-6 shadow-[0_10px_40px_-12px_rgba(30,41,120,0.18)] sm:p-9">{children}</div>
          </div>
        </div>

        <div className="container pb-12">
          <ul className="grid gap-4 border-t pt-8 sm:grid-cols-3">
            {TRUST.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
