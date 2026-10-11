import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/layout/disclaimer";

// Phase 1 placeholder. The full landing page is built in Phase 3.
export default function HomePage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-6 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">IELTS Doesn&apos;t Have to Be Scary.</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Practice with your personal AI IELTS coach, improve your weak areas, and build confidence before exam day.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" asChild>
          <Link href="/signup">Start Free Practice</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/assessment">Take Level Test</Link>
        </Button>
      </div>
      <Disclaimer className="mt-10 max-w-2xl text-xs text-muted-foreground" />
    </main>
  );
}
