"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y rounded-xl border bg-card">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium hover:bg-accent/50"
              >
                {f.q}
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
              </button>
            </h3>
            {isOpen && <p id={`faq-${i}`} className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>}
          </li>
        );
      })}
    </ul>
  );
}
