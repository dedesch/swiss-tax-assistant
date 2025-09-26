/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'swiss-red': '#D00000',
        'alpine-blue': '#1E3A8A',
        'neutral-grey': '#6B7280',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}