"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAMPLE_TESTS, type SkillKey } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

const FILTERS: { key: SkillKey | "all"; label: string }[] = [
  { key: "all", label: "All" }, { key: "reading", label: "Reading" }, { key: "listening", label: "Listening" },
  { key: "speaking", label: "Speaking" }, { key: "writing", label: "Writing" }, { key: "vocabulary", label: "Vocabulary" },
];
const LEVEL_STYLE = { easy: "bg-success/15 text-success", intermediate: "bg-warning/20 text-warning-foreground", exam: "bg-primary/10 text-primary" };
const LEVEL_LABEL = { easy: "Easy", intermediate: "Intermediate", exam: "Exam" };

export function PracticePreview() {
  const [filter, setFilter] = useState<SkillKey | "all">("all");
  const [query, setQuery] = useState("");
  const shown = useMemo(
    () => SAMPLE_TESTS.filter((t) => (filter === "all" || t.skill === filter) && t.title.toLowerCase().includes(query.trim().toLowerCase())),
    [filter, query],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by skill">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn("h-9 rounded-full border px-4 text-sm transition-colors", filter === f.key ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-64">
          <span className="sr-only">Search practice sets</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics"
            className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm"
          />
        </label>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <li key={t.id} className="group rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", LEVEL_STYLE[t.level])}>{LEVEL_LABEL[t.level]}</span>
              <span className="text-xs capitalize text-muted-foreground">{t.skill} · {t.minutes} min</span>
            </div>
            <h3 className="mt-3 font-semibold leading-snug">{t.title}</h3>
            <Link href="/signup" className="mt-3 inline-block text-sm font-medium text-primary group-hover:underline">Sign up to practise</Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No practice sets match. Clear the search or choose another skill.
        </div>
      )}
      <div className="text-center"><Button variant="outline" asChild><Link href="/signup">See the full library</Link></Button></div>
    </div>
  );
}
