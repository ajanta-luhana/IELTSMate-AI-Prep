import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Section } from "@/components/marketing/section";
import { Steps } from "@/components/marketing/steps";
import { LEVELS } from "@/lib/marketing-content";

export default function HomePage() {
  return (
    <>
      <section className="container flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">IELTS Doesn&apos;t Have to Be Scary.</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Practice with your personal AI IELTS coach, improve your weak areas, and build confidence before exam day.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild><Link href="/signup">Start Free Practice</Link></Button>
          <Button size="lg" variant="outline" asChild><Link href="/assessment">Take Level Test</Link></Button>
        </div>
        <p className="text-sm text-muted-foreground">Free to start. No credit card.</p>
      </section>

      <Section title="Preparing for IELTS can feel lonely and stressful" intro="Academies are expensive. Practice tests don't tell you why you lost marks. Speaking out loud in English feels scary when nobody is there to help.">
        <div className="grid gap-4 sm:grid-cols-3">
          {["Not sure where you stand", "No feedback on your mistakes", "Afraid to speak English"].map((t) => (
            <div key={t} className="rounded-2xl border bg-card p-5 text-sm font-medium">{t}</div>
          ))}
        </div>
      </Section>

      <Section title="Meet your AI IELTS coach" intro="IELTSMate gives you feedback on every answer, shows what to fix, and lets you try again, as many times as you like.">
        <FeatureGrid />
      </Section>

      <Section title="How it works"><Steps /></Section>

      <Section title="Confidence Mode" intro="Start easy. Move up when you're ready. Fear → easy practice → confidence → IELTS practice → exam confidence.">
        <div className="grid gap-4 md:grid-cols-3">
          {LEVELS.map((l, i) => (
            <div key={l.name} className="rounded-2xl border bg-card p-6">
              <p className="text-sm font-medium text-success">Level {i + 1}</p>
              <h3 className="text-lg font-semibold">{l.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{l.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="container py-12">
        <div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready for your first practice?</h2>
          <p className="mx-auto mt-2 max-w-lg opacity-90">Take the short level test and get your personal plan in a few minutes.</p>
          <Button size="lg" variant="secondary" className="mt-6" asChild><Link href="/signup">Start Free Practice</Link></Button>
        </div>
      </section>
    </>
  );
}
