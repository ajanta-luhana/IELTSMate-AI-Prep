import Link from "next/link";
import { Disclaimer } from "@/components/layout/disclaimer";

const COLUMNS = [
  { title: "Practice", links: [["Speaking", "/features#speaking"], ["Writing", "/features#writing"], ["Reading", "/features#reading"], ["Listening", "/features#listening"]] },
  { title: "IELTSMate", links: [["Features", "/features"], ["How it works", "/how-it-works"], ["About", "/about"]] },
  { title: "Account", links: [["Log in", "/login"], ["Sign up", "/signup"], ["Level test", "/assessment"]] },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-sidebar text-sidebar-foreground">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-lg font-semibold text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold">IM</span> IELTSMate
          </p>
          <p className="max-w-xs text-sm">A free AI coach for IELTS practice, feedback and progress tracking.</p>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="mb-3 text-sm font-medium text-white">{c.title}</p>
            <ul className="space-y-2 text-sm">
              {c.links.map(([label, href]) => <li key={label}><Link href={href} className="hover:text-white">{label}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container py-6"><Disclaimer className="text-xs text-sidebar-foreground/70" /></div>
      </div>
    </footer>
  );
}
