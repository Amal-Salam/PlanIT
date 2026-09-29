'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import TaskList, { type NewTask } from '@/components/TaskList';
import RightPanel from '@/components/RightPanel';
import CommandPalette from '@/components/CommandPalette';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { inView, makeTask, matchesQuery, seedTasks, sortTasks, toYMD } from '@/lib/tasks';
import { DEFAULT_PREFS, type Category, type Preferences, type Task, type ViewId } from '@/types/todo';

const TITLES: Record<ViewId, string> = {
  inbox: 'Inbox',
  today: 'Today',
  next7: 'Next 7 Days',
  backlog: 'Backlog',
};

export default function Page() {
  const [tasks, setTasks, tasksReady] = useLocalStorage<Task[]>('washi.tasks', seedTasks);
  const [prefs, setPrefs, prefsReady] = useLocalStorage<Preferences>('washi.prefs', DEFAULT_PREFS);
  const [query, setQuery] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const today = toYMD(new Date());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const add = useCallback(
    (t: Partial<NewTask> & { title: string }) => setTasks((prev) => [makeTask(t), ...prev]),
    [setTasks],
  );
  const toggle = useCallback(
    (id: string) =>
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, done: !t.done, completedAt: t.done ? null : new Date().toISOString() } : t,
        ),
      ),
    [setTasks],
  );
  const save = useCallback(
    (id: string, patch: Partial<Task>) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    [setTasks],
  );
  const remove = useCallback((id: string) => setTasks((prev) => prev.filter((t) => t.id !== id)), [setTasks]);

  const setView = useCallback((view: ViewId) => setPrefs((p) => ({ ...p, view })), [setPrefs]);
  const setCategory = useCallback((category: Category | 'All') => setPrefs((p) => ({ ...p, category })), [setPrefs]);
  const setShowDone = useCallback((showDone: boolean) => setPrefs((p) => ({ ...p, showDone })), [setPrefs]);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const addFromPalette = useCallback((title: string) => add({ title }), [add]);

  const visible = useMemo(
    () =>
      sortTasks(
        tasks.filter(
          (t) =>
            inView(t, prefs.view, today) &&
            (prefs.category === 'All' || t.category === prefs.category) &&
            (prefs.showDone || !t.done) &&
            matchesQuery(t, query),
        ),
      ),
    [tasks, prefs, query, today],
  );

  const counts = useMemo(() => {
    const open = tasks.filter((t) => !t.done);
    return {
      inbox: open.length,
      today: open.filter((t) => inView(t, 'today', today)).length,
      next7: open.filter((t) => inView(t, 'next7', today)).length,
      backlog: open.filter((t) => inView(t, 'backlog', today)).length,
    } satisfies Record<ViewId, number>;
  }, [tasks, today]);

  if (!tasksReady || !prefsReady) return <div className="min-h-screen bg-paper" aria-busy="true" />;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto grid max-w-[1400px] gap-8 p-4 sm:p-8 lg:grid-cols-[230px_minmax(0,1fr)_300px]">
        <Sidebar view={prefs.view} onView={setView} counts={counts} category={prefs.category} onCategory={setCategory} />
        <main>
          <TaskList
            title={TITLES[prefs.view]}
            tasks={visible}
            today={today}
            query={query}
            onQuery={setQuery}
            showDone={prefs.showDone}
            onShowDone={setShowDone}
            onAdd={add}
            onToggle={toggle}
            onSave={save}
            onDelete={remove}
            onOpenPalette={() => setPaletteOpen(true)}
          />
        </main>
        <RightPanel tasks={tasks} today={today} />
      </div>
      <CommandPalette
        open={paletteOpen}
        onClose={closePalette}
        onAdd={addFromPalette}
        onView={setView}
        onCategory={setCategory}
        onQuery={setQuery}
      />
    </MotionConfig>
  );
}
