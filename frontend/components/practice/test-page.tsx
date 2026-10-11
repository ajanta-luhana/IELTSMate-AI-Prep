"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import type { PracticeKind } from "@/types/practice";
import { TestRunner } from "./test-runner";

export function TestPage({ kind }: { kind: PracticeKind }) {
  const id = useSearchParams().get("id");
  if (!id) {
    return (
      <EmptyState title="No test selected">
        <Button asChild className="mt-3"><Link href={`/${kind}`}>Choose a {kind} test</Link></Button>
      </EmptyState>
    );
  }
  return <TestRunner kind={kind} testId={id} />;
}
