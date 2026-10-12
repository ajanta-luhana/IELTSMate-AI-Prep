"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { SKILL_TABS } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

export function SkillTabs() {
  const [active, setActive] = useState(0);
  const tab = SKILL_TABS[active];

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") setActive((a) => (a + 1) % SKILL_TABS.length);
    if (e.key === "ArrowLeft") setActive((a) => (a - 1 + SKILL_TABS.length) % SKILL_TABS.length);
  }

  return (
    <div>
      <div role="tablist" aria-label="IELTS skills" onKeyDown={onKey} className="flex gap-1 overflow-x-auto border-b">
        {SKILL_TABS.map((t, i) => (
          <button
            key={t.key}
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={i === active}
            aria-controls="skill-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              i === active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="skill-panel" aria-labelledby={`tab-${tab.key}`} className="grid gap-8 py-8 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight">{tab.headline}</h3>
          <p className="text-muted-foreground">{tab.text}</p>
          <ul className="space-y-2">
            {tab.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />{b}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-secondary/60 p-6">
          <p className="text-sm font-medium">{tab.sample.title}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {tab.sample.lines.map((l) => <li key={l} className="rounded-lg bg-card p-3 shadow-sm">{l}</li>)}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Example only. Bands in IELTSMate are always estimates.</p>
        </div>
      </div>
    </div>
  );
}
