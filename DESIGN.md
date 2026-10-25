# Vibecoding Project Tracker — Design

**Status:** Hackathon starter design doc · fill in the **`<TODO>`** sections before you tag `design-done`.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with.

Calm, organised and professional — a clean, distraction-free space where you can find the right task and its prompt context in seconds.

Two or three references that capture the vibe (links to dribbble shots, screenshots of apps you admire, Pinterest boards — anything visual):

- [Linear](https://linear.app/) — minimalist layout, clear hierarchy, restrained use of colour.
- [Notion](https://www.notion.so/) — clean typography and generous white space.
- [Trello](https://trello.com/) — the familiar Kanban board and card pattern.

Anti-references — what we are explicitly **not** trying to look like:

- Overcrowded dashboards, bright competing colours, heavy gradients, and low-contrast grey-on-grey text.

## 2. Color palette

These are the colors the build milestones will reference. Once chosen, paste the hex values into `tailwind.config.js` so the rest of the team can use Tailwind utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#5B3CC4` | Header, "+" button, focus rings |
| `brand-accent` | `#0F766E` | Highlights, hover states, links |
| `surface-page` | `#F8FAFC` | Page background |
| `surface-card` | `#FFFFFF` | Card background |
| `text-primary` | `#0F172A` | Body text |
| `text-muted` | `#475569` | Captions, dates, counts |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#1D4ED8` | Cards tagged `feature` (accent stripe + icon) |
| `type-bug` | `#BE123C` | Cards tagged `bug` (accent stripe + icon) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#15803D` | More than 2 days out |
| `due-warning` | `#B45309` | Less than 24 hours |
| `due-overdue` | `#B91C1C` | Past due |
| `due-neutral` | `#64748B` | Done (overrides date) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | Inter | Clean, modern letterforms give a clear hierarchy that is easy to scan. |
| Body | Inter | Designed for screens, with a tall x-height that stays readable at small sizes. |
| Monospace (tags, badges, code) | JetBrains Mono | Separates prompt and code content from interface text, with unambiguous characters (0/O, 1/l/I). |

Suggested sizes (override only if the design demands it):

- Page title: 24 px / semibold
- Section header: 16 px / semibold uppercase
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** White with a 1px light-grey border, rounded corners and a 4px coloured type stripe; shadow only on hover or keyboard focus.
- **Buttons:** Solid brand-primary fill with white text, clear text labels, rounded-md, and a visible 2px focus ring.
- **Modal:** Centred, max-width-lg, slate-900 backdrop at 50% opacity, labelled fields, focus trapped inside and Escape to close.
- **Empty states:** Dashed border, muted text and an inline "Add task" link.
- **Drag affordance (if used):** None required — tasks move via a keyboard-accessible status dropdown; drag-and-drop is optional extra only.

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | Add task |
| Empty column placeholder | No tasks here yet. |
| Toast after "Copy as Prompt Context" | Prompt context copied. Ready to paste into your AI tool. |
| Confirm-delete message | Delete this task? This can't be undone. |
| Handoff toast (M7 `task-owner`) | Task handed off to {name}. |

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** VibeTrack
- **Wordmark style:** "VibeTrack" in Inter Semibold, text-primary colour, with a small Lucide layout-grid icon in brand-primary.

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
  - **Exception (M12 `secret-sauce`):** a Dark theme is offered in the same colour-theme picker (not a separate toggle), using the same tokens; it passes WCAG 2.2 AA contrast.
- Multiple themes. One brand, applied consistently.
  - **Exception (M12 `secret-sauce`):** user-selectable colour themes added for accessibility — Default, Red-green safe (protanopia/deuteranopia), Blue-yellow safe (tritanopia), High contrast (low vision) and Dark. All use the same tokens via CSS variables in `src/themes.css`; every theme passes WCAG 2.2 AA contrast (High contrast passes AAA), and meaning is still never shown by colour alone.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-starter v1*