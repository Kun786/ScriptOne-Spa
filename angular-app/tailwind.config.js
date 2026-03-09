/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: '#F3F1E7',
          dark: '#050505',
          accent: '#D97757',
          linkedin: '#0a66c2',
          surface: '#FFFFFF',
          'surface-dark': '#121212'
        }
      },
      fontFamily: {
        sans: ['Roboto Mono', 'monospace'],
        serif: ['Roboto Mono', 'monospace'],
        mono: ['Roboto Mono', 'monospace'],
      }
    }
  },
  plugins: [],
}
