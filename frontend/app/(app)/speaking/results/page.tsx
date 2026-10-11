import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingBlock } from "@/components/common/states";
import { SpeakingResults } from "@/components/speaking/speaking-results";

export const metadata: Metadata = { title: "Speaking results" };

export default function SpeakingResultsPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading your results" />}>
      <SpeakingResults />
    </Suspense>
  );
}
