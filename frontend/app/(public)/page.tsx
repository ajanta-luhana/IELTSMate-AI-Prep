import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfidencePicker } from "@/components/marketing/confidence-picker";
import { Faq } from "@/components/marketing/faq";
import { PracticePreview } from "@/components/marketing/practice-preview";
import { Section } from "@/components/marketing/section";
import { SkillTabs } from "@/components/marketing/skill-tabs";
import { Steps } from "@/components/marketing/steps";
import { TryQuestion } from "@/components/marketing/try-question";

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-b from-secondary/70 to-background">
        <div className="container grid items-center gap-10 py-14 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">IELTS doesn&apos;t have to be scary.</h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Practise all four skills with a free AI coach. See what went wrong, fix it, and try again until you feel ready.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild><Link href="/signup">Start free practice</Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/how-it-works">See how it works</Link></Button>
            </div>
            <p className="text-sm text-muted-foreground">Free to start. No credit card. Scores are estimates, not official IELTS results.</p>
          </div>
          <TryQuestion />
        </div>
      </section>

      <Section title="Practise every skill" intro="Pick a skill to see what the feedback looks like.">
        <SkillTabs />
      </Section>

      <Section title="Browse the practice library" intro="Filter by skill or search by topic. Sign up to open any set.">
        <PracticePreview />
      </Section>

      <section className="bg-secondary/50">
        <Section title="How it works" intro="Three steps from your first test to a personal plan.">
          <Steps />
        </Section>
      </section>

      <Section title="Confidence mode" intro="Start easy and move up when you are ready. Choose a level to see what changes.">
        <ConfidencePicker />
      </Section>

      <Section title="Common questions">
        <div className="max-w-3xl"><Faq /></div>
      </Section>

      <section className="container py-12">
        <div className="rounded-2xl bg-gradient-to-r from-sidebar to-primary px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Take your first practice today</h2>
          <p className="mx-auto mt-2 max-w-lg text-white/80">The level test takes a few minutes and gives you a starting band and a study plan.</p>
          <Button size="lg" variant="secondary" className="mt-6" asChild><Link href="/signup">Create free account</Link></Button>
        </div>
      </section>
    </>
  );
}
