import type { Metadata } from "next";
import { PlanView } from "@/components/plan/plan-view";

export const metadata: Metadata = { title: "Study plan" };

export default function StudyPlanPage() {
  return <PlanView />;
}
