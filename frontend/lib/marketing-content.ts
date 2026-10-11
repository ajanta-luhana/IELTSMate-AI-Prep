import { BookOpen, CalendarCheck, Headphones, Languages, Mic, PenLine, type LucideIcon } from "lucide-react";

export interface Feature {
  title: string;
  text: string;
  icon: LucideIcon;
}

export const FEATURES: Feature[] = [
  { title: "AI Speaking Coach", text: "Answer examiner-style questions out loud and get an estimated band, your mistakes, and tips for next time.", icon: Mic },
  { title: "AI Writing Feedback", text: "Paste your Task 1 or Task 2 essay and see feedback on all four criteria, with improved sentences.", icon: PenLine },
  { title: "Reading Practice", text: "Original IELTS-style passages and question types, scored instantly with clear explanations.", icon: BookOpen },
  { title: "Listening Practice", text: "Self-created audio scripts with structured questions and automatic marking.", icon: Headphones },
  { title: "Vocabulary & Grammar", text: "Topic-based quizzes that track your accuracy and point you to your weak areas.", icon: Languages },
  { title: "Study Plan & Progress", text: "A plan built around your target band, exam date and daily time, with charts to show you improving.", icon: CalendarCheck },
];

export const STEPS = [
  { title: "Take the level test", text: "A short check gives you an estimated starting band. No pressure." },
  { title: "Get your plan", text: "Tell us your target band, exam date and daily time. We build a plan around your weak spots." },
  { title: "Practice and improve", text: "Practice, see what went wrong, try again, and watch your estimated band climb." },
];

export const LEVELS = [
  { name: "Easy", text: "Short, friendly questions to get you speaking and writing without fear." },
  { name: "Intermediate", text: "Longer answers and trickier topics as your confidence grows." },
  { name: "Exam mode", text: "Full IELTS-style practice with real exam timing." },
];

