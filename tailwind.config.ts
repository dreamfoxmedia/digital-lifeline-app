import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0A2F63',
          dark: '#06204a',
          teal: '#00C2B2',
        },
      },
      keyframes: {
        pulse_red: {
          '0%, 100%': { backgroundColor: '#ef4444' },
          '50%': { backgroundColor: '#b91c1c' },
        },
      },
      animation: {
        pulse_red: 'pulse_red 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
