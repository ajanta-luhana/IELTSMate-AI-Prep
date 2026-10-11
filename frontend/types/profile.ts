export type Skill = "speaking" | "writing" | "reading" | "listening";

export interface Profile {
  id: string;
  name: string;
  email: string;
  target_band: number | null;
  current_band: number | null;
  exam_date: string | null;
  daily_goal_minutes: number;
  hardest_skill: Skill | null;
  confidence_level: "easy" | "intermediate" | "exam";
  created_at: string | null;
}
