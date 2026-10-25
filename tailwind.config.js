/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#5B3CC4',
          'primary-hover': '#4C2FA8',
          'primary-soft': '#EDE9FE',
          accent: '#0F766E',
        },
        surface: {
          page: '#F8FAFC',
          column: '#F1F5F9',
          card: '#FFFFFF',
        },
        border: {
          subtle: '#E2E8F0',
          input: '#64748B',
        },
        text: {
          primary: '#0F172A',
          muted: '#475569',
        },
        type: {
          feature: '#1D4ED8',
          'feature-soft': '#DBEAFE',
          'feature-text': '#1E40AF',
          bug: '#BE123C',
          'bug-soft': '#FFE4E6',
          'bug-text': '#9F1239',
        },
        due: {
          safe: '#15803D',
          'safe-soft': '#DCFCE7',
          'safe-text': '#166534',
          soon: '#A16207',
          'soon-soft': '#FEF9C3',
          'soon-text': '#854D0E',
          warning: '#B45309',
          'warning-soft': '#FEF3C7',
          'warning-text': '#92400E',
          overdue: '#B91C1C',
          'overdue-soft': '#FEE2E2',
          'overdue-text': '#991B1B',
          neutral: '#64748B',
          'neutral-soft': '#F1F5F9',
          'neutral-text': '#475569',
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