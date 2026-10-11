export type SpeakingMode = "confidence" | "practice" | "mock";

export interface SpeakingQuestion {
  id: string;
  part: 1 | 2 | 3;
  text: string;
  points: string[];
  prep_seconds: number;
  speak_seconds: number;
}
export interface SessionResponse {
  mode: SpeakingMode;
  questions: SpeakingQuestion[];
}
export interface TranscribeResponse {
  transcript: string;
  duration_seconds: number | null;
}
export interface Mistake {
  said: string;
  better: string;
  explanation: string;
}
export interface SpeakingStats {
  word_count: number;
  words_per_minute: number | null;
  filler_count: number;
  fillers: string[];
}
export interface SpeakingResult {
  id: string | null;
  mode: SpeakingMode;
  part: 1 | 2 | 3;
  question: string;
  transcript: string;
  overall_score: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  coherence: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  mistakes: Mistake[];
  better_answer: string;
  stats: SpeakingStats;
  pronunciation_note: string;
  note: string | null;
  created_at: string | null;
}
