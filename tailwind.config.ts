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
        // CyFocus Theme System
        cyfocus: {
          bg: '#070505',
          sidebar: '#100E0D',
          surface: '#141211',
          elevated: '#1D1A19',
          'card-hover': '#221E1D',
          border: '#302A28',
          'border-light': '#3D3633',
          'border-highlight': '#4D4440',
          'text-primary': '#F3EEEC',
          'text-secondary': '#A79B96',
          'text-muted': '#756B67',
          'red-critical': '#A20903',
          'red-deep': '#5C1811',
          'green-forest': '#26502B',
          'warm-neutral': '#D0C4C0',
          'muted-rose': '#A2847B',
        },
        soc: {
          bg: '#070505',
          card: '#141211',
          'card-hover': '#201B1A',
          elevated: '#1D1A19',
          border: '#302A28',
          'border-light': '#3D3633',
          text: '#F3EEEC',
          muted: '#A79B96',
          subtle: '#756B67',
        },
        severity: {
          critical: '#A20903',
          'critical-bg': 'rgba(162, 9, 3, 0.16)',
          'critical-border': 'rgba(162, 9, 3, 0.45)',
          high: '#C2410C',
          'high-bg': 'rgba(194, 65, 12, 0.16)',
          'high-border': 'rgba(194, 65, 12, 0.45)',
          medium: '#D97706',
          'medium-bg': 'rgba(217, 119, 6, 0.16)',
          'medium-border': 'rgba(217, 119, 6, 0.45)',
          low: '#8A7E79',
          'low-bg': 'rgba(138, 126, 121, 0.16)',
          'low-border': 'rgba(138, 126, 121, 0.35)',
          info: '#A2847B',
          'info-bg': 'rgba(162, 132, 123, 0.16)',
          'info-border': 'rgba(162, 132, 123, 0.35)',
          success: '#26502B',
          'success-bg': 'rgba(38, 80, 43, 0.22)',
          'success-border': 'rgba(38, 80, 43, 0.5)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
