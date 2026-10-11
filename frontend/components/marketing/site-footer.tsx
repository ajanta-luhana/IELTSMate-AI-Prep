import Link from "next/link";
import { Disclaimer } from "@/components/layout/disclaimer";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-card">
      <div className="container space-y-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-bold text-primary">IELTSMate</p>
          <nav aria-label="Footer" className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/features" className="hover:text-foreground">Features</Link>
            <Link href="/how-it-works" className="hover:text-foreground">How it works</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
          </nav>
        </div>
        <Disclaimer />
      </div>
    </footer>
  );
}
