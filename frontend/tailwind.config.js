/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      keyframes: {
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(20px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'modal-in': 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },

  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#4e45e8",
          secondary: "#6b5cff",
          accent: "#22c55e",
          neutral: "#1f2937",
          "base-100": "#f7f6f3",
          "base-200": "#0047AB",
          "base-300": "#e0ded9",
          "base-content": "#1f2937",
          info: "#38bdf8",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
          "--radius-box": "0.5rem",
          "--radius-field": "0.25rem",
          "--radius-selector": "1rem",
        },
       
      },
       {
      mythemeDark: {
        primary: "#4e45e8",
        secondary: "#6b5cff",
        accent: "#22c55e",

        neutral: "#111827",

        "base-100": "#0f172a",
        "base-200": "#111827",
        "base-300": "#1f2937",

        "base-content": "#f8fafc",

        info: "#38bdf8",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
      },
    },
      
      "light",
      "corporate",
      "dark",
    ],
  },
};
