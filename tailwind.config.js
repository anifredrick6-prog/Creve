/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F2E28',
        paper: '#F5F3EC',
        teal: {
          DEFAULT: '#1B5E56',
          deep: '#0D3A34',
        },
        amber: '#E0A458',
        line: '#D8D3C4',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
