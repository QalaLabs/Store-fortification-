import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#080d16',
          card: '#0d1524',
          'card-hover': '#121d31',
          elevated: '#152138',
          border: '#1b2a45',
          'border-light': '#24375a',
          text: '#f1f5f9',
          muted: '#94a3b8',
          subtle: '#64748b',
        },
        severity: {
          critical: '#ef4444',
          'critical-bg': 'rgba(239, 68, 68, 0.12)',
          'critical-border': 'rgba(239, 68, 68, 0.35)',
          high: '#f97316',
          'high-bg': 'rgba(249, 115, 22, 0.12)',
          'high-border': 'rgba(249, 115, 22, 0.35)',
          medium: '#eab308',
          'medium-bg': 'rgba(234, 179, 8, 0.12)',
          'medium-border': 'rgba(234, 179, 8, 0.35)',
          low: '#38bdf8',
          'low-bg': 'rgba(56, 189, 248, 0.12)',
          'low-border': 'rgba(56, 189, 248, 0.35)',
          info: '#818cf8',
          'info-bg': 'rgba(129, 140, 248, 0.12)',
          'info-border': 'rgba(129, 140, 248, 0.35)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
