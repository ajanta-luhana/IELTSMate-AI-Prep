import type { SeriesPoint } from "@/types/progress";

interface Props {
  points: SeriesPoint[];
  label: string;
  target?: number | null;
}

const W = 560;
const H = 220;
const PAD = { l: 36, r: 16, t: 14, b: 28 };

/** Dependency-free SVG line chart. Y axis is IELTS bands (0-9, zoomed to the data). */
export function LineChart({ points, label, target }: Props) {
  if (points.length === 0) {
    return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No scores yet. Practise this skill and your trend will appear here.</p>;
  }
  const values = points.map((p) => p.value).concat(typeof target === "number" ? [target] : []);
  const min = Math.max(0, Math.floor(Math.min(...values) - 0.5));
  const max = Math.min(9, Math.ceil(Math.max(...values) + 0.5));
  const span = Math.max(1, max - min);
  const x = (i: number) => PAD.l + (points.length === 1 ? (W - PAD.l - PAD.r) / 2 : (i * (W - PAD.l - PAD.r)) / (points.length - 1));
  const y = (v: number) => PAD.t + (1 - (v - min) / span) * (H - PAD.t - PAD.b);
  const ticks: number[] = [];
  for (let v = min; v <= max; v += 1) ticks.push(v);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">{t}</text>
          </g>
        ))}
        {typeof target === "number" && (
          <g>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(target)} y2={y(target)} className="stroke-warning" strokeWidth={1.5} strokeDasharray="5 4" />
            <text x={W - PAD.r} y={y(target) - 5} textAnchor="end" className="fill-muted-foreground text-[11px]">Target {target.toFixed(1)}</text>
          </g>
        )}
        <path d={path} fill="none" className="stroke-primary" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={p.week_start}>
            <circle cx={x(i)} cy={y(p.value)} r={4.5} className="fill-primary stroke-card" strokeWidth={2} />
            <text x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">{fmt(p.week_start)}</text>
          </g>
        ))}
      </svg>
      <figcaption className="sr-only">
        {label}: {points.map((p) => `week of ${fmt(p.week_start)}, band ${p.value.toFixed(1)}`).join("; ")}.
      </figcaption>
    </figure>
  );
}
