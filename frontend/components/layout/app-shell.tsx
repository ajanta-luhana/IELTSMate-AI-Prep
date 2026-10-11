"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, BookOpen, CalendarCheck, ClipboardCheck, Headphones, LayoutDashboard, LogOut,
  Mic, PenLine, Settings, SpellCheck, Type, User, type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Disclaimer } from "./disclaimer";

interface Item { href: string; label: string; icon: LucideIcon }
const GROUPS: { title: string; items: Item[] }[] = [
  { title: "Overview", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/assessment", label: "Level test", icon: ClipboardCheck },
    { href: "/study-plan", label: "Study plan", icon: CalendarCheck },
    { href: "/progress", label: "Progress", icon: BarChart3 },
  ] },
  { title: "Practice", items: [
    { href: "/reading", label: "Reading", icon: BookOpen },
    { href: "/listening", label: "Listening", icon: Headphones },
    { href: "/speaking", label: "Speaking", icon: Mic },
    { href: "/writing", label: "Writing", icon: PenLine },
    { href: "/vocabulary", label: "Vocabulary", icon: Type },
    { href: "/grammar", label: "Grammar", icon: SpellCheck },
  ] },
  { title: "Account", items: [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ] },
];
const ALL = GROUPS.flatMap((g) => g.items);

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const current = ALL.find((i) => isActive(i.href));

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <Link href="/dashboard" className="flex h-16 items-center gap-2 px-6 text-lg font-semibold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold">IM</span>
          IELTSMate
        </Link>
        <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">{g.title}</p>
              <ul className="space-y-0.5">
                {g.items.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive(href) ? "page" : undefined}
                      className={cn(
                        "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors hover:bg-white/10 hover:text-white",
                        isActive(href) && "bg-white/10 font-medium text-white",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <button
          type="button"
          onClick={signOut}
          className="m-3 flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
        </button>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b bg-card/90 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-4 px-4 lg:h-16 lg:px-8">
            <Link href="/dashboard" className="font-semibold text-primary lg:hidden">IELTSMate</Link>
            <p className="hidden text-sm font-medium text-muted-foreground lg:block">{current?.label ?? "IELTSMate"}</p>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">Estimated scores only</span>
              <button type="button" onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground lg:hidden">Sign out</button>
            </div>
          </div>
          {/* Mobile nav */}
          <nav aria-label="Main (mobile)" className="overflow-x-auto px-2 pb-2 lg:hidden">
            <ul className="flex w-max gap-1">
              {ALL.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={cn("inline-flex h-9 items-center rounded-md px-3 text-sm hover:bg-accent", isActive(href) && "bg-secondary font-medium")}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-4 pb-8 lg:px-8"><Disclaimer /></footer>
      </div>
    </div>
  );
}
