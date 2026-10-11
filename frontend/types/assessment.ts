import type { Skill } from "@/types/profile";

export type Section = "grammar" | "vocabulary" | "reading";

export interface AssessmentQuestion {
  id: string;
  section: Section;
  prompt: string;
  options: string[];
  passage_id: string | null;
}

export interface AssessmentStart {
  questions: AssessmentQuestion[];
  passages: Record<string, string>;
}

export interface Goals {
  target_band: number;
  exam_date: string | null;
  hardest_skill: Skill;
}

export interface SectionResult {
  section: Section;
  correct: number;
  total: number;
  band: number;
}

export interface AssessmentResult {
  overall_score: number;
  grammar_score: number | null;
  vocabulary_score: number | null;
  reading_score: number | null;
  speaking_score: number | null;
  sections: SectionResult[];
  weakest_section: Section | null;
  speaking_note: string;
  created_at: string | null;
}
