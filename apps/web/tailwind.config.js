/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base:     'var(--color-bg-base)',
          surface:  'var(--color-bg-surface)',
          elevated: 'var(--color-bg-elevated)',
        },
        content: {
          primary:   'var(--color-content-primary)',
          secondary: 'var(--color-content-secondary)',
          muted:     'var(--color-content-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover:   'var(--color-accent-hover)',
          dim:     'var(--color-accent-dim)',
        },
        gold: {
          DEFAULT: 'var(--color-gold)',
          dim:     'var(--color-gold-dim)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle:  'var(--color-border-subtle)',
        },
        danger:  'var(--color-danger)',
        success: 'var(--color-success)',
        board: {
          dark:  'var(--color-board-dark)',
          light: 'var(--color-board-light)',
        },
      },
    },
  },
  plugins: [],
};
