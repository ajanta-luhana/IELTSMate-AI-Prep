import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingBlock } from "@/components/common/states";
import { TestPage } from "@/components/practice/test-page";

export const metadata: Metadata = { title: "Reading test" };

export default function ReadingTestPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading test" />}>
      <TestPage kind="reading" />
    </Suspense>
  );
}
