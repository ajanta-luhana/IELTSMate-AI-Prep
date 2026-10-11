export type PlanSkill = "reading" | "listening" | "speaking" | "writing" | "vocabulary" | "grammar";

export interface PlanTask {
  skill: PlanSkill;
  title: string;
  minutes: number;
  href: string;
}
export interface PlanDay {
  day: string;
  tasks: PlanTask[];
}
export interface PlanWeek {
  week: number;
  focus: string;
  level: "easy" | "intermediate" | "exam";
  days: PlanDay[];
}
export interface StudyPlan {
  id: string | null;
  summary: string;
  weeks_total: number;
  daily_minutes: number;
  current_band: number;
  target_band: number;
  exam_date: string | null;
  focus_skills: PlanSkill[];
  weeks: PlanWeek[];
  coach_note: string | null;
  created_at: string | null;
}
