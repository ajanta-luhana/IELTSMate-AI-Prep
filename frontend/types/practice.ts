export type Level = "easy" | "intermediate" | "exam";
export type QuestionType = "mcq" | "tfng" | "ynng" | "completion" | "matching";
export type PracticeKind = "reading" | "listening";

export interface PublicQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  hint: string | null;
}
export interface ScriptLine {
  speaker: string;
  text: string;
}
export interface TestSummary {
  id: string;
  title: string;
  level: Level;
  minutes: number;
  question_count: number;
  best_band: number | null;
}
export interface TestDetail {
  id: string;
  title: string;
  level: Level;
  minutes: number;
  passage: string | null;
  script: ScriptLine[] | null;
  questions: PublicQuestion[];
}
export interface QuestionResult {
  id: string;
  prompt: string;
  correct: boolean;
  your_answer: string | null;
  correct_answer: string;
  explanation: string;
}
export interface TestResult {
  test_id: string;
  title: string;
  correct: number;
  total: number;
  estimated_band: number;
  results: QuestionResult[];
  created_at: string | null;
}
export type Answer = number | string;

// vocabulary & grammar
export type DrillKind = "vocabulary" | "grammar";
export interface PracticeItem {
  id: string;
  kind: DrillKind;
  topic: string;
  prompt: string;
  options: string[];
}
export interface AnswerResult {
  correct: boolean;
  correct_index: number;
  explanation: string;
}
export interface TopicProgress {
  topic: string;
  attempts: number;
  correct: number;
  accuracy: number | null;
  weak: boolean;
}
export interface PracticeProgress {
  kind: DrillKind;
  topics: TopicProgress[];
  weak_topics: string[];
}
