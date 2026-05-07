/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface': '#F8F9FA',
        'border': '#E8EAED',
        'primary': '#1A73E8',
        'secondary': '#34A853',
        'warning': '#FBBC04',
        'error': '#EA4335',
        'text-primary': '#202124',
        'text-secondary': '#5F6368',
        'code-bg': '#1E1E2E',
      },
    },
  },
  plugins: [],
}