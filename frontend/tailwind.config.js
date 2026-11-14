/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090909",
        panel: "#141414",
        raised: "#1D1D1D",
        line: "#303030",
        signal: "#E50914",
        "signal-deep": "#B20710",
        paper: "#F5F5F5",
        muted: "#929292",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
