/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'axim-gold': '#FFD700', // Slightly warmer gold
        'axim-purple': '#8A2BE2',
        'axim-teal': '#00E5FF',
        'bg-void': '#0A0A0A', // Slightly lighter to make colors pop more
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'glass': 'rgba(255, 255, 255, 0.02)',
      },
      borderColor: {
        'subtle': 'rgba(255, 255, 255, 0.08)',
        'active': 'rgba(255, 255, 255, 0.2)',
      }
    }
  },
  plugins: [],
}