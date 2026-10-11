import type { Metadata } from "next";
import { Section } from "@/components/marketing/section";
import { Steps } from "@/components/marketing/steps";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <Section title="From first test to exam confidence" intro="Three simple steps. You can start practicing within a minute.">
      <Steps />
    </Section>
  );
}
