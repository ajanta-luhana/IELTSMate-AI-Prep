import Link from "next/link";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-primary">IELTSMate</Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Button key={l.href} variant="ghost" size="sm" asChild><Link href={l.href}>{l.label}</Link></Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild><Link href="/login">Log in</Link></Button>
          <Button size="sm" asChild><Link href="/signup">Sign up free</Link></Button>
        </div>
      </div>
    </header>
  );
}
