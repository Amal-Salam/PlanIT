'use client';

import { Archive, CalendarRange, Inbox, Sun } from 'lucide-react';
import type { Category, ViewId } from '@/types/todo';
import { CATEGORIES } from '@/types/todo';

const VIEWS: { id: ViewId; label: string;  Icon: typeof Inbox }[] = [
  { id: 'inbox', label: 'Inbox',  Icon: Inbox },
  { id: 'today', label: 'Today',  Icon: Sun },
  { id: 'next7', label: 'Next 7 Days',  Icon: CalendarRange },
  { id: 'backlog', label: 'Backlog',  Icon: Archive },
];

interface Props {
  view: ViewId;
  onView: (v: ViewId) => void;
  counts: Record<ViewId, number>;
  category: Category | 'All';
  onCategory: (c: Category | 'All') => void;
}

export default function Sidebar({ view, onView, counts, category, onCategory }: Props) {
  return (
    <aside className="frame h-fit p-5 lg:sticky lg:top-8" aria-label="Views">
      <h1 className="font-display text-3xl font-semibold tracking-tight">PlanIT</h1>
      <svg viewBox="0 0 200 12" className="my-3 h-3 w-full text-gold" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
        <path d="M0 6h82M118 6h82" />
        <path d="M88 6c4-6 8-6 12 0s8 6 12 0" />
        <path d="M100 2l3 4-3 4-3-4z" />
      </svg>
      <nav className="mt-4 flex flex-col gap-1">
        {VIEWS.map(({ id, label, Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => onView(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                active ? 'bg-paper font-semibold text-ink ring-1 ring-line' : 'text-muted hover:bg-paper'
              }`}
            >
              <Icon size={16} className={active ? 'text-bronze-ink' : ''} aria-hidden />
              <span className="flex-1">{label}</span>
              <span className="font-display text-base text-gold" aria-hidden></span>
              <span className="min-w-5 text-right text-xs tabular-nums">{counts[id]}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-6 border-t border-line pt-4">
        <h2 className="mb-2 px-3 font-display text-lg font-semibold">Tags</h2>
        <div className="flex flex-wrap gap-2 px-3">
          {(['All', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => onCategory(c)}
              aria-pressed={category === c}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                category === c ? 'border-bronze-ink bg-bronze-ink text-surface' : 'border-line text-muted hover:border-bronze'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
