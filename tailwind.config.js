/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C1B19',
        paper: '#FAF9F6',
        coral: {
          DEFAULT: '#F04E37',
          dark: '#D63C27',
          light: '#FDEEEB',
        },
        amber: '#E0A458',
        line: '#E5E2DB',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
