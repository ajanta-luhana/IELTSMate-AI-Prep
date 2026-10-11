import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingBlock } from "@/components/common/states";
import { TestPage } from "@/components/practice/test-page";

export const metadata: Metadata = { title: "Listening test" };

export default function ListeningTestPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading test" />}>
      <TestPage kind="listening" />
    </Suspense>
  );
}
