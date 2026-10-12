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


export type SkillKey = "speaking" | "writing" | "reading" | "listening" | "vocabulary";

export const SKILL_TABS: { key: SkillKey; label: string; headline: string; text: string; bullets: string[]; sample: { title: string; lines: string[] } }[] = [
  {
    key: "speaking", label: "Speaking", headline: "Speak out loud without feeling judged",
    text: "Answer examiner-style questions by voice. You check the transcript, then get feedback on fluency, vocabulary, grammar and coherence.",
    bullets: ["Parts 1, 2 and 3 questions", "Edit the transcript before it is scored", "Recordings are never stored"],
    sample: { title: "Sample feedback", lines: ["Fluency: good pace, a few long pauses", "Try: \"I am particularly keen on…\" instead of \"I like very much\"", "Estimated band: 6.0"] },
  },
  {
    key: "writing", label: "Writing", headline: "See exactly why you lost marks",
    text: "Paste a Task 1 or Task 2 essay and get comments on the four IELTS criteria, with stronger versions of your own sentences.",
    bullets: ["Task 1 and Task 2", "Criteria-by-criteria comments", "Improved sentence suggestions"],
    sample: { title: "Sample feedback", lines: ["Task response: position is clear, example is thin", "Grammar: watch article use (\"the\" vs no article)", "Estimated band: 6.5"] },
  },
  {
    key: "reading", label: "Reading", headline: "Original passages, instant marking",
    text: "Practise IELTS-style question types on passages written for IELTSMate. Every answer comes with an explanation.",
    bullets: ["Easy, intermediate and exam levels", "Timed or relaxed", "Explanations for every question"],
    sample: { title: "Sample result", lines: ["9 of 13 correct", "Weakest type: True / False / Not Given", "Estimated band: 6.0"] },
  },
  {
    key: "listening", label: "Listening", headline: "Listen, answer, and review the script",
    text: "Conversations and talks are read aloud by your browser, so you can practise anywhere. Review the transcript after you finish.",
    bullets: ["Replay as often as you like in easy mode", "Automatic marking", "Transcript shown after submission"],
    sample: { title: "Sample result", lines: ["7 of 10 correct", "Missed: numbers and spelling", "Estimated band: 5.5"] },
  },
  {
    key: "vocabulary", label: "Vocabulary and grammar", headline: "Short drills that fit into ten minutes",
    text: "Topic quizzes track your accuracy and point you to the areas that need work.",
    bullets: ["Topic-based quizzes", "Accuracy tracked over time", "Feeds into your study plan"],
    sample: { title: "Sample result", lines: ["Environment: 8 of 10", "Grammar: tenses 6 of 10", "Next drill: conditionals"] },
  },
];

export interface SampleTest { id: string; title: string; skill: SkillKey; level: "easy" | "intermediate" | "exam"; minutes: number }
export const SAMPLE_TESTS: SampleTest[] = [
  { id: "r1", title: "City bike schemes", skill: "reading", level: "easy", minutes: 20 },
  { id: "r2", title: "The history of tea", skill: "reading", level: "intermediate", minutes: 20 },
  { id: "r3", title: "Urban heat islands", skill: "reading", level: "exam", minutes: 20 },
  { id: "l1", title: "Booking a library room", skill: "listening", level: "easy", minutes: 10 },
  { id: "l2", title: "A talk on coastal erosion", skill: "listening", level: "intermediate", minutes: 12 },
  { id: "s1", title: "Describe a place you like", skill: "speaking", level: "easy", minutes: 5 },
  { id: "s2", title: "Technology and education", skill: "speaking", level: "exam", minutes: 8 },
  { id: "w1", title: "Describe a bar chart", skill: "writing", level: "intermediate", minutes: 20 },
  { id: "w2", title: "Opinion essay: remote work", skill: "writing", level: "exam", minutes: 40 },
  { id: "v1", title: "Environment vocabulary", skill: "vocabulary", level: "easy", minutes: 8 },
];

export const FAQS = [
  { q: "Is IELTSMate really free?", a: "Yes. Practice, feedback and progress tracking are free to use. The AI runs on open models, so there are no per-use charges." },
  { q: "Are the scores official?", a: "No. Every score is an estimated practice band. IELTSMate is not affiliated with IELTS, Cambridge, IDP or the British Council, and it cannot replace an official exam." },
  { q: "Are my speaking recordings saved?", a: "No. Audio is turned into text and discarded. Only the transcript and your feedback are saved to your account." },
  { q: "Do I need to start with the level test?", a: "It is optional, but it gives you a starting band and lets us build a study plan around your weak areas." },
  { q: "Where do the practice questions come from?", a: "They are written for IELTSMate. We do not copy Cambridge or other published IELTS material." },
];
