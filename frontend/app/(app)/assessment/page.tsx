import type { Metadata } from "next";
import { AssessmentFlow } from "@/components/assessment/assessment-flow";

export const metadata: Metadata = { title: "Level test" };

export default function AssessmentPage() {
  return <AssessmentFlow />;
}
