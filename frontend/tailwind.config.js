/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f7931a',
          dark: '#e8840c',
          light: '#ffa733',
        },
        bitcoin: '#f7931a',
        background: '#0a0a0a',
        surface: {
          DEFAULT: '#1a1a1a',
          light: '#2a2a2a',
          dark: '#0f0f0f',
        },
        border: '#333333',
        text: {
          DEFAULT: '#ffffff',
          secondary: '#a0a0a0',
          muted: '#666666',
        },
      },
    },
  },
  plugins: [],
}

