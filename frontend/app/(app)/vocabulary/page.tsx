import type { Metadata } from "next";
import { Drill } from "@/components/practice/drill";

export const metadata: Metadata = { title: "Vocabulary practice" };

export default function VocabularyPage() {
  return <Drill kind="vocabulary" />;
}
