import { useState, useEffect, useRef } from 'react';

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

// M5 crud-modal: today's date as ISO 'YYYY-MM-DD' (local time).
function todayISO() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

// M5 crud-modal: a unique id for new tasks.
function newId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// M5 crud-modal: an empty task used when the "Add task" button is pressed.
function blankTask() {
  return {
    id: '',
    title: '',
    description: '',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[0],
    dueDate: null,
    createdDate: todayISO(),
  };
}

/**
 * M5 crud-modal: one modal for both adding and editing a task.
 * Accessible: role="dialog", labelled title, focus moves in on open,
 * Tab is kept inside the modal, Escape closes, focus returns on close.
 */
function TaskModal({ task, isNew, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(task);
  const [error, setError] = useState('');
  const dialogRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    titleInputRef.current?.focus();
    return () => {
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, []);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter a title.');
      titleInputRef.current?.focus();
      return;
    }
    onSave({ ...form, title: form.title.trim(), dueDate: form.dueDate || null });
  }

  function handleDelete() {
    if (window.confirm("Delete this task? This can't be undone.")) {
      onDelete(form.id);
    }
  }

  const labelClass = 'mb-1 block text-sm font-medium text-text-primary';
  const fieldClass =
    'w-full rounded-md border border-border-input bg-surface-card px-3 py-2 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onKeyDown={handleKeyDown}
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-surface-card p-6 shadow-xl"
      >
        <h2 id="task-modal-title" className="mb-4 text-lg font-semibold text-text-primary">
          {isNew ? 'Add task' : 'Edit task'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="task-title" className={labelClass}>
              Title <span className="font-normal text-text-muted">(required)</span>
            </label>
            <input
              id="task-title"
              ref={titleInputRef}
              type="text"
              value={form.title}
              onChange={(e) => {
                update('title', e.target.value);
                if (error) setError('');
              }}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'task-title-error' : undefined}
              className={fieldClass}
            />
            {error && (
              <p id="task-title-error" role="alert" className="mt-1 text-sm text-due-overdue-text">
                {error}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="task-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-type" className={labelClass}>
                Type
              </label>
              <select
                id="task-type"
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                className={fieldClass}
              >
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-status" className={labelClass}>
                Status
              </label>
              <select
                id="task-status"
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className={fieldClass}
              >
                {STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-assignee" className={labelClass}>
                Assignee
              </label>
              <select
                id="task-assignee"
                value={form.assignee}
                onChange={(e) => update('assignee', e.target.value)}
                className={fieldClass}
              >
                {TEAM.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-due" className={labelClass}>
                Due date
              </label>
              <input
                id="task-due"
                type="date"
                value={form.dueDate || ''}
                onChange={(e) => update('dueDate', e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            {!isNew ? (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md border border-border-input bg-surface-card px-4 py-2 text-sm font-medium text-due-overdue hover:bg-due-overdue-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                Delete
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-border-input bg-surface-card px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-column focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                {isNew ? 'Add task' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  // TODO M4 data-model:
  //   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', [/* 3-4 seed tasks */]);
  //
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);
  //
  // TODO M5 crud-modal:
  //   const [editing, setEditing] = useState(null);
  //
  // `editing` is the task open in the modal (null = modal closed).
  const [editing, setEditing] = useState(null);
  const isNewTask = editing !== null && editing.id === '';

  function saveTask(task) {
    if (task.id === '') {
      setTasks((prev) => [...prev, { ...task, id: newId() }]);
    } else {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
    setEditing(null);
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setEditing(null);
  }
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
        {/* M5 crud-modal: "+" button */}
        <button
          type="button"
          onClick={() => setEditing(blankTask())}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          <span aria-hidden="true">+ </span>Add task
        </button>
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
                      <article className="relative rounded-xl border border-border-subtle bg-surface-card p-4 transition-shadow focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2 hover:shadow-md">
                        <p className="mb-1 text-sm font-medium text-text-muted">
                          {task.type === 'bug' ? 'Bug' : 'Feature'}
                        </p>
                        <h3 className="break-words text-base font-medium text-text-primary">
                          {/* M5 crud-modal: clicking anywhere on the card opens it in edit mode */}
                          <button
                            type="button"
                            onClick={() => setEditing(task)}
                            className="text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] focus:outline-none"
                          >
                            {task.title}
                          </button>
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

      {editing && (
        <TaskModal
          key={editing.id || 'new'}
          task={editing}
          isNew={isNewTask}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}