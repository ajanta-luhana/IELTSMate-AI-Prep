import { STEPS } from "@/lib/marketing-content";

export function Steps() {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {STEPS.map((s, i) => (
        <li key={s.title} className="rounded-2xl border bg-card p-6">
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
          <h3 className="font-semibold">{s.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
