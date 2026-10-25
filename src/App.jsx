import { useState, useEffect } from 'react';

/**
 * Vibecoding Project Tracker — starter scaffold.
 *
 * This file is intentionally almost empty. The boilerplate (Vite, React,
 * Tailwind) is configured for you, plus a few shared constants and a
 * localStorage helper. Everything visible on screen, you build.
 *
 * Where to start (build sequence in Phase 3):
 *   - M4  data-model    : render the four columns and the task cards below.
 *   - M5  crud-modal    : add the "+" button modal and the edit-on-click modal.
 *   - M6  tag-style     : feature vs. bug color coding (uses DESIGN.md §2 colors).
 *   - M7  task-owner    : assignee badge + "Hand off to..." dropdown.
 *   - M8  due-tint      : color cards by due date (uses DESIGN.md §2 due-state colors).
 *   - M9  context       : a curated Context briefing field on the modal.
 *   - M10 copy-prompt   : a "Copy as Prompt Context" button that serializes the task + context.
 *   - M11 anchors       : the Anchor Board above the Kanban.
 *   - M12 secret-sauce  : the one open-ended thing that makes your tracker yours.
 *
 * Search the file for `TODO M<n>` to find the right hook for each milestone.
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string} assignee
 * @property {string|null} dueDate     ISO 'YYYY-MM-DD'
 * @property {string} createdDate      ISO 'YYYY-MM-DD'
 */

// The four columns of the board, in render order.
// Use these IDs everywhere — do not invent new ones.
export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

// Replace these placeholders with the three names from PRD §8 before M4.
// They become the only valid values for `Task.assignee`.
export const TEAM = ['UI/UX Designer & QA Tester', 'Full-Stack Developer', 'Frontend Developer'];

/**
 * A tiny localStorage hook — survives reloads, no library needed.
 *
 * Usage:
 *   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', []);
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode error — silently ignore for hackathon */
    }
  }, [key, value]);

  return [value, setValue];
}

// M4 data-model: seed tasks shown on first load (before anything is saved).
const SEED_TASKS = [

    // TO DO
  {
    id: 'task-1',
    title: 'Add Copy as Prompt Context button',
    description: 'Generate and copy a formatted task briefing that can be pasted into an AI coding tool.',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[1],
    dueDate: '2026-10-30',
    createdDate: '2026-10-25',
  },
 // IN PROGRESS
  {
    id: 'task-2',
    title: 'Implement AI prompt context storage',
    description: 'Allow users to save AI prompts, tool names and useful context within each task.',
    type: 'feature',
    status: 'in-progress',
    assignee: TEAM[1],
    dueDate: '2026-10-28',
    createdDate: '2026-10-24',
  },
  // REVIEW
  {
    id: 'task-3',
    title: 'Review colour contrast',
    description: 'Check text, buttons and status indicators against WCAG 2.2 AA contrast requirements.',
    type: 'feature',
    status: 'review',
    assignee: TEAM[2],
    dueDate: '2026-10-27',
    createdDate: '2026-10-24',
  },
  // DONE
  {
    id: 'task-4',
    title: 'Build the four-column Kanban board',
    description: 'Create the To Do, In Progress, Review and Done columns with responsive task cards.',
    type: 'feature',
    status: 'done',
    assignee: TEAM[0],
    dueDate: '2026-10-23',
    createdDate: '2026-10-20',
  },  
];


// Shows an ISO date ('YYYY-MM-DD') as e.g. "27 Oct 2026".
function formatDate(iso) {
  if (!iso) return 'No due date';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function App() {
  // TODO M4 data-model:
  //   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', [/* 3-4 seed tasks */]);
  //
  // eslint-disable-next-line no-unused-vars
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);
  //
  // TODO M5 crud-modal:
  //   const [editing, setEditing] = useState(null);
  //
  // TODO M11 anchors:
  //   const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', [...]);

  return (
    <div className="min-h-screen p-6">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vibecoding Project Tracker
          </h1>
          <p className="text-sm text-slate-500">
            {/* Replace this line with your team name from PRD §11. */}
            VibeTrack · From prompt to progress
          </p>
        </div>
      </header>

      {/* TODO M11 anchors: render the Anchor Board (Presentation / Demo / Report / Documentation) above the board. */}

      {/*
        TODO M4 data-model:
          Render a Kanban board with the four columns from STAGES.
          Each column should display the tasks whose status matches its id.
          Pre-populate 3-4 mock tasks so the board isn't empty on first load.

        TODO M5 crud-modal:
          Add a "+" button that opens a modal with every Task field.
          Clicking a card should open the same modal in edit mode.
      */}
      <main
        aria-label="Task board"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STAGES.map((stage) => {
          const stageTasks = tasks.filter((task) => task.status === stage.id);
          const headingId = `column-${stage.id}`;

          return (
            <section
              key={stage.id}
              aria-labelledby={headingId}
              className="flex min-h-[12rem] flex-col rounded-xl border border-border-subtle bg-surface-column p-3"
            >
              <h2
                id={headingId}
                className="mb-3 flex items-center justify-between px-1 text-lg font-semibold text-text-primary"
              >
                {stage.label}
                <span className="rounded-full bg-surface-card px-2 py-0.5 text-sm font-medium text-text-muted">
                  <span className="sr-only">Number of tasks: </span>
                  {stageTasks.length}
                </span>
              </h2>

              {stageTasks.length === 0 ? (
                <p className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border-subtle p-4 text-sm text-text-muted">
                  No tasks here yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {stageTasks.map((task) => (
                    <li key={task.id}>
                      <article className="rounded-xl border border-border-subtle bg-surface-card p-4 transition-shadow hover:shadow-md">
                        <p className="mb-1 text-sm font-medium text-text-muted">
                          {task.type === 'bug' ? 'Bug' : 'Feature'}
                        </p>
                        <h3 className="break-words text-base font-medium text-text-primary">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 break-words text-sm text-text-muted">
                            {task.description}
                          </p>
                        )}
                        <dl className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-text-muted">
                          <div>
                            <dt className="sr-only">Assignee</dt>
                            <dd>{task.assignee}</dd>
                          </div>
                          <div>
                            <dt className="sr-only">Due date</dt>
                            <dd>Due {formatDate(task.dueDate)}</dd>
                          </div>
                        </dl>
                      </article>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}