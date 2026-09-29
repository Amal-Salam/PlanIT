'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Command, Plus, Search } from 'lucide-react';
import type { Category, Priority, Task } from '@/types/todo';
import { CATEGORIES, PRIORITIES } from '@/types/todo';
import TaskItem from './TaskItem';

export interface NewTask {
  title: string;
  priority: Priority;
  category: Category;
  dueDate: string | null;
}

interface Props {
  title: string;
  tasks: Task[];
  today: string;
  query: string;
  onQuery: (q: string) => void;
  showDone: boolean;
  onShowDone: (v: boolean) => void;
  onAdd: (t: NewTask) => void;
  onToggle: (id: string) => void;
  onSave: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onOpenPalette: () => void;
}

export default function TaskList(p: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Important,Not Urgent');
  const [category, setCategory] = useState<Category>('Personal');
  const [due, setDue] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    p.onAdd({ title: title.trim(), priority, category, dueDate: due || null });
    setTitle('');
    setDue('');
  };

  const field = 'rounded-lg border border-line bg-paper px-2 py-2 text-sm';

  return (
    <section aria-label={p.title} className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center gap-3">
        <h2 className="mr-auto font-display text-4xl font-semibold tracking-tight">{p.title}</h2>
        <label className="frame flex items-center gap-2 px-3 py-2 text-sm">
          <Search size={16} className="text-muted" aria-hidden />
          <input
            type="search"
            value={p.query}
            onChange={(e) => p.onQuery(e.target.value)}
            placeholder="Search title or tag"
            aria-label="Search tasks"
            className="w-44 bg-transparent outline-none placeholder:text-muted"
          />
        </label>
        <button
          onClick={p.onOpenPalette}
          className="frame flex items-center gap-2 px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
          aria-label="Open command palette"
        >
          <Command size={14} aria-hidden /> K
        </button>
      </header>

      <form onSubmit={submit} className="frame flex flex-wrap items-center gap-2 p-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          aria-label="New task title"
          className={`${field} min-w-48 flex-1`}
        />
        <select aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={field}>
          {PRIORITIES.map((x) => <option key={x}>{x}</option>)}
        </select>
        <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value as Category)} className={field}>
          {CATEGORIES.map((x) => <option key={x}>{x}</option>)}
        </select>
        <input aria-label="Due date" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={field} />
        <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-bronze-ink px-4 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90">
          <Plus size={16} aria-hidden /> Add task
        </button>
      </form>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={p.showDone} onChange={(e) => p.onShowDone(e.target.checked)} className="accent-bronze-ink8%,31%)]" />
        Show completed
      </label>

      {p.tasks.length === 0 ? (
        <p className="frame p-8 text-center text-sm text-muted">
          No tasks here. Add one above, or press ⌘K to add or filter from the keyboard.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {p.tasks.map((t) => (
              <TaskItem key={t.id} task={t} today={p.today} onToggle={p.onToggle} onSave={p.onSave} onDelete={p.onDelete} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
