import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#10B981',
          red: '#F43F5E',
          bvmac: '#3B82F6',
          brvm: '#F59E0B',
        },
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        'app-bg': 'var(--bg-app)',
        input: 'var(--bg-input)',
        border: 'var(--border-col)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
