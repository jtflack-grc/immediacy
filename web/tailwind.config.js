/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        war: {
          bg: "#020806",
          surface: "#030a08",
          border: "#0d0d0d",
          muted: "#737373",
          accent: "#6ee7b7",
          white: "#ffffff",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        mono: ["SF Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
