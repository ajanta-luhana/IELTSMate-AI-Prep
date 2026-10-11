"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assessment", label: "Level test" },
  { href: "/reading", label: "Reading" },
  { href: "/listening", label: "Listening" },
  { href: "/speaking", label: "Speaking" },
  { href: "/writing", label: "Writing" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/grammar", label: "Grammar" },
  { href: "/study-plan", label: "Study plan" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }
  return (
    <header className="border-b bg-card">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link href="/dashboard" className="text-xl font-bold text-primary">IELTSMate</Link>
        <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
      </div>
      <nav aria-label="Main" className="container overflow-x-auto pb-2">
        <ul className="flex w-max items-center gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("inline-flex h-9 items-center rounded-md px-3 text-sm transition-colors hover:bg-accent", active && "bg-secondary font-medium")}
                >
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
