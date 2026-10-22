/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        muted: "var(--muted)",
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
        },
        page: "var(--page)",
        surface: "var(--surface)",
        border: "var(--border)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        chart: "var(--chart)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        control: "var(--radius-control)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      maxWidth: {
        container: "var(--container)",
      },
      width: {
        sidebar: "var(--admin-sidebar)",
      },
    },
  },
  plugins: [],
}
