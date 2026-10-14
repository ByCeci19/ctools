/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F5FA',
        accent: {
          DEFAULT: '#E5322D',
          dark: '#B71F1B',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 24, 40, 0.08), 0 4px 12px rgba(16, 24, 40, 0.06)',
      },
    },
  },
  plugins: [],
}
