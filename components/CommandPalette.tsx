'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerDownLeft } from 'lucide-react';
import type { Category, ViewId } from '@/types/todo';

interface Item {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string) => void;
  onView: (v: ViewId) => void;
  onCategory: (c: Category | 'All') => void;
  onQuery: (q: string) => void;
}

function Palette({ onClose, onAdd, onView, onCategory, onQuery }: Omit<Props, 'open'>) {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);

  const items = useMemo<Item[]>(() => {
    const q = text.trim();
    const done = (fn: () => void) => () => { fn(); onClose(); };
    const base: Item[] = [
      { id: 'v-inbox', label: 'Go to Inbox', hint: 'View', run: done(() => onView('inbox')) },
      { id: 'v-today', label: 'Go to Today', hint: 'View', run: done(() => onView('today')) },
      { id: 'v-next7', label: 'Go to Next 7 Days', hint: 'View', run: done(() => onView('next7')) },
      { id: 'v-backlog', label: 'Go to Backlog', hint: 'View', run: done(() => onView('backlog')) },
      { id: 'c-all', label: 'Show all tags', hint: 'Filter', run: done(() => onCategory('All')) },
      { id: 'c-work', label: 'Filter by Work', hint: 'Filter', run: done(() => onCategory('Work')) },
      { id: 'c-personal', label: 'Filter by Personal', hint: 'Filter', run: done(() => onCategory('Personal')) },
      { id: 'c-learnin', label: 'Filter by Learning', hint: 'Filter', run: done(() => onCategory('Learning')) },
      { id: 'c-admin', label:'Filter by Admin', hint: 'Filter', run: done(() => onCategory('Admin'))},
      { id: 'q-clear', label: 'Clear search', hint: 'Filter', run: done(() => onQuery('')) },
    ];
    const matched = q ? base.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())) : base;
    const typed: Item[] = q
      ? [
          { id: 'add', label: `Add task “${q}”`, hint: 'Create', run: done(() => onAdd(q)) },
          { id: 'search', label: `Search for “${q}”`, hint: 'Filter', run: done(() => onQuery(q)) },
        ]
      : [];
    return [...typed, ...matched];
  }, [text, onClose, onAdd, onView, onCategory, onQuery]);

  const active = Math.min(index, Math.max(items.length - 1, 0));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((active + 1) % items.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((active - 1 + items.length) % items.length); }
    else if (e.key === 'Enter') { e.preventDefault(); items[active]?.run(); }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/30 px-4 pt-[15vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="frame m-1 w-full max-w-lg overflow-hidden shadow-xl"
        initial={{ y: -8, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: -8, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        onKeyDown={onKeyDown}
      >
        <input
          autoFocus
          value={text}
          onChange={(e) => { setText(e.target.value); setIndex(0); }}
          placeholder="Type a task to add, or a command"
          aria-label="Command"
          className="w-full border-b border-line bg-transparent px-4 py-3.5 text-[15px] outline-none placeholder:text-muted"
        />
        <ul className="max-h-72 overflow-y-auto p-2" role="listbox">
          {items.length === 0 && <li className="px-3 py-4 text-sm text-muted">No matching commands.</li>}
          {items.map((it, i) => (
            <li key={it.id} role="option" aria-selected={i === active}>
              <button
                onClick={it.run}
                onMouseMove={() => setIndex(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${i === active ? 'bg-paper' : ''}`}
              >
                <span className="flex-1 truncate">{it.label}</span>
                <span className="text-xs text-muted">{it.hint}</span>
                {i === active && <CornerDownLeft size={14} className="text-bronze-ink" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

export default function CommandPalette({ open, ...rest }: Props) {
  return <AnimatePresence>{open && <Palette {...rest} />}</AnimatePresence>;
}
