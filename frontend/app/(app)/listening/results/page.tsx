import type { Metadata } from "next";
import { ResultsPage } from "@/components/practice/results-page";

export const metadata: Metadata = { title: "Listening results" };

export default function ListeningResultsPage() {
  return <ResultsPage kind="listening" />;
}
