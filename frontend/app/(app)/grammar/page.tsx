import type { Metadata } from "next";
import { Drill } from "@/components/practice/drill";

export const metadata: Metadata = { title: "Grammar practice" };

export default function GrammarPage() {
  return <Drill kind="grammar" />;
}
