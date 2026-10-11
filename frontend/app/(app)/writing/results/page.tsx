import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingBlock } from "@/components/common/states";
import { WritingResults } from "@/components/writing/writing-results";

export const metadata: Metadata = { title: "Writing feedback" };

export default function WritingResultsPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading feedback" />}>
      <WritingResults />
    </Suspense>
  );
}
