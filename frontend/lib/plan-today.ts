import type { PlanTask, StudyPlan } from "@/types/plan";

/** Which day of the plan is "today", counting from the day the plan was made. */
export function todaysTasks(plan: StudyPlan, now: Date = new Date()): { label: string; tasks: PlanTask[] } | null {
  if (!plan.created_at || plan.weeks.length === 0) return null;
  const start = new Date(plan.created_at);
  if (Number.isNaN(start.getTime())) return null;
  const dayMs = 24 * 60 * 60 * 1000;
  const since = Math.floor((now.getTime() - start.getTime()) / dayMs);
  const index = Math.max(0, Math.min(plan.weeks.length * 7 - 1, since));
  const week = plan.weeks[Math.floor(index / 7)];
  const day = week?.days[index % 7];
  return week && day ? { label: `Week ${week.week} · ${day.day}`, tasks: day.tasks } : null;
}
