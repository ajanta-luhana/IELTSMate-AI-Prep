export type WritingTask = "academic_task1" | "general_task1" | "task2";

export interface SentenceFix {
  original: string;
  improved: string;
  explanation: string;
}
export interface VocabUpgrade {
  original: string;
  better: string;
}
export interface WritingResult {
  id: string | null;
  task_type: WritingTask;
  prompt: string | null;
  word_count: number;
  min_words: number;
  under_length: boolean;
  overall_score: number;
  task_response: number;
  coherence: number;
  vocabulary: number;
  grammar: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  sentence_fixes: SentenceFix[];
  vocabulary_upgrades: VocabUpgrade[];
  next_band_steps: string[];
  note: string | null;
  created_at: string | null;
}
