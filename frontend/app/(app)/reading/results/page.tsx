import type { Metadata } from "next";
import { ResultsPage } from "@/components/practice/results-page";

export const metadata: Metadata = { title: "Reading results" };

export default function ReadingResultsPage() {
  return <ResultsPage kind="reading" />;
}
