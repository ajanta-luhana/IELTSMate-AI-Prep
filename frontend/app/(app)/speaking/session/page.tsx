import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingBlock } from "@/components/common/states";
import { SpeakingSession } from "@/components/speaking/speaking-session";

export const metadata: Metadata = { title: "Speaking session" };

export default function SpeakingSessionPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Preparing your questions" />}>
      <SpeakingSession />
    </Suspense>
  );
}
