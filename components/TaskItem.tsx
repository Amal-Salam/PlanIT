'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Pencil, Save, Trash2, X } from 'lucide-react';
import type { Category, Priority, Task } from '@/types/todo';
import { CATEGORIES, PRIORITIES } from '@/types/todo';
import { formatDue } from '@/lib/tasks';

const PRIORITY_STYLE: Record<Priority, string> = {
  'Urgent & Important': 'bg-[#F1E1DB] text-[#8C3B2E]',
  'Important,Not Urgent': 'bg-[#F1E8CF] text-[#6B5217]',
  'Urgent,Not Important': 'bg-[#E6E8D6] text-[#4F5A35]',
  'Not Important,Not Urgent': 'bg-[#E8E8E8] text-[#555555]',
};

interface Props {
  task: Task;
  today: string;
  onToggle: (id: string) => void;
  onSave: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, today, onToggle, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [category, setCategory] = useState<Category>(task.category);
  const [due, setDue] = useState(task.dueDate ?? '');

  const startEdit = () => {
    setTitle(task.title);
    setPriority(task.priority);
    setCategory(task.category);
    setDue(task.dueDate ?? '');
    setEditing(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(task.id, { title: title.trim() || task.title, priority, category, dueDate: due || null });
    setEditing(false);
  };

  const field = 'rounded-lg border border-line bg-paper px-2 py-1.5 text-sm';
  const iconBtn = 'rounded-lg p-2 text-muted transition-colors hover:bg-paper hover:text-ink';

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="frame m-1 p-3"
    >
      {editing ? (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <input aria-label="Task title" value={title} onChange={(e) => setTitle(e.target.value)} className={`${field} min-w-48 flex-1`} autoFocus />
          <select aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={field}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value as Category)} className={field}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input aria-label="Due date" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={field} />
          <button type="submit" aria-label="Save changes" className={iconBtn}><Save size={16} /></button>
          <button type="button" aria-label="Cancel editing" onClick={() => setEditing(false)} className={iconBtn}><X size={16} /></button>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <button
            role="checkbox"
            aria-checked={task.done}
            aria-label={`Complete ${task.title}`}
            onClick={() => onToggle(task.id)}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
              task.done ? 'border-bronze-ink bg-bronze-ink text-surface' : 'border-bronze hover:bg-paper'
            }`}
          >
            {task.done && <Check size={14} strokeWidth={3} />}
          </button>
          <div className="min-w-0 flex-1">
            <p className={`truncate text-[15px] ${task.done ? 'text-muted line-through' : ''}`}>{task.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-semibold ${PRIORITY_STYLE[task.priority]}`}>{task.priority}</span>
              <span className="rounded-full border border-line px-2 py-0.5 text-muted">{task.category}</span>
              {task.dueDate && (
                <span className={task.dueDate < today && !task.done ? 'font-semibold text-[#8C3B2E]' : 'text-muted'}>
                  {formatDue(task.dueDate, today)}
                </span>
              )}
            </div>
          </div>
          <button aria-label={`Edit ${task.title}`} onClick={startEdit} className={iconBtn}><Pencil size={16} /></button>
          <button aria-label={`Delete ${task.title}`} onClick={() => onDelete(task.id)} className={iconBtn}><Trash2 size={16} /></button>
        </div>
      )}
    </motion.li>
  );
}
