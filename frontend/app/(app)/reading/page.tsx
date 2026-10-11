import type { Metadata } from "next";
import { TestList } from "@/components/practice/test-list";

export const metadata: Metadata = { title: "Reading practice" };

export default function ReadingPage() {
  return <TestList kind="reading" />;
}
