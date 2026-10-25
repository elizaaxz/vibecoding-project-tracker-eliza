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
 * @property {string} [context]        M9: curated, paste-ready briefing for an AI tool
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
    title: 'Fix task cards overflowing on mobile',
    description: 'Long task titles cause cards to extend beyond the Kanban column on smaller screens.',
    type: 'bug',
    status: 'review',
    assignee: TEAM[0],
    dueDate: '2026-10-26',
    createdDate: '2026-10-23',
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
    context: '',
  };
}

// M9 context: a starter structure for a good AI briefing.
const CONTEXT_TEMPLATE = `Goal:
What this task should achieve.

Relevant files:
- src/App.jsx

Constraints:
- Use the colour tokens from tailwind.config.js
- Keep it keyboard accessible (WCAG 2.2 AA)

Done when:
- `;

// M10 copy-prompt: turns a task + its context into one paste-ready prompt (Markdown).
function buildPrompt(task) {
  const stage = STAGES.find((s) => s.id === task.status);
  const type = task.type === 'bug' ? 'Bug' : 'Feature';
  const due = task.dueDate
    ? `${formatDate(task.dueDate)} (${dueState(task).label})`
    : 'No due date';
  const lines = [
    `# Task: ${task.title || 'Untitled task'}`,
    '',
    'Project: VibeTrack (Vibecoding Project Tracker)',
    `Type: ${type}`,
    `Status: ${stage ? stage.label : task.status}`,
    `Assignee: ${task.assignee}`,
    `Due: ${due}`,
    '',
    '## Description',
    task.description && task.description.trim() ? task.description.trim() : 'No description provided.',
    '',
    '## Context',
    task.context && task.context.trim() ? task.context.trim() : 'No prompt context added yet.',
  ];
  return lines.join('\n');
}

// M10 copy-prompt: copies text to the clipboard, with a fallback for older browsers.
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the fallback below */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

// M10 copy-prompt: Lucide "clipboard-copy" icon.
function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v4" />
      <path d="M21 14H11" />
      <path d="m15 10-4 4 4 4" />
    </svg>
  );
}

// M10 copy-prompt: shared button style (secondary, brand-coloured).
const COPY_BUTTON_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-md border border-brand-primary bg-surface-card px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2';

/**
 * M5 crud-modal: one modal for both adding and editing a task.
 * Accessible: role="dialog", labelled title, focus moves in on open,
 * Tab is kept inside the modal, Escape closes, focus returns on close.
 */
function TaskModal({ task, isNew, onSave, onDelete, onClose, onCopy }) {
  // M9 context: older saved tasks may not have a context field yet
  const [form, setForm] = useState({ context: '', ...task });
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
    onSave({
      ...form,
      title: form.title.trim(),
      dueDate: form.dueDate || null,
      context: form.context.trim(),
    });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/50 p-4"
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

          {/* M9 context: curated, paste-ready briefing for an AI tool */}
          <div>
            <div className="mb-1 flex items-end justify-between gap-2">
              <label htmlFor="task-context" className="block text-sm font-medium text-text-primary">
                Prompt context
              </label>
              {!form.context.trim() && (
                <button
                  type="button"
                  onClick={() => update('context', CONTEXT_TEMPLATE)}
                  className="rounded-md px-2 py-1 text-sm font-medium text-brand-primary hover:bg-brand-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                >
                  Use template
                </button>
              )}
            </div>
            <p id="task-context-help" className="mb-2 text-sm text-text-muted">
              Paste the prompt and key context that produced this task, so anyone can pick it up in an AI tool.
            </p>
            <textarea
              id="task-context"
              rows={7}
              value={form.context}
              onChange={(e) => update('context', e.target.value)}
              aria-describedby="task-context-help"
              spellCheck={false}
              className={`${fieldClass} font-mono text-sm leading-relaxed`}
            />
            {/* M10 copy-prompt: copies what is in the form right now, saved or not */}
            <button
              type="button"
              onClick={() => onCopy(form)}
              className={`mt-2 w-full ${COPY_BUTTON_CLASS}`}
            >
              <CopyIcon />
              Copy as Prompt Context
            </button>
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
                className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-surface-card hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
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

// M6 tag-style: Lucide "sparkles" (feature) and "bug" icons as inline SVG,
// so no extra package is needed. aria-hidden because the text label says the same thing.
function TypeIcon({ type }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    focusable: 'false',
  };
  if (type === 'bug') {
    return (
      <svg {...common}>
        <path d="m8 2 1.88 1.88" />
        <path d="M14.12 3.88 16 2" />
        <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
        <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
        <path d="M12 20v-9" />
        <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
        <path d="M6 13H2" />
        <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
        <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
        <path d="M22 13h-4" />
        <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

// M6 tag-style: full class names written out so Tailwind keeps them in the build.
const TYPE_STYLES = {
  feature: {
    label: 'Feature',
    stripe: 'border-l-type-feature',
    pill: 'bg-type-feature-soft text-type-feature-text',
  },
  bug: {
    label: 'Bug',
    stripe: 'border-l-type-bug',
    pill: 'bg-type-bug-soft text-type-bug-text',
  },
};

// M7 task-owner: one avatar colour per team member, all from tailwind.config.js (all pass WCAG AA contrast).
const OWNER_STYLES = [
  'bg-brand-primary-soft text-brand-primary',
  'border border-brand-accent bg-surface-card text-brand-accent',
  'bg-surface-column text-text-muted',
];

// M7 task-owner: initials for the avatar, e.g. "Full-Stack Developer" -> "FD".
function initials(name) {
  const words = name.split(/[\s/&-]+/).filter((w) => /^[A-Za-z]/.test(w));
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// M7 task-owner: assignee badge shown on each card.
function OwnerBadge({ name }) {
  const index = TEAM.indexOf(name);
  const colour = OWNER_STYLES[(index >= 0 ? index : 0) % OWNER_STYLES.length];
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span
        aria-hidden="true"
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${colour}`}
      >
        {initials(name)}
      </span>
      <span className="truncate text-sm text-text-primary">{name}</span>
    </span>
  );
}

// M8 due-tint: whole days from today to the due date (negative = overdue).
function daysUntil(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due - today) / 86400000);
}

/**
 * M8 due-tint: works out which DESIGN.md §2 due state a task is in.
 *   done          -> neutral  (overrides the date)
 *   past due      -> overdue
 *   due today     -> warning  (less than 24 hours)
 *   due tomorrow  -> soon     (24–48 hours)
 *   2+ days away  -> safe
 */
function dueState(task) {
  if (task.status === 'done') return { key: 'neutral', label: 'Done' };
  if (!task.dueDate) return { key: 'none', label: 'No due date' };
  const days = daysUntil(task.dueDate);
  if (days < 0) {
    const n = Math.abs(days);
    return { key: 'overdue', label: `Overdue by ${n} day${n === 1 ? '' : 's'}` };
  }
  if (days === 0) return { key: 'warning', label: 'Due today' };
  if (days === 1) return { key: 'soon', label: 'Due tomorrow' };
  return { key: 'safe', label: `Due ${formatDate(task.dueDate)}` };
}

// M8 due-tint: full class names so Tailwind keeps them. Card tint + badge per state.
const DUE_STYLES = {
  safe: { card: 'bg-surface-card', badge: 'border-due-safe text-due-safe-text' },
  soon: { card: 'bg-due-soon-soft', badge: 'border-due-soon text-due-soon-text' },
  warning: { card: 'bg-due-warning-soft', badge: 'border-due-warning text-due-warning-text' },
  overdue: { card: 'bg-due-overdue-soft', badge: 'border-due-overdue text-due-overdue-text' },
  neutral: { card: 'bg-due-neutral-soft', badge: 'border-due-neutral text-due-neutral-text' },
  none: { card: 'bg-surface-card', badge: 'border-border-subtle text-text-muted' },
};

// M8 due-tint: Lucide icons (calendar, clock, alarm-clock, alert-circle, check-circle-2).
function DueIcon({ state }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    focusable: 'false',
  };
  if (state === 'overdue') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    );
  }
  if (state === 'warning') {
    return (
      <svg {...common}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2" />
        <path d="M5 3 2 6" />
        <path d="m22 6-3-3" />
        <path d="M6.38 18.7 4 21" />
        <path d="M17.64 18.67 20 21" />
      </svg>
    );
  }
  if (state === 'soon') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    );
  }
  if (state === 'neutral') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
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

  // M7 task-owner: "Hand off to..." changes the assignee and shows a toast.
  const [toast, setToast] = useState('');
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handOff(id, name) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, assignee: name } : t)));
    setToast(`Task handed off to ${name}.`);
  }

  // M10 copy-prompt: copy the formatted prompt and confirm with the toast.
  async function copyPrompt(task) {
    const ok = await copyToClipboard(buildPrompt(task));
    setToast(
      ok
        ? 'Prompt context copied. Ready to paste into your AI tool.'
        : "Couldn't copy automatically. Open the task and copy the context by hand."
    );
  }
  //
  // TODO M11 anchors:
  //   const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', [...]);

  return (
    <div className="min-h-screen p-6">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Vibecoding Project Tracker
          </h1>
          <p className="text-sm text-text-muted">
            {/* Replace this line with your team name from PRD §11. */}
            VibeTrack · From prompt to progress
          </p>
        </div>
        {/* M5 crud-modal: "+" button */}
        <button
          type="button"
          onClick={() => setEditing(blankTask())}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-surface-card hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
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
                  {stageTasks.map((task) => {
                    // M8 due-tint: work out the card's due state once per card
                    const due = dueState(task);
                    const dueStyle = DUE_STYLES[due.key];
                    return (
                    <li key={task.id}>
                      <article
                        className={`relative rounded-xl border border-l-4 border-border-subtle p-4 transition-shadow focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2 hover:shadow-md ${
                          (TYPE_STYLES[task.type] || TYPE_STYLES.feature).stripe
                        } ${dueStyle.card}`}
                      >
                        {/* M6 tag-style: coloured stripe + icon + text label (never colour alone) */}
                        <p
                          className={`mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${
                            (TYPE_STYLES[task.type] || TYPE_STYLES.feature).pill
                          }`}
                        >
                          <TypeIcon type={task.type} />
                          {(TYPE_STYLES[task.type] || TYPE_STYLES.feature).label}
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
                        {/* M9 context: shows which tasks already have a briefing */}
                        {task.context && task.context.trim() && (
                          <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-primary">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              focusable="false"
                            >
                              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                              <path d="M10 9H8" />
                              <path d="M16 13H8" />
                              <path d="M16 17H8" />
                            </svg>
                            Prompt context added
                          </p>
                        )}
                        <dl className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-text-muted">
                          <div className="min-w-0">
                            <dt className="sr-only">Assignee</dt>
                            {/* M7 task-owner: assignee badge */}
                            <dd>
                              <OwnerBadge name={task.assignee} />
                            </dd>
                          </div>
                          <div>
                            <dt className="sr-only">Due date</dt>
                            {/* M8 due-tint: colour + icon + words, never colour alone */}
                            <dd
                              className={`inline-flex items-center gap-1 rounded-full border bg-surface-card px-2 py-0.5 text-sm font-medium ${dueStyle.badge}`}
                              title={task.dueDate ? `Due ${formatDate(task.dueDate)}` : undefined}
                            >
                              <DueIcon state={due.key} />
                              {due.label}
                            </dd>
                          </div>
                        </dl>

                        {/* M7 task-owner: "Hand off to..." dropdown (sits above the card's click area) */}
                        <div className="relative z-10 mt-3 flex items-center gap-2 border-t border-border-subtle pt-3">
                          <label
                            htmlFor={`handoff-${task.id}`}
                            className="shrink-0 text-sm text-text-muted"
                          >
                            Hand off to
                          </label>
                          <select
                            id={`handoff-${task.id}`}
                            value={task.assignee}
                            onChange={(e) => handOff(task.id, e.target.value)}
                            className="min-w-0 flex-1 rounded-md border border-border-input bg-surface-card px-2 py-1 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                          >
                            {TEAM.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* M10 copy-prompt: one-click copy (sits above the card's click area) */}
                        <button
                          type="button"
                          onClick={() => copyPrompt(task)}
                          aria-label={`Copy as Prompt Context: ${task.title}`}
                          className={`relative z-10 mt-2 w-full ${COPY_BUTTON_CLASS}`}
                        >
                          <CopyIcon />
                          Copy as Prompt Context
                        </button>
                      </article>
                    </li>
                    );
                  })}
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
          onCopy={copyPrompt}
        />
      )}

      {/* M7 task-owner + M10 copy-prompt: toast, announced to screen readers */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        {toast && (
          <p className="rounded-lg bg-text-primary px-4 py-3 text-sm font-medium text-surface-card shadow-lg">
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}