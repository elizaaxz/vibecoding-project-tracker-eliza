/** @type {import('tailwindcss').Config} */
// M12 secret-sauce: each colour reads from a CSS variable in src/themes.css,
// so the same class names (e.g. bg-brand-primary) change with the selected theme.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: token('brand-primary'),
          'primary-hover': token('brand-primary-hover'),
          'primary-soft': token('brand-primary-soft'),
          accent: token('brand-accent'),
        },
        surface: {
          page: token('surface-page'),
          column: token('surface-column'),
          card: token('surface-card'),
          overlay: token('surface-overlay'),
        },
        border: {
          subtle: token('border-subtle'),
          input: token('border-input'),
        },
        text: {
          primary: token('text-primary'),
          muted: token('text-muted'),
        },
        type: {
          feature: token('type-feature'),
          'feature-soft': token('type-feature-soft'),
          'feature-text': token('type-feature-text'),
          bug: token('type-bug'),
          'bug-soft': token('type-bug-soft'),
          'bug-text': token('type-bug-text'),
        },
        due: {
          safe: token('due-safe'),
          'safe-soft': token('due-safe-soft'),
          'safe-text': token('due-safe-text'),
          soon: token('due-soon'),
          'soon-soft': token('due-soon-soft'),
          'soon-text': token('due-soon-text'),
          warning: token('due-warning'),
          'warning-soft': token('due-warning-soft'),
          'warning-text': token('due-warning-text'),
          overdue: token('due-overdue'),
          'overdue-soft': token('due-overdue-soft'),
          'overdue-text': token('due-overdue-text'),
          neutral: token('due-neutral'),
          'neutral-soft': token('due-neutral-soft'),
          'neutral-text': token('due-neutral-text'),
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}