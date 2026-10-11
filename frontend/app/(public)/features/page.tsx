import type { Metadata } from "next";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Section } from "@/components/marketing/section";

export const metadata: Metadata = { title: "Features" };

export default function FeaturesPage() {
  return (
    <Section title="Everything you need to practice every day" intro="Practice → AI feedback → understand mistakes → practice again → track progress → build confidence.">
      <FeatureGrid />
    </Section>
  );
}
