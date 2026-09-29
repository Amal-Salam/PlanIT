'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task } from '@/types/todo';
import { formatDue, fromYMD, toYMD } from '@/lib/tasks';

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function RightPanel({ tasks, today }: { tasks: Task[]; today: string }) {
  const [offset, setOffset] = useState(0);
  const now = fromYMD(today);
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const daysIn = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;

  const open = useMemo(() => tasks.filter((t) => !t.done && t.dueDate), [tasks]);
  const dueCount = useMemo(() => {
    const m = new Map<string, number>();
    open.forEach((t) => m.set(t.dueDate as string, (m.get(t.dueDate as string) ?? 0) + 1));
    return m;
  }, [open]);
  const dueToday = open.filter((t) => (t.dueDate as string) <= today).length;
  const upcoming = open
    .filter((t) => (t.dueDate as string) >= today)
    .sort((a, b) => ((a.dueDate as string) < (b.dueDate as string) ? -1 : 1))
    .slice(0, 4);

  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];

  return (
    <aside className="frame relative h-fit overflow-hidden p-5 lg:sticky lg:top-8" aria-label="Calendar and timeline">
      <svg viewBox="0 0 220 200" className="pointer-events-none absolute -bottom-4 -right-4 w-56 text-gold opacity-15" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
        <path d="M8 195C60 160 92 146 128 96S190 34 214 8" />
        <path d="M60 165c-4-20 6-30 20-36M128 96c14 0 28-6 34-18M100 128c-2 14 4 22 16 28" />
        {[[214, 8], [162, 78], [80, 129], [116, 156], [34, 180]].map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            {[0, 72, 144, 216, 288].map((r) => (
              <circle key={r} cx="0" cy="-7" r="5" transform={`rotate(${r})`} />
            ))}
            <circle r="1.6" />
          </g>
        ))}
      </svg>

      <div className="relative">
        <h2 className="font-display text-3xl font-semibold">
           <span className="text-lg text-bronze-ink">Today</span>
        </h2>
        <p className="mt-1 text-sm text-muted">
          {now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })} ·{' '}
          {dueToday === 0 ? 'nothing due' : `${dueToday} due or overdue`}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">
            {first.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex">
            <button aria-label="Previous month" onClick={() => setOffset((o) => o - 1)} className="rounded-lg p-1.5 text-muted hover:bg-paper"><ChevronLeft size={16} /></button>
            <button aria-label="Next month" onClick={() => setOffset((o) => o + 1)} className="rounded-lg p-1.5 text-muted hover:bg-paper"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-xs" role="grid" aria-label="Month">
          {DOW.map((d, i) => <span key={i} className="py-1 text-muted" aria-hidden>{d}</span>)}
          {cells.map((d, i) => {
            if (d === null) return <span key={`b${i}`} />;
            const ymd = toYMD(new Date(first.getFullYear(), first.getMonth(), d));
            const n = dueCount.get(ymd) ?? 0;
            return (
              <span
                key={ymd}
                aria-label={`${ymd}${n ? `, ${n} due` : ''}`}
                className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full tabular-nums ${
                  ymd === today ? 'bg-bronze-ink font-semibold text-surface' : ''
                }`}
              >
                {d}
                {n > 0 && ymd !== today && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-bronze" />}
              </span>
            );
          })}
        </div>

        <h3 className="mt-6 font-display text-xl font-semibold">
           <span className="text-base text-bronze-ink">Coming up</span>
        </h3>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nothing scheduled.</p>
        ) : (
          <ol className="mt-2 flex flex-col gap-2 border-l border-line pl-4">
            {upcoming.map((t) => (
              <li key={t.id} className="text-sm">
                <span className="block truncate">{t.title}</span>
                <span className="text-xs text-muted">{formatDue(t.dueDate as string, today)} · {t.priority}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}
