/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        "dark-primary": "#1d1e1c",
        "dark-secondary": "#373937",
        "dark-text-primary": "#ececec",
        "dark-text-secondary": "#bcbcbc",
      }
    },
  },
  plugins: [],
}