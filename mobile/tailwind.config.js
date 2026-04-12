/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#c5522a",
        "brand-light": "#fff3ec",
        background: "#fafaf8",
        surface: "#ffffff",
        foreground: "#1a1510",
        muted: "#6b5a4e",
        border: "#e8e0d8",
      },
    },
  },
  plugins: [],
};
