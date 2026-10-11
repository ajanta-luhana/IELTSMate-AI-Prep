import type { Metadata } from "next";
import { WritingEditor } from "@/components/writing/writing-editor";

export const metadata: Metadata = { title: "Writing Coach" };

export default function WritingPage() {
  return <WritingEditor />;
}
