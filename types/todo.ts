export type Priority = 'Urgent & Important' | 'Important,Not Urgent' | 'Urgent,Not Important'| 'Not Important,Not Urgent';
export type Category = 'Work' | 'Personal' | 'Learning' | 'Admin';
export type ViewId = 'inbox' | 'today' | 'next7' | 'backlog';

export const PRIORITIES: Priority[] = ['Urgent & Important', 'Important,Not Urgent', 'Urgent,Not Important','Not Important,Not Urgent'];
export const CATEGORIES: Category[] = ['Work', 'Personal', 'Learning','Admin'];

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  category: Category;
  /** Local date, "YYYY-MM-DD", or null when unscheduled. */
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Preferences {
  view: ViewId;
  category: Category | 'All';
  showDone: boolean;
}

export const DEFAULT_PREFS: Preferences = { view: 'inbox', category: 'All', showDone: false };
