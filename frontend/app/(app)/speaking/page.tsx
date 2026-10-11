import type { Metadata } from "next";
import { ModePicker } from "@/components/speaking/mode-picker";

export const metadata: Metadata = { title: "Speaking Coach" };

export default function SpeakingPage() {
  return <ModePicker />;
}
