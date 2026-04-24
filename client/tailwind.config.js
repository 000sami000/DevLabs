/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gh: {
          bg: 'var(--gh-bg)',
          surface: 'var(--gh-surface)',
          border: 'var(--gh-border)',
          text: 'var(--gh-text)',
          muted: 'var(--gh-muted)',
          accent: 'var(--gh-accent)',
          danger: 'var(--gh-danger)',
          success: 'var(--gh-success)',
        },
        app: {
          bg: 'var(--app-bg)',
          elevated: 'var(--app-bg-elevated)',
          panel: 'var(--app-bg-panel)',
          soft: 'var(--app-bg-soft)',
          border: 'var(--app-border)',
          text: 'var(--app-text)',
          muted: 'var(--app-muted)',
          subtle: 'var(--app-subtle)',
          accent: 'var(--app-accent)',
          danger: 'var(--app-danger-text)',
          success: 'var(--gh-success)',
        },
        community: {
          bg: 'var(--community-bg)',
          surface: 'var(--community-surface)',
          panel: 'var(--community-panel)',
          border: 'var(--community-border)',
          text: 'var(--community-text)',
          muted: 'var(--community-muted)',
          accent: 'var(--community-accent)',
          danger: 'var(--community-danger)',
          success: 'var(--community-success)',
        },
      },
      borderRadius: {
        community: '0.75rem',
        'community-lg': '1rem',
      },
      boxShadow: {
        community: '0 14px 34px rgba(1, 4, 9, 0.36)',
      },
    },
  },
  plugins: [],
};
