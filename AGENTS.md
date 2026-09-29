# AGENTS.md — PlanIT Todo (Japandi × Baroque)

Context for AI coding assistants (Cursor, Copilot, Claude) working in this repo.

## 1. System Architecture Overview

- **Client-only.** Next.js App Router + React + Tailwind CSS v4 + Framer Motion + lucide-react. No API routes, no server actions, no database.
- **Persistence:** `window.localStorage` only, through the `useLocalStorage` hook. Two keys:
  - `PlanIT.tasks` → `Task[]`
  - `PlanIT.prefs` → `Preferences` (active view, category filter, show-completed)
- **Hydration model:** server and first client render output an empty shell. The hook reads localStorage in an effect, seeds sample tasks when the key is absent, then flips `hydrated` to `true`. Nothing is written before hydration, so stored data is never overwritten by defaults.
- `app/page.tsx` owns all state and passes data and callbacks down. Components are presentational.
- Deploys as a static-friendly app on Vercel or Netlify with zero environment variables.

## 2. UI/UX Style Guidelines

**Color tokens** (defined in `app/globals.css` under `@theme`)

| Token | Hex | Use |
| --- | --- | --- |
| `paper` | `#F3EFE6` | page canvas (washi) |
| `surface` | `#FAF8F5` | cards and panels |
| `line` | `#DCD6C8` | double-lined Baroque borders |
| `gold` | `#A38A52` | decorative strokes, dots, icons (never small text) |
| `bronze` | `#8A7243` | large accents, buttons with white-ish text at 16px+ bold |
| `bronze-ink` | `#6E5A31` | small accent text (passes WCAG AA on paper and surface) |
| `ink` | `#1C1B18` | body text |
| `muted` | `#5C584D` | secondary text (AA on paper and surface) |

Priority tags use earthy tone pairs: P1 madder (`#8C3B2E` on `#F1E1DB`), P2 ochre (`#6B5217` on `#F1E8CF`), P3 olive (`#4F5A35` on `#E6E8D6`).

**Typography:** Cormorant Garamond (`font-display`) for headings and kanji labels; Plus Jakarta Sans (`font-sans`) for all UI and body text. Body minimum 14px.

**Shape and ornament:** 12–16px radii. The `.frame` utility draws the double-line border (1px border + 1px outline offset 3px) — leave ~4px of space around framed elements. Line-art SVGs (plum branch, scroll divider) stay at ≤15% opacity and are `aria-hidden`.

**Layout:** three columns at `lg+` (`230px | 1fr | 300px`), stacked on mobile.

1. Left — `Sidebar`: views (Inbox, Today, Next 7 Days, Backlog) and category filter.
2. Center — `TaskList`: search, ⌘K button, add form, tasks.
3. Right — `RightPanel`: month calendar, 今日 summary, upcoming list.

**View rules:** Inbox = all tasks; Today = due today or overdue; Next 7 Days = due in the next 7 days; Backlog = no due date or due later than 7 days.

## 3. Data Model Schema

```jsonc
// localStorage["PlsnIT.tasks"]
[
  {
    "id": "8f0c…",                    // string, crypto.randomUUID()
    "title": "Draft API contract",     // string, non-empty
    "done": false,                     // boolean
    "priority": "Urgent & Important",  // "Urgent & Important" | "Important,Not Urgent" | "Urgent,Not Important" | "Not Important & Not Urgent
    "category": "Work",                 // "Work" | "Personal" | "Learning" | "Admin
    "dueDate": "2026-10-02",           // "YYYY-MM-DD" (local date) or null
    "createdAt": "2026-09-29T09:00:00.000Z",
    "completedAt": null                // ISO string or null
  }
]
// localStorage["PlanIT.prefs"]
{ "view": "inbox", "category": "All", "showDone": false }
```

Types live in `types/todo.ts`. If the schema changes, bump the key suffix (e.g. `PlanIT.tasks.v2`) and write a migration inside the hook's initializer.

## 4. Development Rules & Guardrails

- **Do NOT** introduce external databases or backends (Prisma, Supabase, PostgreSQL, Firebase, etc.), API routes, or network calls for app data.
- Keep all data operations **synchronous**: pure React state synchronized to localStorage by `useLocalStorage`. No async storage layers.
- Components never touch `localStorage` directly; only `hooks/useLocalStorage.ts` does. Wrap access in try/catch (private mode, quota).
- Mutate state with functional updates and immutable patterns; never mutate a `Task` in place.
- **Accessibility (WCAG AA):** keep text contrast ≥ 4.5:1 (3:1 for large text and UI borders). Use `bronze-ink`, not `gold`, for small text. Preserve visible focus rings, `aria-*` labels on icon buttons, `role="dialog"` on the palette, and `prefers-reduced-motion` support (`MotionConfig reducedMotion="user"`).
- Any new color must be added as a token in `globals.css` and checked for contrast before use.
- Keep ornament decorative: it must never carry information and must be `aria-hidden`.

## 5. Component Hierarchy & File Structure

```
AGENTS.md
app/
  layout.tsx            fonts, metadata
  globals.css           Tailwind import, tokens, .frame, focus + motion rules
  page.tsx              state owner, filtering, ⌘K listener
components/
  Sidebar.tsx           views + category filter
  TaskList.tsx          search, add form, animated list
    TaskItem.tsx        row: checkbox, tags, inline edit, delete
  RightPanel.tsx        calendar, 今日 summary, upcoming, watermark
  CommandPalette.tsx    ⌘K overlay: add task, filter, jump to view
hooks/
  useLocalStorage.ts    hydration-safe persistent state
lib/
  tasks.ts              date helpers, seed data, view/search/sort logic
types/
  todo.ts               Task, Preferences, unions
```

Tree: `page` → `Sidebar`, `TaskList` → `TaskItem`*, `RightPanel`, `CommandPalette`.
