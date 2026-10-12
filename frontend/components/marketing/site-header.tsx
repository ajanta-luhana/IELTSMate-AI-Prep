"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown, Headphones, Menu, Mic, PenLine, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SKILLS = [
  { href: "/features#speaking", label: "Speaking", text: "Voice practice with feedback", icon: Mic },
  { href: "/features#writing", label: "Writing", text: "Essay feedback on four criteria", icon: PenLine },
  { href: "/features#reading", label: "Reading", text: "Passages marked instantly", icon: BookOpen },
  { href: "/features#listening", label: "Listening", text: "Audio read by your browser", icon: Headphones },
  { href: "/features#vocabulary", label: "Vocabulary and grammar", text: "Short topic drills", icon: Type },
];
const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setDropOpen(false); setMenuOpen(false); }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">IM</span>
          IELTSMate
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          <div ref={dropRef} className="relative">
            <button
              type="button"
              aria-expanded={dropOpen}
              aria-haspopup="true"
              onClick={() => setDropOpen((v) => !v)}
              className="inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium hover:bg-accent"
            >
              Practice <ChevronDown className={`h-4 w-4 transition-transform ${dropOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {dropOpen && (
              <ul className="absolute left-0 top-12 w-72 rounded-xl border bg-card p-2 shadow-lg">
                {SKILLS.map(({ href, label, text, icon: Icon }) => (
                  <li key={label}>
                    <Link href={href} onClick={() => setDropOpen(false)} className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent">
                      <Icon className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                      <span><span className="block text-sm font-medium">{label}</span><span className="block text-xs text-muted-foreground">{text}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium hover:bg-accent">{l.label}</Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild><Link href="/login">Log in</Link></Button>
          <Button asChild><Link href="/signup">Start free</Link></Button>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg hover:bg-accent md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav aria-label="Mobile" className="container space-y-1 border-t pb-4 pt-2 md:hidden">
          {[...SKILLS.map((s) => ({ href: s.href, label: s.label })), ...LINKS].map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-accent">{l.label}</Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" asChild><Link href="/login">Log in</Link></Button>
            <Button className="flex-1" asChild><Link href="/signup">Start free</Link></Button>
          </div>
        </nav>
      )}
    </header>
  );
}
