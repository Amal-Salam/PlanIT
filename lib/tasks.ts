import type { Task, ViewId } from '@/types/todo';

export const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const fromYMD = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (ymd: string, n: number) => {
  const d = fromYMD(ymd);
  d.setDate(d.getDate() + n);
  return toYMD(d);
};

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function makeTask(p: Partial<Task> & { title: string }): Task {
  return {
    id: uid(),
    done: false,
    priority: 'Important,Not Urgent',
    category: 'Admin',
    dueDate: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    ...p,
  };
}

export function seedTasks(): Task[] {
  const t = toYMD(new Date());
  return [
    makeTask({
      title: 'Sketch the onboarding flow',
      priority: 'Urgent & Important',
      category: 'Work',
      dueDate: t,
    }),
    makeTask({
      title: 'Draft the REST endpoints for sync',
      priority: 'Urgent & Important',
      category: 'Work',
      dueDate: addDays(t, 1),
    }),
    makeTask({
      title: 'Refactor the settings module',
      priority: 'Important,Not Urgent',
      category: 'Work',
      dueDate: addDays(t, 3),
    }),
    makeTask({
      title: 'Choose a paper texture for the landing page',
      priority: 'Urgent,Not Important',
      category: 'Personal',
      dueDate: addDays(t, 6),
    }),
    makeTask({
      title: 'Write rate-limit notes for the API guide',
      priority: 'Important,Not Urgent',
      category: 'Learning',
    }),
    makeTask({
      title: 'Audit color contrast across all views',
      priority: 'Not Important,Not Urgent',
      category: 'Personal',
      dueDate: addDays(t, 14),
    }),
    makeTask({
      title: 'Set up the release checklist',
      priority: 'Important,Not Urgent',
      category: 'Admin',
      done: true,
      completedAt: new Date().toISOString(),
    }),
  ];
}

export function inView(task: Task, view: ViewId, today: string): boolean {
  const d = task.dueDate;
  switch (view) {
    case 'inbox':
      return true;
    case 'today':
      return d !== null && d <= today;
    case 'next7':
      return d !== null && d >= today && d <= addDays(today, 7);
    case 'backlog':
      return d === null || d > addDays(today, 7);
  }
}

export function matchesQuery(task: Task, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${task.title} ${task.category} ${task.priority}`.toLowerCase().includes(q);
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.priority !== b.priority) return a.priority < b.priority ? -1 : 1;
    if (a.dueDate !== b.dueDate) {
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate < b.dueDate ? -1 : 1;
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

export function formatDue(ymd: string, today: string): string {
  if (ymd === today) return 'Today';
  if (ymd === addDays(today, 1)) return 'Tomorrow';
  const label = fromYMD(ymd).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  return ymd < today ? `Overdue · ${label}` : label;
}
