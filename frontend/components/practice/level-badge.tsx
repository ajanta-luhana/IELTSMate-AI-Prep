import { cn } from "@/lib/utils";
import type { Level } from "@/types/practice";

const LABEL: Record<Level, string> = { easy: "Easy", intermediate: "Intermediate", exam: "Exam mode" };
const STYLE: Record<Level, string> = {
  easy: "bg-success/15 text-success",
  intermediate: "bg-primary/10 text-primary",
  exam: "bg-secondary text-secondary-foreground",
};

export const levelLabel = (l: Level) => LABEL[l];

export function LevelBadge({ level }: { level: Level }) {
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STYLE[level])}>{LABEL[level]}</span>;
}
