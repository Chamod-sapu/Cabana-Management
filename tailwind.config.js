/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#137fec",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        charcoal: "#0f1721",
        "neon-blue": "#00f3ff",
        "neon-green": "#39ff14",
        "neon-rose": "#ff007f",
        "electric-blue": "#2b86ff"
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(43, 134, 255, 0.3)',
        'neon-green': '0 0 10px rgba(57, 255, 20, 0.3)',
        'neon-rose': '0 0 10px rgba(255, 0, 127, 0.3)',
        'neon': '0 0 15px rgba(43, 134, 255, 0.25)',
      }
    }
  },
  plugins: []
};
