  /** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0F0F13",
          card: "#14141C",
        },
        primary: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
        },
        border: {
          glass: "rgba(255, 255, 255, 0.1)",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#94A3B8",
        }
      },
      borderRadius: {
        'lg': '1.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
