import { useState, useEffect, useRef } from 'react';
// M12 secret-sauce: colour themes (CSS variables read by tailwind.config.js)
import './themes.css';

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
 *                         VibeTrack: user-selectable colour themes, including
 *                         colour-vision-friendly palettes and dark mode (see src/themes.css),
 *                         plus adjustable text size and a Focus mode for cognitive
 *                         accessibility (e.g. ADHD), all in a Settings dialog,
 *                         including a "Show only my tasks" filter.
 *
 * Login (prototype requirement): a front-end-only sign-in screen. There is no backend —
 * any valid email + 8-character password (or the demo account) signs in, and only the
 * name and email are kept on this device. Passwords are never stored.
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
 * @property {string|null} [contextTool]       M9: AI tool used, one of AI_TOOLS (PRD §5)
 * @property {string|null} [contextUpdatedAt]  M9: ISO timestamp, set automatically when context is saved
 */

// M9 context: the AI tools a task's context can come from (PRD §5 data model).
export const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

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
    contextTool: null,
    contextUpdatedAt: null,
  };
}

// Data requirements: shows an ISO timestamp as e.g. "25 Oct 2026, 22:14".
function formatTimestamp(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Data requirements: true for a real ISO date like '2026-10-25'.
function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/**
 * Data requirements: keeps saved tasks inside the PRD rules when they are loaded
 * (e.g. after team names change or older data is missing newer fields):
 * unique IDs, predefined type/status, assignee from TEAM, ISO dates, valid AI tool.
 */
function normaliseTasks(list) {
  if (!Array.isArray(list)) return SEED_TASKS.map((t) => normaliseTask(t));
  const seen = new Set();
  return list
    .filter((t) => t && typeof t === 'object')
    .map((t) => {
      const task = normaliseTask(t);
      if (!task.id || seen.has(task.id)) task.id = newId();
      seen.add(task.id);
      return task;
    });
}

function normaliseTask(t) {
  return {
    ...t,
    id: typeof t.id === 'string' ? t.id : '',
    title: typeof t.title === 'string' && t.title.trim() ? t.title : 'Untitled task',
    description: typeof t.description === 'string' ? t.description : '',
    type: t.type === 'bug' ? 'bug' : 'feature',
    status: STAGES.some((s) => s.id === t.status) ? t.status : 'todo',
    assignee: TEAM.includes(t.assignee) ? t.assignee : TEAM[0],
    dueDate: isIsoDate(t.dueDate) ? t.dueDate : null,
    createdDate: isIsoDate(t.createdDate) ? t.createdDate : todayISO(),
    context: typeof t.context === 'string' ? t.context : '',
    contextTool: AI_TOOLS.includes(t.contextTool) ? t.contextTool : null,
    contextUpdatedAt:
      typeof t.contextUpdatedAt === 'string' && !Number.isNaN(new Date(t.contextUpdatedAt).getTime())
        ? t.contextUpdatedAt
        : null,
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
  const state = dueState(task);
  const due = task.dueDate
    ? state.key === 'safe'
      ? formatDate(task.dueDate)
      : `${formatDate(task.dueDate)} (${state.label})`
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
  // M9 context: say which AI tool the context came from and when it was last updated
  if (task.contextTool || task.contextUpdatedAt) lines.push('');
  if (task.contextTool) lines.push(`AI tool used: ${task.contextTool}`);
  if (task.contextUpdatedAt) lines.push(`Context last updated: ${formatTimestamp(task.contextUpdatedAt)}`);
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
  const [form, setForm] = useState({ context: '', contextTool: null, contextUpdatedAt: null, ...task });
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
    const context = form.context.trim();
    const contextTool = form.contextTool || null;
    // M9 context: record when the context (or its AI tool) last changed, as an ISO timestamp
    const contextChanged =
      context !== (task.context || '').trim() || contextTool !== (task.contextTool || null);
    onSave({
      ...form,
      title: form.title.trim(),
      dueDate: form.dueDate || null,
      context,
      contextTool,
      contextUpdatedAt: contextChanged
        ? context || contextTool
          ? new Date().toISOString()
          : null
        : form.contextUpdatedAt || null,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay/60 p-4"
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
            {/* M9 context: which AI tool produced this context (PRD §5 contextTool) */}
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-[12rem] flex-1">
                <label htmlFor="task-context-tool" className={labelClass}>
                  AI tool used
                </label>
                <select
                  id="task-context-tool"
                  value={form.contextTool || ''}
                  onChange={(e) => update('contextTool', e.target.value || null)}
                  className={fieldClass}
                >
                  <option value="">Not specified</option>
                  {AI_TOOLS.map((tool) => (
                    <option key={tool} value={tool}>
                      {tool}
                    </option>
                  ))}
                </select>
              </div>
              {/* M9 context: PRD §5 contextUpdatedAt, set automatically on save */}
              <p className="pb-2 text-sm text-text-muted">
                {form.contextUpdatedAt
                  ? `Context last updated ${formatTimestamp(form.contextUpdatedAt)}`
                  : 'Context not saved yet'}
              </p>
            </div>
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

// M11 anchors: the four project deliverables pinned above the board.
const DEFAULT_ANCHORS = [
  { id: 'presentation', label: 'Presentation', hint: 'Slides for the pitch', url: null, status: 'not-started' },
  { id: 'demo', label: 'Demo', hint: 'Live prototype link', url: null, status: 'not-started' },
  { id: 'report', label: 'Report', hint: 'Written report', url: null, status: 'not-started' },
  { id: 'documentation', label: 'Documentation', hint: 'README, PRD and DESIGN.md', url: null, status: 'not-started' },
];

// Data requirements: always exactly the four predefined deliverables, in order,
// keeping any saved link and status (an empty link is stored as null, per PRD §5).
function normaliseAnchors(list) {
  const saved = Array.isArray(list) ? list : [];
  return DEFAULT_ANCHORS.map((def) => {
    const match = saved.find((a) => a && a.id === def.id) || {};
    return {
      ...def,
      url: typeof match.url === 'string' && match.url.trim() ? match.url : null,
      status: ANCHOR_STATUSES.some((s) => s.id === match.status) ? match.status : def.status,
    };
  });
}

// M11 anchors: progress states, each shown with words and colour (never colour alone).
const ANCHOR_STATUSES = [
  { id: 'not-started', label: 'Not started', className: 'bg-due-neutral-soft text-due-neutral-text' },
  { id: 'in-progress', label: 'In progress', className: 'bg-brand-primary-soft text-brand-primary' },
  { id: 'done', label: 'Done', className: 'bg-due-safe-soft text-due-safe-text' },
];

// M11 anchors: adds https:// if missing; returns '' if it isn't a usable web link.
function normaliseUrl(raw) {
  const value = raw.trim();
  if (!value) return '';
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes('.') || url.hostname === 'localhost' ? url.href : '';
  } catch {
    return '';
  }
}

// M11 anchors: one deliverable card with an inline link editor.
function AnchorCard({ anchor, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(anchor.url || '');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const editButtonRef = useRef(null);
  const status = ANCHOR_STATUSES.find((s) => s.id === anchor.status) || ANCHOR_STATUSES[0];
  const inputId = `anchor-url-${anchor.id}`;
  const statusId = `anchor-status-${anchor.id}`;

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  function startEditing() {
    setDraft(anchor.url || '');
    setError('');
    setIsEditing(true);
  }

  function stopEditing() {
    setIsEditing(false);
    setError('');
    // return focus to the button that opened the editor
    setTimeout(() => editButtonRef.current?.focus(), 0);
  }

  function save(event) {
    event.preventDefault();
    if (!draft.trim()) {
      onChange({ ...anchor, url: null });
      stopEditing();
      return;
    }
    const url = normaliseUrl(draft);
    if (!url) {
      setError('Please enter a full web address, e.g. https://example.com');
      inputRef.current?.focus();
      return;
    }
    onChange({ ...anchor, url });
    stopEditing();
  }

  const smallButton =
    'rounded-md px-2 py-1 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2';

  return (
    <li className="flex flex-col rounded-xl border border-border-subtle bg-surface-card p-4">
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-text-primary">{anchor.label}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-sm font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>
      <p className="mb-3 text-sm text-text-muted">{anchor.hint}</p>

      {isEditing ? (
        <form onSubmit={save} noValidate className="mt-auto flex flex-col gap-2">
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {anchor.label} link
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="url"
            inputMode="url"
            value={draft}
            placeholder="https://"
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                stopEditing();
              }
            }}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className="w-full rounded-md border border-border-input bg-surface-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          />
          {error && (
            <p id={`${inputId}-error`} role="alert" className="text-sm text-due-overdue-text">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={stopEditing} className={`${smallButton} text-text-primary hover:bg-surface-column`}>
              Cancel
            </button>
            <button type="submit" className={`${smallButton} bg-brand-primary text-surface-card hover:bg-brand-primary-hover`}>
              Save link
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-auto flex flex-col gap-2">
          {anchor.url ? (
            <a
              href={anchor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium text-brand-accent underline underline-offset-2 hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              Open {anchor.label.toLowerCase()}
              <span className="sr-only"> (opens in a new tab)</span>
              <span aria-hidden="true"> ↗</span>
            </a>
          ) : (
            <p className="text-sm text-text-muted">No link added yet.</p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor={statusId} className="sr-only">
                {anchor.label} status
              </label>
              <select
                id={statusId}
                value={anchor.status}
                onChange={(e) => onChange({ ...anchor, status: e.target.value })}
                className="rounded-md border border-border-input bg-surface-card px-2 py-1 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
              >
                {ANCHOR_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              ref={editButtonRef}
              onClick={startEditing}
              aria-label={`${anchor.url ? 'Edit' : 'Add'} ${anchor.label} link`}
              className={`${smallButton} text-brand-primary hover:bg-brand-primary-soft`}
            >
              {anchor.url ? 'Edit link' : 'Add link'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// M11 anchors: the Deliverable Anchor Board (collapsible, pinned above the Kanban).
function AnchorBoard({ anchors, onChange, gridColumns }) {
  const [open, setOpen] = useState(true);
  const doneCount = anchors.filter((a) => a.status === 'done').length;

  return (
    <section
      aria-labelledby="anchor-board-title"
      className="mb-6 rounded-xl border border-border-subtle bg-surface-column p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="anchor-board-title" className="text-lg font-semibold text-text-primary">
          Project deliverables{' '}
          <span className="text-sm font-medium text-text-muted">
            ({doneCount} of {anchors.length} done)
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="anchor-board-list"
          className="rounded-md px-2 py-1 text-sm font-medium text-brand-primary hover:bg-brand-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open && (
        <ul id="anchor-board-list" className={`mt-3 grid grid-cols-1 gap-3 ${gridColumns}`}>
          {anchors.map((anchor) => (
            <AnchorCard
              key={anchor.id}
              anchor={anchor}
              onChange={(updated) =>
                onChange(anchors.map((a) => (a.id === updated.id ? updated : a)))
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}

// M12 secret-sauce: the themes defined in src/themes.css.
const THEMES = [
  {
    id: 'default',
    label: 'Default',
    description: 'The standard VibeTrack colours.',
  },
  {
    id: 'red-green',
    label: 'Red-green safe',
    description:
      'For protanopia and deuteranopia. Bugs are orange instead of red, and safe deadlines are blue instead of green.',
  },
  {
    id: 'blue-yellow',
    label: 'Blue-yellow safe',
    description:
      'For tritanopia. Features are cyan, and deadline colours avoid blue-green and yellow-pink pairs.',
  },
  {
    id: 'high-contrast',
    label: 'High contrast',
    description: 'For low vision. Darker text and stronger borders, with at least 7:1 contrast.',
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Light text on dark backgrounds, for low light or light sensitivity.',
  },
];

// M12 secret-sauce: text sizes. They scale the root font size, and because every
// size and space in Tailwind is in rem, the whole interface grows with it
// (WCAG 1.4.4 Resize Text). Percentages respect the user's own browser setting.
const TEXT_SIZES = [
  { id: 'default', label: 'Default', percent: 100 },
  { id: 'large', label: 'Large', percent: 115 },
  { id: 'x-large', label: 'Extra large', percent: 130 },
  { id: 'largest', label: 'Largest', percent: 150 },
];

// M12 secret-sauce: at bigger text sizes, show fewer columns so nothing gets squashed.
// Full class names are written out so Tailwind keeps them in the build.
const GRID_COLUMNS = {
  default: 'sm:grid-cols-2 lg:grid-cols-4',
  large: 'sm:grid-cols-2 lg:grid-cols-4',
  'x-large': 'md:grid-cols-2 xl:grid-cols-4',
  largest: 'lg:grid-cols-2 2xl:grid-cols-4',
};

// M12 secret-sauce: Lucide "settings" icon.
function SettingsIcon() {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// M12 secret-sauce: one radio option card (used for text size and colour theme).
function OptionCard({ name, value, checked, onChange, title, description, titleStyle }) {
  const id = `${name}-${value}`;
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2 ${
        checked
          ? 'border-brand-primary bg-brand-primary-soft'
          : 'border-border-input bg-surface-card hover:bg-surface-column'
      }`}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        aria-describedby={description ? `${id}-desc` : undefined}
        className="mt-1 h-4 w-4 shrink-0 accent-brand-primary focus:outline-none"
      />
      <span className="min-w-0">
        <span className="block font-medium text-text-primary" style={titleStyle}>
          {title}
        </span>
        {description && (
          <span id={`${id}-desc`} className="block text-sm text-text-muted">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

// M12 secret-sauce: an on/off setting, built on a native checkbox with role="switch".
function ToggleRow({ id, checked, onChange, title, description }) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-3 focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2 ${
        checked
          ? 'border-brand-primary bg-brand-primary-soft'
          : 'border-border-input bg-surface-card hover:bg-surface-column'
      }`}
    >
      <span className="min-w-0">
        <span className="block font-medium text-text-primary">{title}</span>
        <span id={`${id}-desc`} className="block text-sm text-text-muted">
          {description}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-medium text-text-primary" aria-hidden="true">
          {checked ? 'On' : 'Off'}
        </span>
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={`${id}-desc`}
          className="h-5 w-5 accent-brand-primary focus:outline-none"
        />
      </span>
    </label>
  );
}

// M12 secret-sauce: Focus mode stage tabs (WAI-ARIA tabs pattern, arrow-key navigation).
function FocusStageTabs({ tasks, stage, onChange }) {
  const tabRefs = useRef({});

  function handleKeyDown(event) {
    const index = STAGES.findIndex((s) => s.id === stage);
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % STAGES.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + STAGES.length) % STAGES.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = STAGES.length - 1;
    if (next === null) return;
    event.preventDefault();
    const id = STAGES[next].id;
    onChange(id);
    tabRefs.current[id]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Choose a stage to focus on"
      onKeyDown={handleKeyDown}
      className="mx-auto mb-4 flex max-w-2xl flex-wrap gap-2"
    >
      {STAGES.map((s) => {
        const selected = s.id === stage;
        const count = tasks.filter((t) => t.status === s.id).length;
        return (
          <button
            key={s.id}
            ref={(el) => {
              tabRefs.current[s.id] = el;
            }}
            type="button"
            role="tab"
            id={`focus-tab-${s.id}`}
            aria-selected={selected}
            aria-controls="focus-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(s.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
              selected
                ? 'border-brand-primary bg-brand-primary text-surface-card'
                : 'border-border-input bg-surface-card text-text-primary hover:bg-surface-column'
            }`}
          >
            {s.label} <span aria-hidden="true">({count})</span>
            <span className="sr-only">, {count} {count === 1 ? 'task' : 'tasks'}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * M12 secret-sauce: the Settings dialog (text size + colour theme + focus).
 * Same accessible pattern as the task modal: role="dialog", focus moves in,
 * Tab stays inside, Escape closes, focus returns to the Settings button.
 * Changes apply straight away so users can see the effect before closing.
 */
function SettingsModal({
  theme,
  onThemeChange,
  textSize,
  onTextSizeChange,
  focusMode,
  onFocusModeChange,
  hideDetails,
  onHideDetailsChange,
  myTasksOnly,
  onMyTasksOnlyChange,
  myRole,
  onMyRoleChange,
  onReset,
  onClose,
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
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
    const focusable = Array.from(
      dialogRef.current.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !(el.type === 'radio' && !el.checked));
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        aria-describedby="settings-help"
        onKeyDown={handleKeyDown}
        className="max-h-full w-full max-w-xl overflow-y-auto rounded-xl bg-surface-card p-6 shadow-xl"
      >
        <div className="mb-1 flex items-start justify-between gap-4">
          <h2 id="settings-title" className="text-lg font-semibold text-text-primary">
            Settings
          </h2>
          <button
            type="button"
            ref={closeRef}
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-md px-2 py-1 text-lg leading-none text-text-muted hover:bg-surface-column focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <p id="settings-help" className="mb-5 text-sm text-text-muted">
          Changes apply straight away and are saved on this device.
        </p>

        {/* M12 secret-sauce: cognitive accessibility options (optional for anyone) */}
        <fieldset className="mb-6">
          <legend className="mb-1 text-base font-semibold text-text-primary">Focus</legend>
          <p className="mb-2 text-sm text-text-muted">
            Optional ways to reduce visual clutter, for example if a busy board is distracting.
            Every feature stays available.
          </p>
          <div className="flex flex-col gap-2">
            <ToggleRow
              id="setting-focus-mode"
              checked={focusMode}
              onChange={onFocusModeChange}
              title="Focus mode"
              description="Show one stage at a time instead of all four columns. Switch stages with the tabs above the board."
            />
            <ToggleRow
              id="setting-hide-details"
              checked={hideDetails}
              onChange={onHideDetailsChange}
              title="Hide extra card details"
              description="Cards show only the type, title, owner and due date. Open a task to see everything else, including hand-off and copy."
            />
            {/* M12 secret-sauce: "Show only my tasks" — the board shows only tasks assigned to your role */}
            <ToggleRow
              id="setting-my-tasks"
              checked={myTasksOnly}
              onChange={onMyTasksOnlyChange}
              title="Show only my tasks"
              description="Hide tasks assigned to other team members, so you can focus on your own work. A banner above the board shows when this is on."
            />
            <div className="rounded-lg border border-border-input bg-surface-card p-3">
              <label htmlFor="setting-my-role" className="mb-1 block font-medium text-text-primary">
                Your team role
              </label>
              <p id="setting-my-role-help" className="mb-2 text-sm text-text-muted">
                Used by "Show only my tasks" to find the tasks assigned to you.
              </p>
              <select
                id="setting-my-role"
                value={myRole}
                onChange={(e) => onMyRoleChange(e.target.value)}
                aria-describedby="setting-my-role-help"
                className="w-full rounded-md border border-border-input bg-surface-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
              >
                {TEAM.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="mb-6">
          <legend className="mb-2 text-base font-semibold text-text-primary">Text size</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TEXT_SIZES.map((size) => (
              <OptionCard
                key={size.id}
                name="text-size"
                value={size.id}
                checked={textSize === size.id}
                onChange={onTextSizeChange}
                title={size.label}
                description={`${size.percent}% of your browser's text size`}
                titleStyle={{ fontSize: `${size.percent / 100}em` }}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-6">
          <legend className="mb-2 text-base font-semibold text-text-primary">Colour theme</legend>
          <div className="flex flex-col gap-2">
            {THEMES.map((t) => (
              <OptionCard
                key={t.id}
                name="colour-theme"
                value={t.id}
                checked={theme === t.id}
                onChange={onThemeChange}
                title={t.label}
                description={t.description}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-border-input bg-surface-card px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-column focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            Reset to defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-surface-card hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Login: where the signed-in user is kept. "Remember me" uses localStorage (stays signed in);
// otherwise sessionStorage (signed out when the tab closes). Passwords are never saved.
const SESSION_KEY = 'vibetracker.session';

function loadSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) : null;
    return session && typeof session.email === 'string' ? session : null;
  } catch {
    return null;
  }
}

function saveSession(session, remember) {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    (remember ? window.localStorage : window.sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage blocked (e.g. private mode) — the user stays signed in until they reload */
  }
}

function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* nothing to clear */
  }
}

// Login: "marcus.maniago@uni.ac.uk" -> "Marcus Maniago".
function nameFromEmail(email) {
  const local = email.split('@')[0] || 'User';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const DEMO_ACCOUNT = { email: 'demo@vibetrack.app', name: 'Demo User' };
const MIN_PASSWORD_LENGTH = 8;

// Login: Lucide "layout-grid" icon for the VibeTrack wordmark (DESIGN.md §6).
function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-surface-card"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    </span>
  );
}

/**
 * Login: front-end-only sign-in screen (no backend, as the brief allows).
 * Accessible: visible labels, errors in text linked to each field, focus moves to
 * the first problem, show/hide password, browser autofill, and a status message
 * while "signing in". The demo account means an assessor never needs to register.
 */
function LoginPage({ onSignIn, notice }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
    return () => clearTimeout(timerRef.current);
  }, []);

  // A short pause so it feels like a real sign-in, then enter the app.
  function finish(session) {
    setSubmitting(true);
    timerRef.current = setTimeout(() => onSignIn(session, remember), 700);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    const trimmed = email.trim();
    const next = {};
    if (!trimmed) next.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      next.email = 'Enter an email address in the format name@example.com.';
    }
    if (!password) next.password = 'Enter your password.';
    else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    setErrors(next);
    if (next.email) {
      emailRef.current?.focus();
      return;
    }
    if (next.password) {
      passwordRef.current?.focus();
      return;
    }
    finish({ email: trimmed, name: nameFromEmail(trimmed), signedInAt: new Date().toISOString() });
  }

  function signInWithDemo() {
    if (submitting) return;
    setErrors({});
    finish({ ...DEMO_ACCOUNT, signedInAt: new Date().toISOString() });
  }

  const labelClass = 'mb-1 block text-sm font-medium text-text-primary';
  const fieldClass =
    'w-full rounded-md border bg-surface-card px-3 py-2 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2';

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page p-6 text-text-primary">
      <main className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-xl font-semibold text-text-primary">VibeTrack</p>
            <p className="text-sm text-text-muted">From prompt to progress</p>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface-card p-6 shadow-sm">
          <h1 className="mb-1 text-2xl font-semibold text-text-primary">Sign in</h1>
          <p className="mb-5 text-sm text-text-muted">Track your vibecoding tasks and the prompts behind them.</p>

          {notice && (
            <p role="status" className="mb-4 rounded-md border border-border-subtle bg-surface-column px-3 py-2 text-sm text-text-primary">
              {notice}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-busy={submitting}>
            <div>
              <label htmlFor="login-email" className={labelClass}>
                Email address
              </label>
              <input
                id="login-email"
                ref={emailRef}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                disabled={submitting}
                className={`${fieldClass} ${errors.email ? 'border-due-overdue' : 'border-border-input'}`}
              />
              {errors.email && (
                <p id="login-email-error" className="mt-1 text-sm text-due-overdue-text">
                  <span className="sr-only">Error: </span>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  ref={passwordRef}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={`login-password-hint${errors.password ? ' login-password-error' : ''}`}
                  disabled={submitting}
                  className={`${fieldClass} pr-20 ${errors.password ? 'border-due-overdue' : 'border-border-input'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-controls="login-password"
                  disabled={submitting}
                  className="absolute inset-y-0 right-1 my-1 rounded-md px-3 text-sm font-medium text-brand-primary hover:bg-brand-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {showPassword ? 'Hide' : 'Show'}
                  <span className="sr-only"> password</span>
                </button>
              </div>
              <p id="login-password-hint" className="mt-1 text-sm text-text-muted">
                At least {MIN_PASSWORD_LENGTH} characters.
              </p>
              {errors.password && (
                <p id="login-password-error" className="mt-1 text-sm text-due-overdue-text">
                  <span className="sr-only">Error: </span>
                  {errors.password}
                </p>
              )}
            </div>

            <label htmlFor="login-remember" className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
              <input
                id="login-remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={submitting}
                className="h-4 w-4 accent-brand-primary"
              />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-brand-primary px-4 py-2 text-base font-medium text-surface-card hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-80"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border-subtle" />
            <span className="text-sm text-text-muted">or</span>
            <span className="h-px flex-1 bg-border-subtle" />
          </div>

          <button
            type="button"
            onClick={signInWithDemo}
            disabled={submitting}
            className="w-full rounded-md border border-border-input bg-surface-card px-4 py-2 text-base font-medium text-text-primary hover:bg-surface-column focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-wait"
          >
            Continue with demo account
          </button>

          {/* Announces progress to screen readers while "signing in" */}
          <p role="status" aria-live="polite" className="sr-only">
            {submitting ? 'Signing in, please wait.' : ''}
          </p>
        </div>

        <p className="mt-4 rounded-md border border-border-subtle bg-brand-primary-soft px-3 py-2 text-sm text-text-primary">
          <strong className="font-semibold">Prototype sign-in.</strong> There is no real account system yet: use any
          email with a password of {MIN_PASSWORD_LENGTH}+ characters, or the demo account. Your password is never saved.
        </p>
      </main>
    </div>
  );
}

export default function App() {
  // TODO M4 data-model:
  //   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', [/* 3-4 seed tasks */]);
  //
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);
  // Data requirements: once on load, bring saved tasks in line with the PRD rules
  useEffect(() => {
    setTasks((prev) => normaliseTasks(prev));
  }, [setTasks]);
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
  const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', DEFAULT_ANCHORS);
  // Data requirements: once on load, keep exactly the four predefined deliverables
  useEffect(() => {
    setAnchors((prev) => normaliseAnchors(prev));
  }, [setAnchors]);

  // M12 secret-sauce: the chosen colour theme, saved between visits.
  const [theme, setTheme] = useLocalStorage('vibetracker.theme', 'default');
  useEffect(() => {
    const valid = THEMES.some((t) => t.id === theme) ? theme : 'default';
    document.documentElement.setAttribute('data-theme', valid);
  }, [theme]);

  // M12 secret-sauce: the chosen text size, saved between visits.
  const [textSize, setTextSize] = useLocalStorage('vibetracker.textSize', 'default');
  const currentSize = TEXT_SIZES.find((t) => t.id === textSize) || TEXT_SIZES[0];
  useEffect(() => {
    document.documentElement.style.fontSize = `${currentSize.percent}%`;
  }, [currentSize.percent]);
  const gridColumns = GRID_COLUMNS[currentSize.id];

  // M12 secret-sauce: the Settings dialog.
  const [settingsOpen, setSettingsOpen] = useState(false);

  // M12 secret-sauce: Focus mode and simplified cards, saved between visits.
  const [focusMode, setFocusMode] = useLocalStorage('vibetracker.focusMode', false);
  const [focusStage, setFocusStage] = useLocalStorage('vibetracker.focusStage', 'todo');
  const [hideDetails, setHideDetails] = useLocalStorage('vibetracker.hideDetails', false);
  const currentFocusStage = STAGES.some((s) => s.id === focusStage) ? focusStage : STAGES[0].id;
  const visibleStages = focusMode ? STAGES.filter((s) => s.id === currentFocusStage) : STAGES;

  // M12 secret-sauce: "Show only my tasks" — filter the board to the user's own team role.
  const [myTasksOnly, setMyTasksOnly] = useLocalStorage('vibetracker.myTasksOnly', false);
  const [myRole, setMyRole] = useLocalStorage('vibetracker.myRole', TEAM[0]);
  const currentRole = TEAM.includes(myRole) ? myRole : TEAM[0];
  const boardTasks = myTasksOnly ? tasks.filter((t) => t.assignee === currentRole) : tasks;
  const hiddenCount = tasks.length - boardTasks.length;

  function resetSettings() {
    setTheme('default');
    setTextSize('default');
    setFocusMode(false);
    setHideDetails(false);
    setMyTasksOnly(false);
    setToast('Settings reset to defaults.');
  }

  // Login: who is signed in (null = show the sign-in screen).
  const [session, setSession] = useState(() => loadSession());
  const [signedOutNotice, setSignedOutNotice] = useState('');
  const headingRef = useRef(null);
  const justSignedIn = useRef(false);

  function signIn(newSession, remember) {
    saveSession(newSession, remember);
    justSignedIn.current = true;
    setSignedOutNotice('');
    setSession(newSession);
    setToast(`Welcome, ${newSession.name}.`);
  }

  function signOut() {
    clearSession();
    setEditing(null);
    setSettingsOpen(false);
    setSession(null);
    setSignedOutNotice("You've been signed out.");
  }

  // Login: page title for each screen (WCAG 2.4.2), and focus the main heading after sign-in.
  useEffect(() => {
    document.title = session ? 'VibeTrack · Board' : 'Sign in · VibeTrack';
    if (session && justSignedIn.current) {
      justSignedIn.current = false;
      headingRef.current?.focus();
    }
  }, [session]);

  if (!session) {
    return <LoginPage onSignIn={signIn} notice={signedOutNotice} />;
  }

  // M12 secret-sauce: the page background and text follow the selected theme
  // (index.css hard-codes the body colours, so they are set here instead).
  return (
    <div className="min-h-screen bg-surface-page p-6 text-text-primary">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-text-primary focus:outline-none">
            Vibecoding Project Tracker
          </h1>
          <p className="text-sm text-text-muted">
            {/* Replace this line with your team name from PRD §11. */}
            VibeTrack · From prompt to progress
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Login: who is signed in, with a way to sign out */}
          <p className="text-sm text-text-muted">
            Signed in as <span className="font-medium text-text-primary">{session.name}</span>
          </p>
          <button
            type="button"
            onClick={signOut}
            className="rounded-md px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            Sign out
          </button>
          {/* M12 secret-sauce: Settings (text size + colour theme) */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-haspopup="dialog"
            className="inline-flex items-center gap-2 rounded-md border border-border-input bg-surface-card px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-column focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <SettingsIcon />
            Settings
          </button>
          {/* M5 crud-modal: "+" button */}
          <button
            type="button"
            onClick={() => setEditing(blankTask())}
            className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-surface-card hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <span aria-hidden="true">+ </span>Add task
          </button>
        </div>
      </header>

      {/* TODO M11 anchors: render the Anchor Board (Presentation / Demo / Report / Documentation) above the board. */}
      <AnchorBoard anchors={anchors} onChange={setAnchors} gridColumns={gridColumns} />

      {/*
        TODO M4 data-model:
          Render a Kanban board with the four columns from STAGES.
          Each column should display the tasks whose status matches its id.
          Pre-populate 3-4 mock tasks so the board isn't empty on first load.

        TODO M5 crud-modal:
          Add a "+" button that opens a modal with every Task field.
          Clicking a card should open the same modal in edit mode.
      */}
      <main aria-label="Task board">
        {/* M12 secret-sauce: always say when tasks are hidden, with a one-click way back */}
        {myTasksOnly && (
          <div
            role="status"
            className="mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-primary bg-brand-primary-soft px-4 py-3"
          >
            <p className="text-sm text-text-primary">
              Showing only tasks assigned to <strong className="font-semibold">{currentRole}</strong>
              {hiddenCount > 0 && (
                <span className="text-text-muted">
                  {' '}
                  · {hiddenCount} other {hiddenCount === 1 ? 'task' : 'tasks'} hidden
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setMyTasksOnly(false)}
              className="rounded-md border border-brand-primary bg-surface-card px-3 py-1 text-sm font-medium text-brand-primary hover:bg-brand-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              Show all tasks
            </button>
          </div>
        )}
        {/* M12 secret-sauce: in Focus mode, tabs pick the one stage that is shown */}
        {focusMode && (
          <FocusStageTabs tasks={boardTasks} stage={currentFocusStage} onChange={setFocusStage} />
        )}
        <div
          {...(focusMode
            ? { id: 'focus-panel', role: 'tabpanel', 'aria-labelledby': `focus-tab-${currentFocusStage}` }
            : {})}
          className={focusMode ? 'mx-auto max-w-2xl' : `grid grid-cols-1 gap-4 ${gridColumns}`}
        >
        {visibleStages.map((stage) => {
          const stageTasks = boardTasks.filter((task) => task.status === stage.id);
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
                  {myTasksOnly ? 'None of your tasks here.' : 'No tasks here yet.'}
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
                        {/* M12 secret-sauce: "Hide extra card details" hides the description and context note */}
                        {!hideDetails && task.description && (
                          <p className="mt-1 break-words text-sm text-text-muted">
                            {task.description}
                          </p>
                        )}
                        {/* M9 context: shows which tasks already have a briefing */}
                        {!hideDetails && task.context && task.context.trim() && (
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
                            {task.contextTool && <span className="font-normal">· {task.contextTool}</span>}
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

                        {/* M12 secret-sauce: hand-off and copy stay available in the task modal when hidden here */}
                        {!hideDetails && (
                        <>
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
                        </>
                        )}
                      </article>
                    </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
        </div>
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

      {/* M12 secret-sauce: Settings dialog */}
      {settingsOpen && (
        <SettingsModal
          theme={theme}
          onThemeChange={setTheme}
          textSize={currentSize.id}
          onTextSizeChange={setTextSize}
          focusMode={focusMode}
          onFocusModeChange={setFocusMode}
          hideDetails={hideDetails}
          onHideDetailsChange={setHideDetails}
          myTasksOnly={myTasksOnly}
          onMyTasksOnlyChange={setMyTasksOnly}
          myRole={currentRole}
          onMyRoleChange={setMyRole}
          onReset={resetSettings}
          onClose={() => setSettingsOpen(false)}
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