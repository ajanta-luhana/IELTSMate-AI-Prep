import type { Metadata } from "next";
import { TestList } from "@/components/practice/test-list";

export const metadata: Metadata = { title: "Listening practice" };

export default function ListeningPage() {
  return <TestList kind="listening" />;
}
