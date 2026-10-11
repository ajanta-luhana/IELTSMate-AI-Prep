import Link from "next/link";
import { BarChart3, Mic, PenLine, ShieldCheck } from "lucide-react";
import { Disclaimer } from "@/components/layout/disclaimer";

const POINTS = [
  { icon: PenLine, title: "Writing feedback in minutes", text: "Criteria-based comments and rewrite ideas for Task 1 and Task 2." },
  { icon: Mic, title: "Speaking practice, no pressure", text: "Record, check your transcript, then get friendly coaching." },
  { icon: BarChart3, title: "See your progress", text: "A personal study plan and weekly charts toward your target band." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-sidebar via-[hsl(228,55%,22%)] to-primary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-2 text-xl font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 text-sm font-bold">IM</span>
          IELTSMate
        </Link>
        <div className="relative space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-semibold leading-tight">Your free AI IELTS coach.</h2>
            <p className="max-w-md text-white/75">Practice every skill, understand your mistakes, and build confidence before exam day.</p>
          </div>
          <ul className="space-y-5">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-white/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-white/70">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Free to use. Your recordings are never stored.
          
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col items-center justify-center gap-6 bg-background px-4 py-10">
        <Link href="/" className="text-2xl font-bold text-primary lg:hidden">IELTSMate</Link>
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-[0_10px_40px_-12px_rgba(30,41,120,0.18)] sm:p-9">{children}</div>
        <Disclaimer className="max-w-md text-center text-xs text-muted-foreground" />
      </main>
    </div>
  );
}
