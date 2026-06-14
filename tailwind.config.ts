import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FFB454',
          dark: '#e09a3a',
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
