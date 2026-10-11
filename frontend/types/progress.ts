export interface SkillSummary {
  skill: string;
  latest: number | null;
  recent_average: number | null;
  attempts: number;
}
export interface SeriesPoint {
  week_start: string;
  value: number;
}
export interface DayCount {
  date: string;
  count: number;
}
export interface ProgressData {
  current_band: number | null;
  target_band: number | null;
  exam_date: string | null;
  days_to_exam: number | null;
  streak_days: number;
  practiced_today: boolean;
  activity_last_7_days: DayCount[];
  skills: SkillSummary[];
  vocabulary_accuracy: number | null;
  grammar_accuracy: number | null;
  series: Record<string, SeriesPoint[]>;
  recommendations: string[];
}
