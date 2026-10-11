import type { WritingTask } from "@/types/writing";

export const TASK_LABELS: Record<WritingTask, string> = {
  academic_task1: "Academic Task 1",
  general_task1: "General Training Task 1",
  task2: "Task 2 (essay)",
};

export const MIN_WORDS: Record<WritingTask, number> = { academic_task1: 150, general_task1: 150, task2: 250 };

// Original practice questions written for IELTSMate (not taken from any official test).
export const SAMPLE_PROMPTS: Record<WritingTask, string[]> = {
  task2: [
    "Some people believe children should start learning a foreign language at primary school, while others think it is better to wait until secondary school. Discuss both views and give your own opinion.",
    "More and more people now work from home instead of going to an office. Do the advantages of this trend outweigh the disadvantages?",
  ],
  general_task1: [
    "You recently stayed at a hotel and the service was disappointing. Write a letter to the hotel manager. Explain what happened, say why you were unhappy, and tell the manager what you would like him or her to do.",
  ],
  academic_task1: [
    "The table shows the percentage of households with internet access in four countries in 2005 and 2020. Country A: 35% then 92%. Country B: 20% then 78%. Country C: 55% then 95%. Country D: 8% then 60%. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
  ],
};
