import type { Metadata } from "next";
import { Section } from "@/components/marketing/section";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <Section title="About IELTSMate">
      <div className="max-w-2xl space-y-4 text-muted-foreground">
        <p>IELTSMate is a free AI IELTS coach designed to make IELTS preparation less stressful and more personalized.</p>
        <p>We believe good preparation shouldn&apos;t depend on expensive academies. Our practice content is original, and our AI runs on open-source models.</p>
        <p><strong className="text-foreground">Please note:</strong> scores in IELTSMate are AI-generated estimates for practice. They are not official IELTS scores. IELTSMate is an independent platform and is not affiliated with or endorsed by IELTS, Cambridge, IDP, or the British Council.</p>
      </div>
    </Section>
  );
}
